# ADR-001: 记账应用技术选型

## 状态
已接受

## 上下文
需要在现有项目中新增记账功能，包括收支记录、分类管理、统计图表和预算管理。项目当前使用 Express.js + PostgreSQL。

## 决策

### 后端
- **框架**: Express.js（延续现有项目技术栈）
- **数据库**: PostgreSQL（使用现有连接池，新增 ledger 和 budgets 表）
- **API 风格**: RESTful JSON API

### 前端
- **架构**: 单页 HTML 文件（延续 todos.html 模式）
- **样式**: CSS 变量系统（延续现有设计系统）
- **图标**: Font Awesome 6
- **图表**: Chart.js（轻量级图表库，CDN 引入）

### 数据模型

**transactions 表**
- id (TEXT PK), type (TEXT), amount (DECIMAL), category_id (TEXT FK)
- date (TEXT), note (TEXT), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)

**categories 表** — 扩展现有 categories 表，增加 type 字段区分收支分类

**budgets 表**
- id (TEXT PK), category_id (TEXT FK, nullable), month (TEXT), amount (DECIMAL)
- created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)

## 结果
- 沿用现有数据库连接和中间件，无需额外依赖
- 前端保持轻量，无需构建工具
- 与已有记事本、待办功能共享导航