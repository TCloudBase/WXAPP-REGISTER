module.exports = async function (event, content, cloud) {
  const db = cloud.database()
  const { id, openid, status } = event.data || {}
  const res = {}
  const OPENID = cloud.getWXContext().OPENID // 获取微信上下文
  const data = (await db.collection('mp_register_project').doc(id).field({
    openid: true
  }).get()).data
  if (data.openid === OPENID) {
    res.msg = await db.collection('mp_register_user').doc(openid).update({
      data: {
        [id]: {
          open: status
        }
      }
    })
    res.code = 0
  }
  return res
}
