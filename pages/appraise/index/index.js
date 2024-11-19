// pages/appraise/index/index.js
//import { config } from '../../utils/config.js';

Page({
  data: {
    storeName: '',
    ordersId: '',
    storeId: '',
    content: ''
  },

  onLoad(e) {
    const authorization = wx.getStorageSync('authorization');
    if (!authorization || Object.keys(authorization).length === 0) {
      wx.showToast({
        icon: 'none',
        title: '尚未登录, 请先登录'
      });
      setTimeout(() => {
        wx.removeStorageSync('authorization');
        wx.reLaunch({
          url: '../verificationcodelogin/verificationcodelogin'
        });
      }, 777);
      return;
    }

    if (e && e.ordersId) {
      this.setData({ ordersId: e.ordersId });
    }
    if (e && e.storeId) {
      this.setData({ storeId: e.storeId });
    }
    if (e && e.storeName) {
      this.setData({ storeName: e.storeName });
    }
  },

  // 返回上一页
  back() {
    wx.navigateBack({});
  },

  // 评价内容输入
  onContentChange(e) {
    this.setData({
      content: e.detail.value
    });
  },

  // 提交评价
  onClickSubmit() {
    if (!this.data.ordersId) {
      wx.showToast({
        icon: 'none',
        title: '暂无订单号'
      });
      return false;
    }
    if (!this.data.storeId) {
      wx.showToast({
        icon: 'none',
        title: '暂无商户'
      });
      return false;
    }
    if (!this.data.content) {
      wx.showToast({
        icon: 'none',
        title: '请填写要评价的内容'
      });
      return false;
    }

    wx.showLoading({ title: '保存中' });
    const authorization = wx.getStorageSync('authorization');
  // 执行提交评价操作(向后端发起请求)
    wx.request({
      url: `${config.api_base_url}member/evaluate/${this.data.storeId}`,
      method: 'POST',
      data: {
        ordersId: this.data.ordersId,
        content: this.data.content
      },
      header: {
        'AUTH': authorization.token
      },
      success: (res) => {
        const { status, data } = res.data;
        if (status.flag) {
          wx.showToast({
            icon: 'none',
            title: '评价成功'
          });
          setTimeout(() => {
            wx.navigateBack({});
          }, 888);
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
          title: '无法评价, 网络异常'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
    //提交完成后跳转到列表页面
    wx.redirectTo({
      url: 'pages/appraise/list/index'
    })
  }
});
