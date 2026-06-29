## ADDED Requirements

### Requirement: 三级优先级
待办支持低、中、高三档优先级。

#### Scenario: 设置优先级
- **WHEN** 用户添加或编辑待办时选择优先级
- **THEN** 待办记录 priority 字段为 0(低)、1(中)、2(高)

#### Scenario: 优先级视觉标识
- **WHEN** 待办列表渲染
- **THEN** 高优先级显示红色标记，中优先级显示黄色标记，低优先级显示灰色标记

### Requirement: 按优先级筛选
用户可按优先级筛选待办列表。

#### Scenario: 筛选高优先级
- **WHEN** 用户选择筛选"高优先级"
- **THEN** 列表仅显示 priority=2 的待办

### Requirement: 按优先级排序
用户可让待办按优先级排序显示。

#### Scenario: 优先级排序模式
- **WHEN** 用户切换到"按优先级排序"
- **THEN** 待办按 priority 降序排列（高→中→低），同优先级按 sortOrder 排列
