# ADR-002: 记账 API 设计

## 状态
已接受

## 上下文
需要为记账功能设计 RESTful API，支持交易 CRUD、统计查询和预算管理。

## 决策

### 交易 API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/transactions | 交易列表，支持 date, category_id, type, search 查询参数 |
| POST | /api/transactions | 新增交易 |
| PUT | /api/transactions/:id | 更新交易 |
| DELETE | /api/transactions/:id | 删除交易 |

### 统计 API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/transactions/stats/overview | 总览：总收入、总支出、余额 |
| GET | /api/transactions/stats/trends?months=6 | 月度收支趋势 |
| GET | /api/transactions/stats/by-category?month=YYYY-MM | 分类支出占比 |

### 预算 API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/budgets?month=YYYY-MM | 获取某月预算列表及执行情况 |
| POST | /api/budgets | 创建/更新预算 |
| DELETE | /api/budgets/:id | 删除预算 |

### 分类扩展
在现有 /api/categories 基础上，为 category 增加 type 字段：
- type: "income" | "expense" | "all"

## 结果
- API 路径统一在 /api/ 下，与现有笔记、待办 API 风格一致
- 交易统计使用独立路径，避免与 CRUD 混淆
- 预算与交易分离，但通过 category_id 关联