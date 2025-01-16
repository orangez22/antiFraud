import request from '@/utils/request';  // 导入请求工具类

Page({
  data: {
    feedbackList: [],  // 存放反馈信息列表
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
  
    // 使用 Promise.all 来处理所有异步请求
    const promises = feedbackList.map(feedback =>
      request({
        url: '/feedback/feedbackMessage/unreadCount',
        method: 'POST',
        data: {
          memberId: memberId,  // 当前用户的 ID
          role: role,
          feedbackId: feedback.feedbackId,  // 当前反馈的 ID
        },
      })
        .then(res => {
          // 假设返回结构为 [{ feedbackId, unreadCount }]
          const unreadCount = res.data[0]?.unreadCount || 0;
  
          // 只有当反馈的 `memberId` 不是当前用户时，才显示对方的未读消息红点
          if (String(feedback.memberId) !== String(memberId)) {
            // 如果是对方反馈给当前用户，更新未读消息数量和红点
            feedback.unreadCount = unreadCount;
            feedback.showRedDot = unreadCount > 0;
          } else {
            // 当前用户发布的消息，不显示未读红点
            feedback.unreadCount = 0;
            feedback.showRedDot = false;
          }
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
        feedbackList: feedbackList,  // 更新反馈列表，确保红点显示正确
      });
      console.log('最终未读消息列表:', feedbackList);  // 可以直接输出反馈列表，确认每个反馈的红点状态
    });
  },

  // 跳转到反馈详情页面
  goToDetail: function(event) {
    const feedbackId = event.currentTarget.dataset.feedbackId;
  
    // 在跳转到详情前，去掉红点
    const updatedFeedbackList = this.data.feedbackList.map(feedback => {
      if (feedback.feedbackId === feedbackId) {
        feedback.showRedDot = false;  // 去掉红点
      }
      return feedback;
    });
  
    // 更新数据
    this.setData({
      feedbackList: updatedFeedbackList,
    });
  
    // 跳转到反馈详情页面
    wx.navigateTo({
      url: `/pages/detail/feedback/detail?feedbackId=${feedbackId}`,
    });
  }
});
