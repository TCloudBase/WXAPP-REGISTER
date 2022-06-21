App({
  flag: false,
  async onLaunch (e) {
		wx.cloud.init()
    this.initcloud()
  },
  /**
   * 初始化云开发环境（支持环境共享和正常两种模式）
   */
  async initcloud () {
    const shareinfo = wx.getExtConfigSync() // 检查 ext 配置文件
    const normalinfo = require('./envList.js').envList || [] // 读取 envlist 文件
    if (shareinfo.envid != null) { // 如果 ext 配置文件存在，环境共享模式
      this.c1 = new wx.cloud.Cloud({ // 声明 cloud 实例
        resourceAppid: shareinfo.appid,
        resourceEnv: shareinfo.envid
      })
      // 装载云函数操作对象返回方法
      this.cloud = async function () {
        if (this.flag !== true) { // 如果第一次使用返回方法，还没初始化
          await this.c1.init() // 初始化一下
          this.flag = true // 设置为已经初始化
        }
        return this.c1 // 返回 cloud 对象
      }
    } else { // 如果 ext 配置文件存在，正常云开发模式
      if (normalinfo.length !== 0 && normalinfo[0].envId != null) { // 如果文件中 envlist 存在
        wx.cloud.init({ // 初始化云开发环境
          traceUser: true,
          env: normalinfo[0].envId
        })
        // 装载云函数操作对象返回方法
        this.cloud = async () => {
          return wx.cloud // 直接返回 wx.cloud
        }
      } else { // 如果文件中 envlist 存在，提示要配置环境
        this.cloud = () => {
          throw new Error('当前小程序没有配置云开发环境，请在 envList.js 中配置你的云开发环境')
        }
      }
    }
  },
  /**
   * 封装的云函数调用方法
   * @param {*} obj 传入对象
   */
  async call (obj) {
    try {
      const cloud = await this.cloud()
      const res = await cloud.callFunction({ // 调用云函数
        name: 'quickstartFunctions', // 应用唯一的服务函数
        data: {
          type: obj.name, // 传入name为type
          data: obj.data // 传入data为data
        }
      })
      console.log('【云函数调用成功】', res)
      if (res.result.name === 'register') {
        if (res.result.data !== false) { // 如果返回值不为false，则证明正常访问
          return res.result.data
        } else { // 否则
          wx.hideLoading()
          wx.showModal({ // 提示一下
            content: '函数服务没有支持该操作！',
            showCancel: false
          })
          console.log(res.result)
          if (res.result.errmsg.indexOf('Cannot find module') !== -1) {
            throw '无效的操作类型'
          } else {
            throw '云函数报错' + res.result.errmsg
          }
        }
      } else {
        // 不同模版的云函数服务均共享quickstartFunctions名字
        // 如果你访问部署多个时，会出现此问题，重新部署即可
        wx.hideLoading()
        wx.showModal({
          content: '云函数quickstartFunctions被其他模版覆盖，请更新上传西数后再次体验',
          showCancel: false
        })
      }
    } catch (e) { // 网络问题出现
      const error = e.toString()
      let msg = '网络服务异常，请确认网络重新尝试！'
      if (error.indexOf('FunctionName parameter could not be found') !== -1) {
        msg = '请上传cloudfunctions文件夹中的云函数，然后再次体验'
      } else if (error === '无效的操作类型') {
        msg = `${obj.name}方法没有在云函数中找到，请先开发并更新线上云函数，然后再尝试`
      } else if (error.indexOf('云函数报错') !== -1) {
        msg = `${obj.name}方法执行过程中出错，请查看调试控制台报错信息，修正云函数后重新上传再试`
      }
      wx.hideLoading()
      wx.showModal({
        content: msg,
        showCancel: false
      })
      throw new Error('【云函数调用失败】' + error)
    }
  },
  pagestyleinit (project) {
    const {
      safeArea,
      screenHeight
    } = wx.getSystemInfoSync()
    let stylecss = `--safeBottom:${screenHeight - safeArea.bottom}px;`
    if (project.style != null) {
      for (const i in project.style) {
        stylecss += `--${i}:${project.style[i]};`
      }
      if (project.style.backgroudColor != null) {
        wx.setNavigationBarColor({
          backgroundColor: project.style.backgroudColor,
          frontColor: project.style.frontColor || '#FFFFFF'
        })
        wx.setBackgroundColor({
          backgroundColor: project.style.backgroudColor,
          backgroundColorTop: project.style.backgroudColor,
          backgroundColorBottom: '#FFFFFF'
        })
      }
    }
    return stylecss
  }
})
