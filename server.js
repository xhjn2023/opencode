const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch(e) { return []; }
}

function writeData(notes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf8');
}

let nextId = Date.now();
function genId() { return (nextId++).toString(36); }

// ─── API ───

// 获取所有笔记
app.get('/api/notes', (req, res) => {
  try {
    let notes = readData();
    notes.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.created_at || '').localeCompare(a.created_at || ''));
    res.json(notes);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 创建笔记
app.post('/api/notes', (req, res) => {
  try {
    let notes = readData();
    let note = {
      id: genId(),
      title: req.body.title || '无标题',
      content: req.body.content || '',
      date: req.body.date || new Date().toISOString().slice(0, 10),
      tags: req.body.tags || [],
      pinned: false,
      archived: false,
      favorite: false,
      notebook: req.body.notebook || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    notes.push(note);
    writeData(notes);
    res.json({ id: note.id, success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 更新笔记
app.put('/api/notes/:id', (req, res) => {
  try {
    let notes = readData();
    let idx = notes.findIndex(n => n.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    let note = notes[idx];
    if (req.body.title !== undefined) note.title = req.body.title;
    if (req.body.content !== undefined) note.content = req.body.content;
    if (req.body.tags !== undefined) note.tags = req.body.tags;
    if (req.body.pinned !== undefined) note.pinned = req.body.pinned;
    if (req.body.archived !== undefined) note.archived = req.body.archived;
    if (req.body.favorite !== undefined) note.favorite = req.body.favorite;
    if (req.body.notebook !== undefined) note.notebook = req.body.notebook;
    note.updated_at = new Date().toISOString();
    notes[idx] = note;
    writeData(notes);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 删除笔记
app.delete('/api/notes/:id', (req, res) => {
  try {
    let notes = readData().filter(n => n.id !== req.params.id);
    writeData(notes);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', notes: readData().length, time: new Date().toISOString() });
});

// 静态文件
app.use(express.static(__dirname));

// 启动
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`\n  Notes API 服务已启动`);
  console.log(`  \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
  console.log(`  API: \x1b[36mhttp://localhost:${PORT}/api/notes\x1b[0m`);
  console.log(`  数据文件: ${DATA_FILE}`);
  console.log(`  按 Ctrl+C 停止\n`);
});
