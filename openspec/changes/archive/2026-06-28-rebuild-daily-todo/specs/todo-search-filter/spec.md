## ADDED Requirements

### Requirement: 文字搜索
用户可通过关键词搜索待办内容。

#### Scenario: 搜索匹配
- **WHEN** 用户在搜索框输入关键词
- **THEN** 列表实时过滤，仅显示 text 包含关键词的待办

#### Scenario: 搜索清空
- **WHEN** 用户清空搜索框
- **THEN** 列表恢复显示当前筛选条件下的全部待办

### Requirement: 状态筛选
用户可按完成状态筛选待办。

#### Scenario: 筛选待完成
- **WHEN** 用户选择"待完成"
- **THEN** 列表仅显示 completed=false 的待办

#### Scenario: 筛选已完成
- **WHEN** 用户选择"已完成"
- **THEN** 列表仅显示 completed=true 的待办

### Requirement: 组合筛选
搜索、状态筛选、优先级筛选、分类筛选可叠加使用。

#### Scenario: 多维度组合筛选
- **WHEN** 用户同时选择"待完成"+"高优先级"+分类A 并输入搜索词
- **THEN** 列表同时满足所有条件
