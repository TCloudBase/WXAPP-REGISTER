module.exports = async function (event, content, cloud) {
  const db = cloud.database()
  const _ = db.command
  const { id, input } = event.data || {}
  const OPENID = cloud.getWXContext().OPENID // 获取微信上下文
  const res = {}
  await db.collection('mp_register_user').doc(OPENID).update({
    data: {
      [id]: _.set({
        open: 1,
        info: input,
        time: new Date(new Date().getTime() + 8 * 3600000)
      })
    }
  })
  res.code = 0
  return res
}
