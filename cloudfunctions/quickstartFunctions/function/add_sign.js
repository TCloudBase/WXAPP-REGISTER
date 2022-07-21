module.exports = async function (event, content, cloud) {
  const db = cloud.database()
  const _ = db.command
	const { id, input } = event.data || {}
  const OPENID = cloud.getWXContext().OPENID // 获取微信上下文
	const res = {}
	const checkflag = await seccheck(`${input.email};${input.name};${input.nickname}`,OPENID,cloud)
	if(checkflag==true){
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
	} else {
		res.code = -1
		res.msg = '提交的内容安全检测不通过，请检查后重新提交'
	}
  return res
}


async function seccheck(text,openid,cloud){
	try {
		console.log('检查字段',text)
    const result = await cloud.openapi.security.msgSecCheck({
      openid: openid,
      scene: 4,
      version: 2,
      content: text
		})
		console.log(result)
		if(result.result.label===100){
			return true
		} else {
			return false
		}
  } catch (err) {
		console.log(err.toString())
    return false
  }
}