const app = getApp() // 全局APP
let that = null // 页面this指针
Page({
  data: {
    info: {
      show: false
    }
  },
  onLoad () {
    that = this
    that.project = app.project
    const stylecss = app.pagestyleinit(that.project)
    that.setData({
      project: that.project,
      stylecss
    })
    wx.startPullDownRefresh()
  },
  onPullDownRefresh () {
    that.init()
  },
  async init () {
    const { list, admin } = await app.call({ name: 'get_signlist', data: { id: that.project._id } })
    that.setData({
      list,
      admin
    })
    wx.hideLoading()
    wx.stopPullDownRefresh()
  },
  toDetail (e) {
    const list = ['查看信息', '设为审核中', '通过报名', '拒绝报名']
    const { info, openid } = e.currentTarget.dataset
    list.splice(info.open, 1)
    console.log(list)
    wx.showActionSheet({
      itemList: list,
      async success (res) {
        if (list[res.tapIndex] === '查看信息') {
          that.setData({
            info: {
              show: true,
              data: info.info
            }
          })
        } else {
          wx.showLoading({ title: '处理中' })
          await app.call({
            name: 'set_signstatus',
            data: {
              id: that.project._id,
              openid: openid,
              status: ['-', '设为审核中', '通过报名', '拒绝报名'].indexOf(list[res.tapIndex])
            }
          })
          that.init()
        }
      }
    })
  }
})
