// pages/beans/beans.js
import request from '@/utils/request'
import {
  validateForm,
  isLogin
} from '@/utils/common'
Page({
  data: {
    codeBean: '', // 码豆
    goldBean: '', // 金豆
    list: []      // 消费明细
  },
  onShow() {
    this._getInfoByToken()
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

  // 获取码豆数据
  _getBeansData() {
    wx.showLoading({ title: '加载中' });
    const authorization = wx.getStorageSync('authorization');
    request({
      url: "/member/member/myBeans",
      header: { 'AUTH': authorization.token },
      success: (res) => {
        const { status, data } = res.data;
        if (status.flag) {
          this.setData({
            goldBean: data.goldenBeans,
            codeBean: data.beans
          });
        } else {
          this.setData({
            goldBean: 0,
            codeBean: 0
          });
        }
      },
      fail: () => {
        this.setData({
          goldBean: 0,
          codeBean: 0
        });
        wx.showToast({
          icon: 'none',
          title: '请求失败, 网络异常'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 获取消费明细
  _BeansDetail() {
    const authorization = wx.getStorageSync('authorization');
    request({
      url:"member/consumption/1/3",
      method: 'POST',
      header: { 'AUTH': authorization.token },
      data: {},
      success: (res) => {
        const { status, data } = res.data;
        if (status.flag) {
          this.setData({
            list: data.map(item => ({
              id: item.id,
              time: item.time,
              num: item.num
            }))
          });
        }
      },
      fail: () => {
        wx.showToast({
          icon: 'none',
          title: '请求失败, 网络异常'
        });
      }
    });
  },

  // 提现金豆
  onClickTXgoldBean() {
    if (this.data.goldBean === 0) {
      wx.showToast({
        icon: 'none',
        title: '暂无金豆, 无法提现'
      });
    }
  }
});