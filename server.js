const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DATA_FILE = path.join(__dirname, 'data.json');
const useDb = !!process.env.DATABASE_URL;

let pool;
if (useDb) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
}

let nextId = Date.now();
function genId() { return (nextId++).toString(36); }

// ─── PG Init ───

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6366f1',
      icon TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT DEFAULT '无标题',
      content TEXT DEFAULT '',
      date TEXT DEFAULT '',
      tags JSONB DEFAULT '[]',
      pinned BOOLEAN DEFAULT false,
      archived BOOLEAN DEFAULT false,
      favorite BOOLEAN DEFAULT false,
      notebook TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      text TEXT DEFAULT '',
      completed BOOLEAN DEFAULT false,
      priority INTEGER DEFAULT 0,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      sort_order INTEGER DEFAULT 0,
      repeat_config JSONB,
      template_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('  PostgreSQL 表初始化完成');
}

if (useDb) initDb().catch(e => { console.error('  PG 初始化失败:', e.message); process.exit(1); });

// ─── File helpers ───

function readData() {
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (Array.isArray(raw)) return { notes: raw, todos: [], categories: [] };
    return { notes: raw.notes || [], todos: raw.todos || [], categories: raw.categories || [] };
  } catch (e) { return { notes: [], todos: [], categories: [] }; }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ─── Notes ───

