## ADDED Requirements

### Requirement: 历史完成率数据
后端提供指定天数内的每日完成率数据。

#### Scenario: 获取历史数据
- **WHEN** 前端请求 GET /api/todos/history?days=14
- **THEN** 返回数组，每项包含 `{date, total, done, rate}`

#### Scenario: 默认数据范围
- **WHEN** 用户首次查看趋势图
- **THEN** 默认显示最近 14 天数据

### Requirement: 趋势图展示
前端以图表形式展示历史完成率趋势。

#### Scenario: 绘制柱状混合图
- **WHEN** 用户切换到趋势面板
- **THEN** 显示 SVG 图表，X 轴为日期，Y 轴为完成率，柱状展示每日数据，折线展示趋势

#### Scenario: 切换时间范围
- **WHEN** 用户点击 7天 / 14天 / 30天 按钮
- **THEN** 图表更新为对应时间范围的数据

#### Scenario: 图表交互
- **WHEN** 用户鼠标悬停在某日柱状图上
- **THEN** 显示 Tooltip：日期、完成数/总数、完成率
