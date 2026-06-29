# todo-crud Specification

## Purpose
TBD - created by archiving change rebuild-daily-todo. Update Purpose after archive.
## Requirements
### Requirement: 按日期查询待办
用户可按日期查询当天的待办事项列表，返回结果按 sortOrder 排序。

#### Scenario: 查询指定日期的待办
- **WHEN** 用户选择日期并查看待办列表
- **THEN** 系统返回该日期的所有待办事项，按 sortOrder 升序排列

#### Scenario: 自动生成重复实例
- **WHEN** 用户查询某日期且存在匹配的重复模板
- **THEN** 系统自动为该日期创建未完成的重复实例并返回

### Requirement: 创建待办
用户可添加新的待办事项，包含文字内容和可选属性。

#### Scenario: 创建基础待办
- **WHEN** 用户输入文字并点击添加
- **THEN** 系统创建待办并返回完整对象

#### Scenario: 创建待办含优先级和分类
- **WHEN** 用户选择优先级和分类后添加
- **THEN** 系统创建的待办包含所选 priority 和 categoryId

### Requirement: 更新待办
用户可修改待办的任意属性（文字、完成状态、优先级、分类等）。

#### Scenario: 切换完成状态
- **WHEN** 用户勾选/取消勾选待办
- **THEN** 系统更新 completed 状态并返回更新后的对象

#### Scenario: 编辑待办文字
- **WHEN** 用户双击待办文字进入编辑并保存
- **THEN** 系统更新 text 字段

### Requirement: 删除待办
用户可删除待办事项。

#### Scenario: 删除单个待办
- **WHEN** 用户点击删除按钮并确认
- **THEN** 系统删除该待办记录

#### Scenario: 删除重复模板
- **WHEN** 用户删除一个带 repeatConfig 的待办
- **THEN** 系统同时删除该模板的所有已生成实例