app.get('/api/notes', async (req, res) => {
  try {
    if (useDb) {
      const { rows } = await pool.query('SELECT * FROM notes ORDER BY date DESC, created_at DESC');
      res.json(rows.map(r => ({ ...r, tags: r.tags || [] })));
    } else {
      let { notes } = readData();
      notes.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.created_at || '').localeCompare(a.created_at || ''));
      res.json(notes);
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/notes', async (req, res) => {
  try {
    if (useDb) {
      const id = genId();
      const { rows } = await pool.query(
        `INSERT INTO notes (id, title, content, date, tags, pinned, archived, favorite, notebook, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW()) RETURNING id`,
        [id, req.body.title || '无标题', req.body.content || '', req.body.date || new Date().toISOString().slice(0, 10),
         JSON.stringify(req.body.tags || []), false, false, false, req.body.notebook || '']
      );
      res.json({ id: rows[0].id, success: true });
    } else {
      let data = readData();
      let note = {
        id: genId(), title: req.body.title || '无标题', content: req.body.content || '',
        date: req.body.date || new Date().toISOString().slice(0, 10), tags: req.body.tags || [],
        pinned: false, archived: false, favorite: false, notebook: req.body.notebook || '',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      };
      data.notes.push(note);
      writeData(data);
      res.json({ id: note.id, success: true });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    if (useDb) {
      const sets = []; const vals = []; let i = 1;
      ['title','content','tags','pinned','archived','favorite','notebook'].forEach(k => {
        if (req.body[k] !== undefined) { sets.push(`${k === 'tags' ? k : k}=$${i++}`); vals.push(k === 'tags' ? JSON.stringify(req.body[k]) : req.body[k]); }
      });
      if (!sets.length) return res.json({ success: true });
      vals.push(req.params.id);
      await pool.query(`UPDATE notes SET ${sets.join(',')}, updated_at=NOW() WHERE id=$${i}`, vals);
      res.json({ success: true });
    } else {
      let data = readData();
      let idx = data.notes.findIndex(n => n.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'not found' });
      let note = data.notes[idx];
      ['title','content','tags','pinned','archived','favorite','notebook'].forEach(k => {
        if (req.body[k] !== undefined) note[k] = req.body[k];
      });
      note.updated_at = new Date().toISOString();
      writeData(data);
      res.json({ success: true });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    if (useDb) {
      await pool.query('DELETE FROM notes WHERE id=$1', [req.params.id]);
    } else {
      let data = readData();
      data.notes = data.notes.filter(n => n.id !== req.params.id);
      writeData(data);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Todos ───

function shouldGenerateRepeat(cfg, date) {
  if (!cfg) return false;
  const d = new Date(date + 'T00:00:00');
  const dayOfWeek = d.getDay();
  const dayOfMonth = d.getDate();
  switch (cfg.type) {
    case 'daily': return true;
    case 'weekday': return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekly': return cfg.dayOfWeek === dayOfWeek;
    case 'monthly': return cfg.dayOfMonth === dayOfMonth;
    default: return false;
  }
}

app.get('/api/todos', async (req, res) => {
  try {
    let date = req.query.date;
    if (!date) {
      if (useDb) { const { rows } = await pool.query('SELECT * FROM todos ORDER BY sort_order'); return res.json(rows.map(mapTodo)); }
      const data = readData(); return res.json(data.todos);
    }
    if (useDb) {
      let { rows: todos } = await pool.query('SELECT * FROM todos WHERE date=$1 ORDER BY sort_order', [date]);
      let { rows: templates } = await pool.query('SELECT * FROM todos WHERE repeat_config IS NOT NULL AND (date IS NULL OR date=$1)', [date]);
      for (const tmpl of templates) {
        if (shouldGenerateRepeat(tmpl.repeat_config, date)) {
          const { rows: exist } = await pool.query('SELECT 1 FROM todos WHERE template_id=$1 AND date=$2', [tmpl.id, date]);
          if (!exist.length) {
            const id = genId();
            await pool.query(
              `INSERT INTO todos (id, date, text, completed, priority, category_id, sort_order, repeat_config, template_id, created_at, updated_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,NULL,$8,NOW(),NOW())`,
              [id, date, tmpl.text, false, tmpl.priority, tmpl.category_id, tmpl.sort_order, tmpl.id]
            );
            const { rows: [inst] } = await pool.query('SELECT * FROM todos WHERE id=$1', [id]);
            todos.push(inst);
          }
        }
      }
      res.json(todos.map(mapTodo));
    } else {
      let data = readData();
      let todos = data.todos.filter(t => t.date === date);
      let templates = data.todos.filter(t => t.repeatConfig && !t.date);
      for (let tmpl of templates) {
        if (shouldGenerateRepeat(tmpl.repeatConfig, date)) {
          if (!data.todos.some(t => t.templateId === tmpl.id && t.date === date)) {
            let inst = { ...tmpl, id: genId(), date, completed: false, templateId: tmpl.id, repeatConfig: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            data.todos.push(inst); todos.push(inst);
          }
        }
      }
      if (templates.length) writeData(data);
      todos.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      res.json(todos);
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/todos', async (req, res) => {
  try {
    if (useDb) {
      const id = genId();
      const { rows: [{ count }] } = await pool.query('SELECT COUNT(*)::int FROM todos WHERE date=$1', [req.body.date]);
      const { rows } = await pool.query(
        `INSERT INTO todos (id, date, text, completed, priority, category_id, sort_order, repeat_config, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,NOW(),NOW()) RETURNING *`,
        [id, req.body.date || new Date().toISOString().slice(0, 10), req.body.text || '', false,
         req.body.priority ?? 0, req.body.categoryId || null, count,
         req.body.repeatConfig ? JSON.stringify(req.body.repeatConfig) : null]
      );
      res.json(mapTodo(rows[0]));
    } else {
      let data = readData();
      let todo = {
        id: genId(), date: req.body.date || new Date().toISOString().slice(0, 10), text: req.body.text || '',
        completed: false, priority: req.body.priority ?? 0, categoryId: req.body.categoryId || null,
        sortOrder: data.todos.filter(t => t.date === req.body.date).length,
        repeatConfig: req.body.repeatConfig || null, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      };
      data.todos.push(todo); writeData(data);
      res.json(todo);
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    if (useDb) {
      const fields = { text: null, completed: null, priority: null, category_id: null, sort_order: null, repeat_config: null };
      const sets = []; const vals = []; let i = 1;
      Object.entries(fields).forEach(([col]) => {
        const bodyKey = col === 'category_id' ? 'categoryId' : col === 'sort_order' ? 'sortOrder' : col === 'repeat_config' ? 'repeatConfig' : col;
        if (req.body[bodyKey] !== undefined) {
          sets.push(`${col}=$${i++}`);
          vals.push(col === 'repeat_config' ? (req.body[bodyKey] ? JSON.stringify(req.body[bodyKey]) : null) : req.body[bodyKey]);
        }
      });
      if (!sets.length) return res.json({ success: true });
      vals.push(req.params.id);
      const { rows } = await pool.query(`UPDATE todos SET ${sets.join(',')}, updated_at=NOW() WHERE id=$${i} RETURNING *`, vals);
      res.json(mapTodo(rows[0]));
    } else {
      let data = readData();
      let idx = data.todos.findIndex(t => t.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'not found' });
      let todo = data.todos[idx];
      ['text','completed','priority','categoryId','sortOrder','repeatConfig'].forEach(k => {
        if (req.body[k] !== undefined) todo[k] = req.body[k];
      });
      todo.updated_at = new Date().toISOString();
      writeData(data);
      res.json(todo);
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    if (useDb) {
      const { rows: [todo] } = await pool.query('SELECT repeat_config FROM todos WHERE id=$1', [req.params.id]);
      if (!todo) return res.status(404).json({ error: 'not found' });
      await pool.query('DELETE FROM todos WHERE id=$1', [req.params.id]);
      if (todo.repeat_config) {
        await pool.query('DELETE FROM todos WHERE template_id=$1', [req.params.id]);
      }
    } else {
      let data = readData();
      let todo = data.todos.find(t => t.id === req.params.id);
      if (!todo) return res.status(404).json({ error: 'not found' });
      data.todos = data.todos.filter(t => t.id !== req.params.id);
      if (todo.repeatConfig) data.todos = data.todos.filter(t => t.templateId !== req.params.id);
      writeData(data);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/todos/:id/sort', async (req, res) => {
  try {
    if (useDb) {
      for (const item of req.body) {
        await pool.query('UPDATE todos SET sort_order=$1, updated_at=NOW() WHERE id=$2', [item.sortOrder, item.id]);
      }
    } else {
      let data = readData();
      for (const item of req.body) {
        let t = data.todos.find(x => x.id === item.id);
        if (t) t.sortOrder = item.sortOrder;
      }
      writeData(data);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/todos/history', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 14;
    if (useDb) {
      const { rows } = await pool.query(`
        SELECT d::text AS date, COUNT(t.*)::int AS total, COUNT(t.*) FILTER (WHERE t.completed)::int AS done
        FROM generate_series(CURRENT_DATE - $1::int + 1, CURRENT_DATE, '1 day') d
        LEFT JOIN todos t ON t.date = d::text
        GROUP BY d ORDER BY d
      `, [days]);
      res.json(rows.map(r => ({ date: r.date, total: r.total, done: r.done, rate: r.total ? Math.round(r.done / r.total * 100) : 0 })));
    } else {
      let data = readData();
      let result = [];
      let now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        let d = new Date(now); d.setDate(d.getDate() - i);
        let dateStr = d.toISOString().slice(0, 10);
        let dayTodos = data.todos.filter(t => t.date === dateStr);
        let total = dayTodos.length;
        let done = dayTodos.filter(t => t.completed).length;
        result.push({ date: dateStr, total, done, rate: total ? Math.round(done / total * 100) : 0 });
      }
      res.json(result);
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Categories ───

app.get('/api/categories', async (req, res) => {
  try {
    if (useDb) {
      const { rows } = await pool.query('SELECT * FROM categories ORDER BY sort_order');
      return res.json(rows.map(mapCategory));
    }
    let data = readData();
    res.json(data.categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/categories', async (req, res) => {
  try {
    if (useDb) {
      const { rows: [{ count }] } = await pool.query('SELECT COUNT(*)::int FROM categories');
      const { rows } = await pool.query(
        'INSERT INTO categories (id, name, color, icon, sort_order, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *',
        [genId(), req.body.name || '未命名', req.body.color || '#3b82f6', req.body.icon || '', count]
      );
      return res.json(mapCategory(rows[0]));
    }
    let data = readData();
    let cat = { id: genId(), name: req.body.name || '未命名', color: req.body.color || '#3b82f6', icon: req.body.icon || '', sortOrder: data.categories.length, created_at: new Date().toISOString() };
    data.categories.push(cat); writeData(data);
    res.json(cat);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    if (useDb) {
      const sets = []; const vals = []; let i = 1;
      ['name','color','icon','sort_order'].forEach(col => {
        const key = col === 'sort_order' ? 'sortOrder' : col;
        if (req.body[key] !== undefined) { sets.push(`${col}=$${i++}`); vals.push(req.body[key]); }
      });
      if (!sets.length) return res.json({ success: true });
      vals.push(req.params.id);
      const { rows } = await pool.query(`UPDATE categories SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
      return res.json(mapCategory(rows[0]));
    }
    let data = readData();
    let idx = data.categories.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    let cat = data.categories[idx];
    ['name','color','icon','sortOrder'].forEach(k => { if (req.body[k] !== undefined) cat[k] = req.body[k]; });
    writeData(data);
    res.json(cat);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    if (useDb) {
      await pool.query('UPDATE todos SET category_id=NULL WHERE category_id=$1', [req.params.id]);
      await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
    } else {
      let data = readData();
      data.categories = data.categories.filter(c => c.id !== req.params.id);
      data.todos.forEach(t => { if (t.categoryId === req.params.id) t.categoryId = null; });
      writeData(data);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Helpers ───

function mapTodo(r) {
  if (!r) return r;
  return { id: r.id, date: r.date, text: r.text, completed: r.completed, priority: r.priority, categoryId: r.category_id, sortOrder: r.sort_order, repeatConfig: r.repeat_config, templateId: r.template_id, created_at: r.created_at, updated_at: r.updated_at };
}

function mapCategory(r) {
  if (!r) return r;
  return { id: r.id, name: r.name, color: r.color, icon: r.icon, sortOrder: r.sort_order, created_at: r.created_at };
}

// ─── Health ───

app.get('/api/health', async (req, res) => {
  try {
    if (useDb) {
      const { rows: [{ notes, todos, categories }] } = await pool.query(
        `SELECT (SELECT COUNT(*) FROM notes)::int AS notes, (SELECT COUNT(*) FROM todos)::int AS todos, (SELECT COUNT(*) FROM categories)::int AS categories`
      );
      res.json({ status: 'ok', notes, todos, categories, db: 'postgresql', time: new Date().toISOString() });
    } else {
      let data = readData();
      res.json({ status: 'ok', notes: data.notes.length, todos: data.todos.length, categories: data.categories.length, db: 'file', time: new Date().toISOString() });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Redirects ───

app.get('/todos', (req, res) => res.sendFile(path.join(__dirname, 'todos.html')));
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, 'notes.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'sleep-tracker.html')));

// ─── Static ───

app.use(express.static(__dirname));

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`\n  Notes & Todos API 服务已启动`);
  console.log(`  \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
  if (useDb) console.log(`  数据库: PostgreSQL (DATABASE_URL)`);
  else console.log(`  数据文件: ${DATA_FILE}`);
  console.log(`  按 Ctrl+C 停止\n`);
});
