// pages/my/index.js
import request from '@/utils/request'
import {
  isLogin
} from '@/utils/common'

import {
  setToken,
  getToken
} from '@/utils/auth'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {
      id: '',
      totalSave: 0,
      isPlus: '0',
      avatar: '',
      nickname: ''
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this._getInfoByToken()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  getUrlParam(name) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    const r = decodeURIComponent(window.location.search).substr(1).match(reg);
    if (r !== null) {
      return decodeURIComponent(r[2]);
    }
    return null;
  },
  vipToPay(e) {
    let payAmount = e.currentTarget.dataset.value
    let authorization = wx.getStorageSync('authorization')
    let orders = {
      payAmount: payAmount,
      rate: 1,
      payment: '10',
      openId: authorization.openId,
      storeId: 0,
      price: payAmount,
      memberId: authorization.memberId,
      nickname: authorization.nickname,
    };
    wx.showLoading({
      title: '正在生成订单...', // 提示框文字
      mask: true, // 是否显示透明蒙层，防止触摸穿透
    });
    // 模拟加载时间，2秒后关闭加载提示
    setTimeout(() => {
      wx.hideLoading();
      this.showPayModal(orders);
    }, 1000);
    // request({
    //   url:`/orders/orders/preOrders`,
    //   success: (res) => {
    //     let {status,data}=res.data
    //     if(status.flag===true){
    //       console.log(data.ordersId+"+time1="+(new Date().valueOf()))
    //       orders.ordersId=data.ordersId
    //     }
    //   }
    // })

    if (payAmount === 198) {
      orders.remark = "vip2"
    } else {
      orders.remark = "vip1"
    }

  },
  // 显示弹窗
  showPayModal(orders) {
    wx.showModal({
      title: '支付确认',
      content: '收费' + orders.payAmount + '元，是否立即支付？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 用户点击了确定
          console.log("确定");
          let user = this.data.user
          if (orders.payAmount == 198) {
            user.isPlus = "2"
          } else {
            user.isPlus = "1"
          }
          this.setData({
            user: user
          })
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 2000//持续的时间
          })
        } else if (res.cancel) {
          wx.showToast({
            title: '支付失败',
            icon: 'error',
            duration: 2000//持续的时间
          })
          console.log("取消");
        }
      },
    });
  },
  onClickExit() {
    wx.showModal({
      content: '确定要退出登录吗',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在退出'
          })
          setTimeout(() => {
            wx.hideLoading()
            wx.clearStorageSync()
            wx.navigateTo({
              url: "/pages/login/phone/code/index"
            })
          }, 2000)
        }
      }
    })
  },
  _getInfoByToken() {
    //判断是否已经登录
    isLogin()

    request({
      url: `/sso/member/findByToken`,
    }).then(res => {
      const {
        success,
        data,
        message
      } = res
      if (success) {
        this.user = data
      } else {
        wx.showToast({
          icon: 'none',
          title: message
        })
      }
    })
  },
  navigate(event) {
    const url = event.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  },
  // 提示功能尚未开发
  showNotDeveloped() {
    wx.showToast({
      title: '功能尚未开发', // 提示内容
      icon: 'none', // 无图标
      duration: 2000, // 显示时间，单位毫秒
    });
  },
})