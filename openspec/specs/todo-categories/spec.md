# todo-categories Specification

## Purpose
TBD - created by archiving change rebuild-daily-todo. Update Purpose after archive.
## Requirements
### Requirement: 管理分类
用户可创建、编辑、删除自定义分类。

#### Scenario: 创建分类
- **WHEN** 用户输入分类名称并选择颜色
- **THEN** 系统创建新分类并返回

#### Scenario: 编辑分类
- **WHEN** 用户修改分类的名称或颜色
- **THEN** 系统更新分类属性

#### Scenario: 删除分类
- **WHEN** 用户删除一个分类
- **THEN** 系统删除该分类，关联的待办的 categoryId 置为 null

### Requirement: 分类展示
待办卡片上显示所属分类的颜色标记和名称。

#### Scenario: 卡片显示分类标记
- **WHEN** 待办有分类
- **THEN** 卡片左侧显示分类颜色条，文字显示分类名称

#### Scenario: 未分类待办
- **WHEN** 待办无分类
- **THEN** 卡片不显示分类标记

