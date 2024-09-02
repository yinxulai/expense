// 套餐
// 订阅、一次性、活动都是这里管理，通过规则引擎进行编辑
// 规则引擎输入为计费项信息，输出为费用金额
// 规则必须包含版本信息
// 规则无法删除和修改
// 规则与用户有绑定关系
// 规则存在生效、失效日期（必须以天为单位）

export { createUserRouter } from './router'
export { UserService, createUserService } from './service'
