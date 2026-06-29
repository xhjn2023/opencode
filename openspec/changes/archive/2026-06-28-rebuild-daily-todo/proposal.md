## Why

当前的待办页面（todos.html）依赖外部 Supabase 服务，UI 风格简陋且与笔记模块不统一。需要将其迁移到本地 Express API + JSON 文件存储，同时重构为清爽的卡片风格 UI，并增加多项实用功能，提升日常使用体验。

## What Changes

- **迁移后端**：在 server.js 中新增 `/api/todos` 全套 CRUD 端点，数据存储于 data.json
- **重构前端**：重写 todos.html，采用卡片式 UI 风格（与 notes.html 统一的 CSS 变量体系）
- **新增能力**：
  - 优先级标签（高/中/低）
  - 分类/清单管理（用户自定义分类）
  - 搜索/筛选（文字搜索 + 状态/优先级/分类筛选）
  - 重复待办（模板体系，支持每日/工作日/每周/每月重复）
  - 历史趋势（最近 7/14/30 天的完成率图表）
- **数据模型变更**：`data.json` 中新增 `todos` 和 `categories` 集合

## Capabilities

### New Capabilities
- `todo-crud`: 本地化待办事项 CRUD，支持日期维度增删改查
- `todo-categories`: 分类/清单管理，支持自定义创建、编辑、删除
- `todo-priority`: 三级优先级标签（高/中/低）
- `todo-repeat`: 重复待办模板体系，支持每日/工作日/每周/每月
- `todo-search-filter`: 多维度搜索与筛选功能
- `todo-history-trends`: 历史完成率趋势统计与可视化

### Modified Capabilities

<!-- 无已有的 specs 需要修改 -->

## Impact

- `server.js`：新增 todo 和 category 的 REST API 路由
- `todos.html`：整体重写，替换为卡片风格 UI + 新功能
- `data.json`：数据结构扩展，新增 todos/categories 节点
- `netlify.toml`：无需改动（已有 `/todos` 重定向）
