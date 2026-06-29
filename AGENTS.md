# AGENTS.md

## 项目信息
项目名：t1
技术栈：SpringBoot3 + MyBatis-Plus + MySQL8 + SpringCloud Gateway + Vue3 + TS + Vite

## 编码规则
1. 变量小驼峰，类大驼峰，数据库下划线命名
2. 后端统一返回格式：{code, msg, data, timestamp}
3. 分页固定结构：total、records、pageNum、pageSize
4. 全局异常统一处理，禁止裸抛异常
5. SQL禁止select *，必须逻辑删除字段

## OpenSpec 规则
所有新功能必须用 /opsx:new 创建变更，核对需求文档后再编码；开发完成校验归档，沉淀系统规范。

## Git规范
commit格式：feat/fix/docs/refactor + 简短说明
分支：feature/xxx、fix/xxx
