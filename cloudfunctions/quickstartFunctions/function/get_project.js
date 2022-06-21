const {
  initinfo
} = require('../data/project')
module.exports = async function (event, content, cloud) {
  const db = cloud.database()
  const _ = db.command
  const {
    id
  } = event.data || {}
  const res = {}
  const OPENID = cloud.getWXContext().OPENID // 获取微信上下文
  const data = (await db.collection('mp_register_project').where({
    _id: id || 'INIT'
  }).get()).data
  if (data.length !== 0) {
    res.sign_num = (await db.collection('mp_register_user').where({
      [id || 'INIT']: {
        open: _.in([1, 2, 3])
      }
    }).count()).total
    res.code = 0
    res.data = data[0]
  } else if ((id || 'INIT') === 'INIT') {
    await db.collection('mp_register_project').doc('INIT').set({
      data: initinfo
    })
    res.code = 0
    res.sign_num = 0
    res.data = {
      _id: 'INIT',
      ...initinfo
    }
  } else {
    res.code = 1
    res.msg = '没有找到对应的活动'
  }
  res.userid = OPENID
  try {
    const userinfo = await db.collection('mp_register_user').doc(OPENID).field({
      [id || 'INIT']: true
    }).get()
    res.user = userinfo.data[id || 'INIT'] || {
      open: 0
    }
  } catch (e) {
    await db.collection('mp_register_user').doc(OPENID).set({
      data: {
        [id || 'INIT']: {
          open: 0
        }
      }
    })
    res.user = {
      open: 0
    }
  }
  return res
}
