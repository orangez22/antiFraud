// pages/complain/index/index.js
//import { yourFormatDateTime, config } from '../../utils/config.js';

Page({
  data: {
    storeid: '',
    storename: '',
    content: '',
    currentTime: ''
  },

  onLoad: function (e) {
    const authorization = wx.getStorageSync('authorization');
    if (Object.keys(authorization).length == 0) {
      wx.showToast({
        icon: 'none',
        title: '尚未登录, 请先登录'
      });
      setTimeout(() => {
        wx.reLaunch({
          url: '../verificationcodelogin/verificationcodelogin'
        });
      }, 777);
      return false;
    }
    this.setData({
      currentTime: yourFormatDateTime(+new Date())
    });

    if (e.storeid) {
      this.setData({
        storeid: e.storeid
      });
    }
    if (e.storename) {
      this.setData({
        storename: e.storename
      });
    }
  },

  back: function () {
    wx.navigateBack();
  },

  onContentInput: function (e) {
    this.setData({
      content: e.detail.value
    });
  },

  onClickBtnSubmitContent: function () {
    const authorization = wx.getStorageSync('authorization');
    if (!this.data.storeid) {
      wx.showToast({
        icon: 'none',
        title: '暂未获取到商户id, 无法投诉'
      });
      return false;
    }
    if (!this.data.content) {
      wx.showToast({
        icon: 'none',
        title: '请填写您要投诉的内容'
      });
      return false;
    }
    wx.showLoading({ title: '保存中' });
    wx.request({
      url: `${config.api_base_url}member/complaint/${this.data.storeid}`,
      method: 'POST',
      header: {
        'AUTH': authorization.token
      },
      data: {
        content: this.data.content
      },
      success: (res) => {
        const { status, data } = res.data;
        if (status.flag === true) {
          wx.showToast({
            icon: 'none',
            title: '投诉成功'
          });
          setTimeout(() => {
            wx.redirectTo({
              url: '../complaintssuccess/complaintssuccess'
            });
          }, 777);
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
          title: '投诉失败, 网络异常'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
    wx.redirectTo({
      url: 'pages/complain/list/index',
    })
  }
});
