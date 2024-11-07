// pages/my/index.js
import request from '@/utils/request'
import {
  validateForm,
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
      id:'',
      totalSave: 0,
      isPlus:'0',
      avatar:'',
      nickname:''
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
  onClickSetPLUSVIP() {
    if (!wx.getStorageSync('openId') && !this.getUrlParam('code')) {
      const url = encodeURIComponent(window.location.href)
      wx.redirectTo({
        url: `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6246e0503023027f&redirect_uri=${url}&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect`
      })
    } else if (!wx.getStorageSync('openId') && this.getUrlParam('code')) {
      const code = this.getUrlParam('code')
      wx.request({
        url: `/member/member/openid/${code}`,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          const {
            status,
            data
          } = res.data
          if (status.flag === true) {
            wx.setStorageSync('openId', data.openid)
            this.onClickSetPLUSVIP2()
          }
        }
      })
    } else {
      this.onClickSetPLUSVIP2()
    }
  },
  onClickSetPLUSVIP2() {
    wx.showLoading({
      title: '支付中...'
    })
    wx.request({
      url: `/orders/orders/buyVip/198`,
      header: {
        'AUTH': 'ROBOT ' + wx.getStorageSync('token')
      },
      success: (res) => {
        const {
          status,
          data
        } = res.data
        if (status.flag) {
          const paymentData = {
            openId: data.memberOpenId || wx.getStorageSync('openId'),
            ordersId: data.ordersId,
            price: 198,
            payAmount: 198,
            memberId: data.memberId,
            remark: 'vip2'
          }
          this.initiatePayment(paymentData)
        } else {
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '购买失败'
          })
        }
      }
    })
  },
  initiatePayment(paymentData) {
    wx.request({
      url: `/orders/pay/pay`,
      method: 'POST',
      data: paymentData,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        const {
          status,
          data
        } = res.data
        if (status.flag) {
          wx.hideLoading()
          wx.requestPayment({
            timeStamp: data.timeStamp,
            nonceStr: data.nonceStr,
            package: data.package,
            signType: data.signType,
            paySign: data.paySign,
            success: () => {
              wx.showToast({
                icon: 'none',
                title: '支付成功'
              })
              this._refreshOrder(paymentData.ordersId)
            },
            fail: () => {
              wx.showToast({
                icon: 'none',
                title: '支付取消'
              })
            }
          })
        } else {
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '支付失败'
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '请求失败, 网络异常'
        })
      }
    })
  },
  _refreshOrder(orderId) {
    wx.request({
      url: `/orders/pay/queryOrders/${orderId}`,
      header: {
        'AUTH': 'ROBOT ' + wx.getStorageSync('token')
      },
      success: (res) => {
        const {
          status
        } = res.data
        if (status.flag) {
          this.user = {}
          this._getInfoByToken()
        } else {
          wx.showToast({
            icon: 'none',
            title: status.msg
          })
        }
      },
      fail: () => {
        wx.showToast({
          icon: 'none',
          title: '查询订单失败'
        })
      }
    })
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
            wx.redirectTo({
              url: `${config.base_url}`
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
      const {success,data} = res.data
      if (success) {
        this.user = data
      } else {
        wx.showToast({
          icon: 'none',
          title: status.msg
        })
      }
    })
  },
  navigate(event) {
    const url = event.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  }
})