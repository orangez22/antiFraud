import request from '@/utils/request';

Page({
  data: {
    detail: {}, // 存储论坛详情
    categoryId: '', // 当前分类ID（传递的id会改为categoryId）
  },

  onLoad(options) {
    const { id } = options; // 从页面参数获取论坛ID

    if (id) {
      // 将传递的 id 改为 categoryId
      this.setData({ categoryId: id });
      this.getForumDetail(id);  // 使用 categoryId 请求详情
    } else {
      wx.showToast({
        title: '无效的论坛ID',
        icon: 'none',
      });
    }
  },

  // 获取论坛详情
  getForumDetail(categoryId) {
    wx.showLoading({ title: '加载中...' });

    // 请求接口时，使用 categoryId
    request.post('/forum/forumInfo/detail', { forumId: categoryId })
      .then((response) => {
        wx.hideLoading();
        const { success, data, message } = response;

        if (success) {
          this.setData({ detail: data });
        } else {
          wx.showToast({
            title: message || '详情加载失败',
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
