module.exports = async function (event, content, cloud) {
  const db = cloud.database()
  const _ = db.command
  const { id } = event.data || {}
  const OPENID = cloud.getWXContext().OPENID // 获取微信上下文
  const res = {}
  await db.collection('mp_register_user').doc(OPENID).update({
    data: {
      [id]: _.remove()
    }
  })
  res.code = 0
  return res
}
