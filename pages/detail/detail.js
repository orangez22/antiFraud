import request from '@/utils/request';

Page({
  data: {
    detail: {}, // 存储详情数据
    memberId: 0,
    favoriteStatus: 1, // 收藏状态：0 已收藏，1 未收藏
  },

  onLoad(options) {
    const app = getApp();
    const memberId = app.getMemberId(); // 调用 getMemberId

    // 检查是否获取到 memberId
    if (!memberId) {
      wx.showToast({
        title: '用户未登录',
        icon: 'none',
      });
      // 跳转到登录页面
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/login/phone/code/index', // 替换为你的登录页面路径
        });
      }, 1500);
      return;
    }

    this.setData({ memberId });
    const { id } = options; // 获取传递过来的反诈内容 ID
    if (id) {
      this.getAntiFraudDetail(id);
      this.checkFavoriteStatus(id); // 检查收藏状态
    } else {
      wx.showToast({
        title: '无效的内容 ID',
        icon: 'none',
      });
    }
  },

  // 获取反诈详情（逻辑保持不变）
  getAntiFraudDetail(id) {
    wx.showLoading({ title: '加载中' });

    request.post('/list/getDetail', { antiFraudId: id })
      .then((response) => {
        wx.hideLoading();
        const { success, data, errorCode, message } = response;

        if (errorCode === 20000) {
          this.setData({
            detail: data,
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

  // 检查收藏状态（逻辑保持不变）
  checkFavoriteStatus(id) {
    const { memberId } = this.data;

    request.post('/list/favoriteStatus', { memberId, antiFraudId: id })
      .then((response) => {
        const { success, data, errorCode, message } = response;

        if (errorCode === 20000) {
          this.setData({
            favoriteStatus: data.favoriteStatus,
          });
        } else {
          console.error('收藏状态检查失败：', message);
        }
      })
      .catch((error) => {
        console.error('请求失败：', error);
      });
  },

  // 切换收藏状态（逻辑保持不变）
  toggleFavorite() {
    const { memberId, detail, favoriteStatus } = this.data;

    if (!detail.id) {
      wx.showToast({
        title: '无效的内容 ID',
        icon: 'none',
      });
      return;
    }

    const newStatus = favoriteStatus === 0 ? 1 : 0;
    request.post('/list/favorite', { memberId, antiFraudId: detail.id, favoriteStatus: newStatus })
      .then((response) => {
        const { success, errorCode, message } = response;

        if (errorCode === 20000) {
          this.setData({
            favoriteStatus: newStatus,
          });
          wx.showToast({
            title: newStatus === 0 ? '收藏成功' : '取消收藏成功',
            icon: 'success',
          });
        } else {
          wx.showToast({
            title: message || '操作失败',
            icon: 'none',
          });
        }
      })
      .catch((error) => {
        console.error('请求失败：', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
      });
  },
});
