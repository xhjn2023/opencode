# todo-repeat Specification

## Purpose
TBD - created by archiving change rebuild-daily-todo. Update Purpose after archive.
## Requirements
### Requirement: 设置重复规则
用户可为待办设置重复规则，支持每日、工作日、每周、每月四种类型。

#### Scenario: 设置每日重复
- **WHEN** 用户选择重复类型为"每天"
- **THEN** 待办的 repeatConfig.type 设为 "daily"

#### Scenario: 设置工作日重复
- **WHEN** 用户选择重复类型为"工作日"
- **THEN** 待办的 repeatConfig.type 设为 "weekday"

#### Scenario: 设置每周重复
- **WHEN** 用户选择重复类型为"每周"并指定星期几
- **THEN** 待办的 repeatConfig.type 设为 "weekly"，dayOfWeek 为 0-6

#### Scenario: 设置每月重复
- **WHEN** 用户选择重复类型为"每月"并指定日期
- **THEN** 待办的 repeatConfig.type 设为 "monthly"，dayOfMonth 为 1-31

### Requirement: 自动生成重复实例
系统在用户查看某日期时，自动为匹配的模板生成待办实例。

#### Scenario: 每日自动生成
- **WHEN** 用户查看任意日期且存在 type="daily" 的模板
- **THEN** 系统为该日期生成一个未完成的实例

#### Scenario: 工作日跳过周末
- **WHEN** 用户查看日期为周六或周日且存在 type="weekday" 的模板
- **THEN** 系统不生成实例

#### Scenario: 已完成实例不重复生成
- **WHEN** 某日期已有对应模板的完成实例
- **THEN** 系统不再生成新实例

### Requirement: 取消重复
用户可将重复待办改为普通待办。

#### Scenario: 取消重复
- **WHEN** 用户编辑待办并清除重复规则
- **THEN** 该待办的 repeatConfig 设为 null，变为普通待办

