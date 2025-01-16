import request from '@/utils/request';  // 导入请求工具类

Page({
  data: {
    feedbackList: [],  // 存放反馈信息列表
    unreadCountList: [],  // 存放每个反馈的未读消息数量
    loading: false,  // 是否正在加载
    hasMore: true,  // 是否有更多数据
  },

  // 页面加载时获取反馈列表和未读消息数量
  onLoad: function() {
    this.loadFeedbackList();  // 获取反馈列表
  },

  // 获取反馈列表数据
  loadFeedbackList: function() {
    const that = this;
    const memberId = getApp().getMemberId();  // 获取全局的 memberId
    const role = getApp().getRole();  // 获取全局的角色
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });

    // 使用 request 工具类发送请求
    request({
      url: '/feedback/feedbackMember/list',  // 替换为您的真实接口路径
      method: 'POST',
      data: {
        memberId: memberId,
        role: role,
      },
    })
    .then(function(res) {
      // 假设返回的数据结构是 { data: [...] }
      const feedbackList = res.data;  // 获取返回的反馈数据
      that.setData({
        feedbackList: feedbackList,  // 更新页面的反馈列表
        loading: false,  // 请求结束，更新 loading 状态
      });
      // 在获取到反馈列表后，获取未读消息数量
      that.loadUnreadCount(feedbackList);
    })
    .catch(function() {
      wx.showToast({
        title: '请求失败',
        icon: 'none',
      });
      that.setData({
        loading: false,  // 请求失败时也更新 loading 状态
      });
    });
  },

  loadUnreadCount: function(feedbackList) {
    const that = this;
    const memberId = getApp().getMemberId();
    const role = getApp().getRole();
  
    if (!feedbackList || feedbackList.length === 0) {
      return;
    }
  
    // 初始化未读消息数量对象
    const unreadCountList = {};
  
    // 使用 Promise.all 来处理所有异步请求
    const promises = feedbackList.map(feedback =>
      request({
        url: '/feedback/feedbackMessage/unreadCount',
        method: 'POST',
        data: {
          memberId: memberId,
          role: role,
          feedbackId: feedback.feedbackId,
        },
      })
        .then(res => {
          // 假设返回结构为 [{ feedbackId, unreadCount }]
          res.data.forEach(item => {
            unreadCountList[item.feedbackId] = item.unreadCount;
          });
        })
        .catch(() => {
          wx.showToast({
            title: '获取未读消息数量失败',
            icon: 'none',
          });
        })
    );
  
    // 等所有请求完成后更新数据
    Promise.all(promises).then(() => {
      that.setData({
        unreadCountList: unreadCountList,
      });
      console.log('最终未读消息列表:', unreadCountList);
    });
  },
  // 跳转到反馈详情页面
  goToDetail: function(event) {
    const feedbackId = event.currentTarget.dataset.feedbackId;
    wx.navigateTo({
      url: `/pages/feedback-detail/feedback-detail?feedbackId=${feedbackId}`,
    });
  },
});
