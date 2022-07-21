const defaultavatar = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const app = getApp() // 全局APP
let that = null // 页面this指针
Page({
  data: {
    project: {},
    input: {},
    form: {
      show: false
    }
  },
  /**
   * 页面加载
   */
  onLoad (options) {
    that = this // 页面this指向指针变量
    that.id = options.id
    wx.startPullDownRefresh()

    // that.init() // 初始化
  },
  onPullDownRefresh () {
    that.init()
  },
  /**
   * 初始化加载信息
   */
  async init () {
    const { code, data, user, userid, msg, sign_num } = await app.call({ name: 'get_project', data: { id: that.id } })
    if (code === 0) {
      app.project = data
      that.userid = userid
      const stylecss = app.pagestyleinit(app.project)
      const inputs = {}
      for (const item of app.project.form) {
        if (item.type === 'avatar') {
          inputs[item.id] = user?.info?.[item.id] || defaultavatar
        } else {
          inputs[item.id] = user?.info?.[item.id] || ''
        }
      }
      that.setData({
        stylecss: stylecss,
        project: app.project,
        input: inputs,
        user: user,
        sign_num
      })
    } else {
      await showModal(msg || '没有找到活动', '提示', {
        showCancel: false
      })
      wx.exitMiniProgram()
    }
    wx.hideLoading()
    wx.stopPullDownRefresh()
  },
  openLocation (e) {
    const {
      info
    } = e.currentTarget.dataset
    wx.openLocation({
      ...info,
      scale: 13
    })
  },
  ininput (e) {
    const { info } = e.currentTarget.dataset
    const key = `input.${info.id}`
    let value = null
    if (e.type === 'chooseavatar') {
      wx.showLoading({ title: '加载中' })
      app.cloud().then(cloud=>{
				cloud.uploadFile({
					cloudPath: `./avatar/${that.data.project._id}/${that.userid}.jpg`,
					filePath: e.detail.avatarUrl
				}).then(res => {
					wx.hideLoading()
					that.setData({
						[key]: res.fileID
					})
				})
			})
    } else if (e.type === 'getphonenumber') {
      if (e.detail.errMsg.indexOf('deny') !== -1) {
        console.log('用户拒绝')
      } else if (e.detail.errMsg === 'getPhoneNumber:ok') {
        wx.showLoading({ title: '校验中' })
        app.call({ name: 'get_info', data: wx.cloud.CloudID(e.detail.cloudID) }).then(result => {
          wx.hideLoading()
          that.setData({
            [key]: result.purePhoneNumber
          })
        })
      } else {
        showModal('当前小程序没有权限获取用户手机号', '提示', {
          showCancel: false
        })
      }
    } else if (e.type === 'change') {
      value = info.selects[e.detail.value]
    } else if (e.type === 'cancel') {
      value = ''
    } else if (e.type === 'input') {
      value = e.detail.value
    }
    if (value != null) {
      that.setData({
        [key]: value
      })
    }
  },
  startsign () {
    that.setData({
      'form.show': true
    })
  },
  tosignlist () {
    wx.navigateTo({
      url: '../list/list'
    })
  },
  async submitsign (e) {
    const { input, project } = that.data
    if (e.detail?.item?.value === 1) {
      for (const item of project.form) {
        if (item.option !== true && (input[item.id] == null || input[item.id] == '')) {
          showModal(`【${item.prop}】要求必须填写，请补充后重新提交`, '提示')
          return false
        }
      }
      wx.showLoading({ title: '提交中' })
			const submitres = await app.call({ name: 'add_sign', data: { id: project._id, input } })
			wx.hideLoading()
			if(submitres.code === 0){
				await that.init()
			} else {
				showModal(submitres.msg||'系统出现问题，请稍后再试','安全提示',{
					showCancel: true,
					confirmText: '重新编辑'
				}).then(flag=>{
					if (flag) {
						that.setData({
							'form.show': true
						})
					}
				})
			}
    } else if (e.detail?.item?.value === 2) {
      const flag = await showModal('是否取消报名，取消后需要重新填写审核', '确认操作', {
        showCancel: true
      })
      if (flag) {
        wx.showLoading({ title: '取消中' })
        await app.call({ name: 'del_sign', data: { id: project._id } })
        await that.init()
        wx.hideLoading()
      } else {
        return
      }
    }
    that.setData({
      'form.show': false
    })
  },
  closesign () {
    that.setData({
      'form.show': false
    })
  },
  onShareAppMessage () {
    return {
      title: '活动报名｜' + that.data.project.title,
      path: `pages/index/index?id=${that.id||'INIT'}`,
      imageUrl: that.data.project.topimg
    }
  }
})

function showModal (content, title = '', obj = {}) {
  return new Promise((resolve) => {
    wx.showModal({
      cancelText: obj.cancelText || '取消',
      confirmColor: that.data.project?.style?.backgroudColor || '#07c041',
      confirmText: obj.confirmText || '确定',
      title: title,
      content: content,
      editable: obj.editable || false,
      placeholderText: obj.placeholderText || '',
      showCancel: obj.showCancel,
      success (res) {
        if (res.confirm) {
          resolve(res.content || true)
        } else {
          resolve(false)
        }
      },
      fail (e) {
        console.log(e)
        resolve(false)
      }
    })
  })
}
