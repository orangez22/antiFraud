import request from '@/utils/request';

Page({
  data: {
    messageDetailVOList: [], // 消息列表
    memberId: '', // 当前用户 ID
    feedbackId: '', // 当前反馈 ID
    role: '', // 当前角色
    messageContent: '', // 输入框内容
    receiverId: '', // 当前对话的固定接收者 ID
    name: '', // 用户名
    avatar: '', // 头像
    phone: '', // 用户手机号
  },

  onLoad: function (options) {
    // 获取当前的用户 ID、角色、用户名、头像、手机号和反馈 ID
    const memberId = getApp().getMemberId();
    const role = getApp().getRole();
    const name = getApp().getName();
    const avatar = getApp().getAvatar();
    const phone = getApp().getPhone();
    const feedbackId = options.feedbackId;

    this.setData({
      memberId: memberId,
      role: role,
      name: name,
      avatar: avatar,
      phone: phone,
      feedbackId: feedbackId,
    });

    this.loadMessageDetails(); // 加载消息详情
  },

  // 加载消息详情
  loadMessageDetails: function () {
    const that = this;

    // 获取消息详情
    request({
      url: '/feedback/feedbackMessage/getFeedbackDetail', // 替换为真实接口路径
      method: 'POST',
      data: {
        feedbackId: that.data.feedbackId,
        memberId: that.data.memberId,
        role: that.data.role,
      },
    })
      .then(function (res) {
        const messageDetailVOList = res.data || [];

        // 确定接收者 ID（管理员时为用户 ID）
        if (that.data.role === '0' && messageDetailVOList.length > 0) {
          const receiverId = messageDetailVOList[0].senderId; // 普通用户的 ID
          that.setData({ receiverId: receiverId });
        }

        that.setData({
          messageDetailVOList: messageDetailVOList,
        });
      })
      .catch(function () {
        wx.showToast({
          title: '加载消息失败',
          icon: 'none',
        });
      });
  },

  // 更新输入框内容
  onInputChange: function (e) {
    this.setData({
      messageContent: e.detail.value,
    });
  },

  // 发送消息
  sendMessage: function () {
    const { messageContent, memberId, feedbackId, role, receiverId } = this.data;

    if (!messageContent.trim()) {
      wx.showToast({
        title: '请输入消息内容',
        icon: 'none',
      });
      return;
    }

    // 发送消息
    request({
      url: '/feedback/feedbackMessage/addFeedback', // 替换为真实接口路径
      method: 'POST',
      data: {
        name:this.data.name,
        phone:this.data.phone,
        avatar:this.data.avatar,
        feedbackId: feedbackId,
        role: role,
        receiverId: role === '0' ? receiverId : null, // 管理员传接收者 ID，普通用户不传
        content: messageContent,
      },
    })
      .then(() => {
        wx.showToast({
          title: '消息发送成功',
        });

        // 清空输入框
        this.setData({
          messageContent: '', // 清空输入框
        });

        // 刷新消息列表
        this.loadMessageDetails(); 
      })
      .catch(() => {
        wx.showToast({
          title: '消息发送失败',
          icon: 'none',
        });
      });
  },
});
