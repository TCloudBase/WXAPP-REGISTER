module.exports = async function (event, content, cloud) {
  const db = cloud.database()
  const _ = db.command
  const { id } = event.data || {}
  const res = {}
  const OPENID = cloud.getWXContext().OPENID // 获取微信上下文
  const data = (await db.collection('mp_register_project').doc(id).field({
    openid: true
  }).get()).data
  res.admin = (data.openid === OPENID)
  const list = (await db.collection('mp_register_user').where({
    [id]: {
      open: _.in([1, 2, 3])
    }
  }).field({
    [id]: true
  }).get()).data
  res.list = {}
  list.forEach(item => {
    res.list[item._id] = item[id]
  })
  return res
}
