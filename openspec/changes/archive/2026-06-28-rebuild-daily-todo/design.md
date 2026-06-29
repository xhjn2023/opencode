## Context

当前《每日待办》（todos.html）依赖外部 Supabase 服务，UI 简陋。笔记模块（notes.html）已迁移至本地 Express + data.json。本次将待办模块同样迁至本地，并全面重构。

## Goals / Non-Goals

**Goals:**
- 在 server.js 中新增 `/api/todos` 和 `/api/categories` REST 端点，数据存于 data.json
- 重写 todos.html 为卡片风格 UI，配套 CSS 变量体系
- 实现优先级、分类、搜索筛选、重复待办、历史趋势
- data.json 格式迁移为多集合结构 `{notes, todos, categories}`

**Non-Goals:**
- 用户认证/登录
- 实时协同或 WebSocket 同步
- 移动端原生 App

## Decisions

### 1. data.json 多集合格式

**现状**: `data.json` 是顶层数组 `[note, ...]`
**改为**: `{ "notes": [...], "todos": [...], "categories": [...] }`

兼容处理: `readData()` 检测顶层是否为数组，若是则转换为 `{ notes: data, todos: [], categories: [] }`

### 2. Todo 数据模型

```json
{
  "id": "string (base36)",
  "date": "YYYY-MM-DD",
  "text": "string",
  "completed": false,
  "priority": 0,
  "categoryId": null,
  "sortOrder": 0,
  "repeatConfig": null,
  "created_at": "ISO string",
  "updated_at": "ISO string"
}
```

- `priority`: 0=低, 1=中, 2=高
- `categoryId`: 指向 categories.id，null 表示未分类
- `repeatConfig` 结构见下文

### 3. 重复待办机制

```json
{
  "type": "daily" | "weekday" | "weekly" | "monthly",
  "dayOfWeek": null | 0-6,
  "dayOfMonth": null | 1-31
}
```

- 含 repeatConfig 的 todo 为"模板"
- 加载某日期时，后端自动检测模板并惰性创建实例
- 实例通过 `templateId` 关联模板
- 已完成的实例记录 completed=true，下次不再重复生成

### 4. Category 数据模型

```json
{
  "id": "string (base36)",
  "name": "string",
  "color": "#hex",
  "icon": "fa-xxx",
  "sortOrder": 0,
  "created_at": "ISO string"
}
```

### 5. API 端点

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/todos?date=YYYY-MM-DD | 获取指定日期的待办（含自动生成重复实例） |
| POST | /api/todos | 创建待办 |
| PUT | /api/todos/:id | 更新待办（完成状态、文本、优先级等） |
| DELETE | /api/todos/:id | 删除待办 |
| PUT | /api/todos/:id/sort | 更新排序 |
| GET | /api/todos/history?days=30 | 获取历史完成率数据 |
| GET | /api/categories | 获取所有分类 |
| POST | /api/categories | 创建分类 |
| PUT | /api/categories/:id | 更新分类 |
| DELETE | /api/categories/:id | 删除分类 |

### 6. 前端 UI 架构

- 单页应用模式（纯 HTML/CSS/JS，与 notes.html 一致）
- CSS 变量体系（色板与 notes 统一但独立调色）
- 卡片式布局：日期选择 → 统计栏 → 筛选栏 → 待办列表
- 图表用纯 SVG 绘制，不引入第三方库

### 7. 历史趋势实现

- 后端: `GET /api/todos/history?days=N` 返回每日完成率
- 前端: SVG 绘制折线 + 柱状混合图
- 默认显示最近 14 天，可切换 7/14/30

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| data.json 格式变更破坏笔记功能 | readData() 检测旧格式做自动迁移 |
| 重复待办生成逻辑复杂 | 采用惰性实例化，仅加载日期时生成 |
| 无事务保障，并发写入可能丢失 | 单用户场景，Express 同步写文件足够 |
| 历史趋势数据随待办量增长 | 仅统计 completed/total 比率，量小无压力 |
