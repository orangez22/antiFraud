import request from '@/utils/request';

Page({
  data: {
    detail: {}, // 存储详情数据
  },

  onLoad(options) {
    const { id } = options; // 获取传递过来的反诈内容 ID
    if (id) {
      this.getAntiFraudDetail(id);
    } else {
      wx.showToast({
        title: '无效的内容 ID',
        icon: 'none',
      });
    }
  },

  // 获取反诈详情
  getAntiFraudDetail(id) {
    wx.showLoading({ title: '加载中' });

    // 请求后端获取详情数据
    request.post('/list/getDetail', { antiFraudId: id })
      .then((response) => {
        wx.hideLoading();
        const { success, data, errorCode, message } = response;

        if (errorCode === 20000) {
          this.setData({
            detail: data, // 设置详情数据
          });
        } else {
          wx.showToast({
            title: message || '详情获取失败',
            icon: 'none',
          });
        }
      })
      .catch((error) => {
        wx.hideLoading();
        console.error('请求失败：', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
      });
  },
});
