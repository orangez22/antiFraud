import request from '@/utils/request';

Page({
  data: {
    messageDetailVOList: [],  // 存放消息列表
    memberId: '',  // 当前用户ID
    feedbackId: '',  // 当前反馈ID
    role: '',  // 当前角色
  },

  onLoad: function(options) {
    // 获取当前的用户ID、角色、反馈ID
    const memberId = getApp().getMemberId();
    const role = getApp().getRole();
    const feedbackId = options.feedbackId;
    
    this.setData({
      memberId: memberId,
      role: role,
      feedbackId: feedbackId,
    });

    this.loadMessageDetails();  // 加载消息详情
  },

  loadMessageDetails: function() {
    const that = this;

    // 发送请求获取消息详情数据
    request({
      url: '/feedback/feedbackMessage/getFeedbackDetail',  // 替换为真实的接口路径
      method: 'POST',
      data: {
        feedbackId: that.data.feedbackId,
        memberId: that.data.memberId,
        role: that.data.role,
      },
    })
    .then(function(res) {
      const messageDetailVOList = res.data;  // 获取返回的消息列表

      // 过滤掉自己发布且为未读的消息
      const filteredMessageList = messageDetailVOList.filter(item => {
        // 只有别人发送的未读消息才会显示小红点，自己的消息不显示
        if (item.senderId === that.data.memberId) {
          item.status = '0';  // 强制设置状态为已读
        }
        return item.senderId !== that.data.memberId || item.status !== '1';  // 不显示自己发送的未读消息
      });

      that.setData({
        messageDetailVOList: filteredMessageList,  // 更新页面的消息列表
      });
    })
    .catch(function() {
      wx.showToast({
        title: '请求失败',
        icon: 'none',
      });
    });
  },
});
