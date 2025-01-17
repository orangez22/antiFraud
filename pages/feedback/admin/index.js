import request from '@/utils/request'; // 导入请求工具类

Page({
  data: {
    feedbackList: [], // 存放反馈信息列表
    loading: false, // 是否正在加载
    hasMore: true, // 是否有更多数据
  },

  // 页面加载时获取反馈列表和未读消息数量
  onLoad: function () {
    this.loadFeedbackList(); // 获取反馈列表
  },

  // 获取反馈列表数据
  loadFeedbackList: function () {
    const that = this;
    const memberId = getApp().getMemberId(); // 获取全局的 memberId
    const role = getApp().getRole(); // 获取全局的角色
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    // 使用 request 工具类发送请求
    request({
      url: '/feedback/feedbackMember/list', // 替换为您的真实接口路径
      method: 'POST',
      data: {
        memberId: memberId,
        role: role,
      },
    })
      .then(function (res) {
        // 假设返回的数据结构是 { data: [...] }
        const feedbackList = res.data; // 获取返回的反馈数据
        that.setData({
          feedbackList: feedbackList, // 更新页面的反馈列表
          loading: false, // 请求结束，更新 loading 状态
        });
        // 在获取到反馈列表后，获取未读消息数量
        that.loadUnreadCount();
      })
      .catch(function () {
        wx.showToast({
          title: '请求失败',
          icon: 'none',
        });
        that.setData({
          loading: false, // 请求失败时也更新 loading 状态
        });
      });
  },

  // 获取未读消息数量
  loadUnreadCount: function () {
    const that = this;
    const memberId = getApp().getMemberId();
    const role = getApp().getRole();

    // 使用 request 工具类发送请求
    request({
      url: '/feedback/feedbackMessage/unreadCount', // 替换为您的真实接口路径
      method: 'POST',
      data: {
        memberId: memberId,
        role: role,
      },
    })
      .then(function (res) {
        // 假设返回结构为 [{ feedbackId, unreadCount, senderId, receiverId }]
        const unreadCountList = res.data;

        const updatedFeedbackList = that.data.feedbackList.map(feedback => {
          const unreadInfo = unreadCountList.find(
            unread => unread.feedbackId === feedback.feedbackId
          );
          if (unreadInfo) {
            feedback.unreadCount = unreadInfo.unreadCount || 0;
            feedback.showRedDot = unreadInfo.unreadCount > 0;
            feedback.senderId = unreadInfo.senderId; // 设置发送者 ID
            feedback.receiverId = unreadInfo.receiverId; // 设置接收者 ID
          } else {
            feedback.unreadCount = 0;
            feedback.showRedDot = false;
          }
          return feedback;
        });

        // 更新数据
        that.setData({
          feedbackList: updatedFeedbackList,
        });

        console.log('最终反馈列表:', updatedFeedbackList); // 输出更新后的反馈列表
      })
      .catch(function () {
        wx.showToast({
          title: '获取未读消息数量失败',
          icon: 'none',
        });
      });
  },

  // 跳转到反馈详情页面
  goToDetail: function (event) {
    const feedbackId = event.currentTarget.dataset.feedbackId;

    // 在跳转到详情前，去掉红点
    const updatedFeedbackList = this.data.feedbackList.map(feedback => {
      if (feedback.feedbackId === feedbackId) {
        feedback.showRedDot = false; // 去掉红点
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
  },
});