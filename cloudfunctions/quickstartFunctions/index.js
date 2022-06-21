const cloud = require('wx-server-sdk') // 云开发服务端SDK引入
cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
})
const db = cloud.database()
const name = 'register' // 该模版的标识
exports.main = async (event, context) => {
  const type = event.type || 'get_project' // 默认的执行方法
  const res = { name }
  // 预置创建集合，如果存在则自动失败跳过，自己上架时可以去掉
  try { await db.createCollection('mp_register_user'); await db.createCollection('mp_register_project') } catch (e) {}
  try {
		// 尝试执行执行方法，直接通过名称读取文件，获取其中的执行函数
    res.data = await require(`./function/${type}`)(event, context, cloud)
  } catch (e) {
    res.errmsg = e.toString()
    res.data = false
  }
  return res
}
