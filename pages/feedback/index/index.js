// pages/feedback/index/index.js
Page({
  data: {
    content: '',
    cityPickerValueDefault: ''
  },

  // 返回上一页
  back() {
    wx.navigateBack();
  },

  // 监听内容输入
  onContentInput(e) {
    this.setData({
      content: e.detail.value
    });
  },

  // 清除内容
  clearContent() {
    this.setData({
      content: ''
    });
  },

  // 提交按钮点击事件
  onClickSubmitBtn() {
    const { content } = this.data;
    
    if (!content) {
      wx.showToast({
        icon: 'none',
        title: '请输入您的反馈'
      });
      return false;
    }

    const obj = { content };
    const authorization = wx.getStorageSync('authorization');

    wx.showLoading({ title: '提交中...' });

    wx.request({
      url: `${config.api_base_url}member/feedback`,
      method: 'POST',
      header: {
        'AUTH': authorization.token
      },
      data: obj,
      success: (res) => {
        const { status } = res.data;
        if (status.flag) {
          wx.showToast({
            icon: 'none',
            title: '提交成功'
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '提交失败，请稍后重试'
          });
        }
      },
      fail: () => {
        wx.showToast({
          icon: 'none',
          title: '提交失败, 网络异常'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 地址选择确认事件
  onConfirmAddress(e) {
    this.setData({
      content: e.content
    });
  }
});
