## 1. data.json 格式迁移 & 工具函数

- [ ] 1.1 修改 server.js 的 readData/writeData 支持 `{notes, todos, categories}` 多集合格式，兼容旧数组格式
- [ ] 1.2 更新 notes 相关路由从 `data.notes` 而非顶层数组读写
- [ ] 1.3 在 data.json 中初始化 `{"notes":[],"todos":[],"categories":[]}`

## 2. 后端 API — Todo CRUD

- [ ] 2.1 GET /api/todos?date=YYYY-MM-DD — 按日期查询待办，自动生成重复实例
- [ ] 2.2 POST /api/todos — 创建待办（含 priority / categoryId / repeatConfig）
- [ ] 2.3 PUT /api/todos/:id — 更新待办属性（text / completed / priority / categoryId / repeatConfig / sortOrder）
- [ ] 2.4 DELETE /api/todos/:id — 删除待办（若是模板，级联删除实例）

## 3. 后端 API — 分类管理 & 历史趋势

- [ ] 3.1 GET /api/categories — 获取所有分类
- [ ] 3.2 POST /api/categories — 创建分类
- [ ] 3.3 PUT /api/categories/:id — 更新分类
- [ ] 3.4 DELETE /api/categories/:id — 删除分类（关联 todo 的 categoryId 置 null）
- [ ] 3.5 GET /api/todos/history?days=N — 返回每日完成率数据

## 4. 前端 UI — 基础框架 & 卡片风格

- [ ] 4.1 重写 todos.html 骨架：CSS 变量体系、响应式布局、导航链接
- [ ] 4.2 日期选择器 + 添加待办输入行（含优先级和分类下拉）
- [ ] 4.3 统计栏（总计 / 已完成 / 待完成 / 完成率）
- [ ] 4.4 待办卡片列表渲染（卡片样式、复选框、操作按钮）

## 5. 前端 — 优先级 & 分类展示

- [ ] 5.1 优先级视觉标识（高=红 / 中=黄 / 低=灰）
- [ ] 5.2 分类颜色条 + 名称展示
- [ ] 5.3 分类管理弹窗（创建/编辑/删除分类）
- [ ] 5.4 优先级和分类选择器在添加/编辑时可用

## 6. 前端 — 搜索/筛选

- [ ] 6.1 搜索输入框（实时按文字过滤）
- [ ] 6.2 状态筛选按钮组（全部 / 待完成 / 已完成）
- [ ] 6.3 优先级筛选下拉
- [ ] 6.4 分类筛选下拉
- [ ] 6.5 组合筛选逻辑（多条件叠加）

## 7. 前端 — 重复待办

- [ ] 7.1 添加/编辑待办时显示重复类型选择器（每天 / 工作日 / 每周 / 每月）
- [ ] 7.2 每周选择星期几 / 每月选择日期
- [ ] 7.3 列表中的重复待办显示重复图标标识

## 8. 前端 — 历史趋势图表

- [ ] 8.1 历史趋势面板切换（嵌入或弹窗）
- [ ] 8.2 SVG 柱状+折线混合图渲染
- [ ] 8.3 时间范围切换（7天 / 14天 / 30天）
- [ ] 8.4 悬停 Tooltip 显示详情

## 9. 清理 & 验证

- [ ] 9.1 测试完整 CRUD 流程
- [ ] 9.2 测试重复待办生成逻辑
- [ ] 9.3 测试组合筛选
- [ ] 9.4 测试笔记模块不受影响
