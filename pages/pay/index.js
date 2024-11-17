
import request from '@/utils/request'
import {
  validateForm,
  isLogin
} from '@/utils/common'
Page({
  data: {
    storeInfo: {},
    payAmount: 0,
    ordersId: '',
    storeId: ''
  },

  onLoad(options) {
    if (options && options.storeId && options.payAmount) {
      this.setData({
        storeId: options.storeId,
        payAmount: options.payAmount,
      });
      this._getStoreInfoByStoreId();
      this._SendCodeBean();
    }

    const myOrdersId = wx.getStorageSync('myOrdersId');
    if (myOrdersId) {
      this.setData({ ordersId: myOrdersId });
      this._sendOrderId();
    }
  },

  // Go back to the previous page
  back() {
    wx.navigateBack();
  },

  // Navigate to the homepage
  onClickGotoBack() {
    wx.navigateTo({
      url: 'pages/index/index'
    });
  },

  // Navigate to modify data page
  onClickMessage() {
    wx.navigateTo({
      url: 'pages/modify/index'
    });
  },

  // Fetch store info by storeId
  _getStoreInfoByStoreId() {
    const authorization = wx.getStorageSync('authorization');
    request({
      url: `${config.api_base_url}merchant/store/${this.data.storeId}`,
      header: {
        AUTH: authorization.token
      },
      success: (res) => {
        const { status, data } = res.data;
        if (status.flag === true) {
          this.setData({ storeInfo: data });
        } else {
          this.setData({ storeInfo: {} });
        }
      },
      fail: () => {
        this.setData({ storeInfo: {} });
      }
    });
  },

  // Send order ID for payment status query
  _sendOrderId() {
    const authorization = wx.getStorageSync('authorization');
    request({
      url: `${config.api_base_url}orders/pay/queryOrders/${this.data.ordersId}`,
      header: {
        AUTH: authorization.token
      },
      success: (res) => {
        const { status, data } = res.data;
        if (status.flag === true) {
          wx.removeStorageSync('myOrdersId');
        } else {
          wx.showToast({
            icon: 'none',
            title: status.msg
          });
        }
      },
      fail: () => {
        wx.showToast({
          icon: 'none',
          title: '发送订单号失败, 网络异常'
        });
      }
    });
  },

  _getInfoByToken() {
    //判断是否已经登录
    isLogin()

    request({
      url: `/sso/member/findByToken`,
    }).then(res => {
      const {success,data,message} = res
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
});
