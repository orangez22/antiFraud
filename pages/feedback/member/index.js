import request from '@/utils/request';

Page({
  data: {
    feedbackContent: '', // 用户输入的反馈内容
    memberId: '', // 当前用户 ID
    phone: '', // 用户手机号
    name: '', // 用户名
    avatar: '', // 用户头像
    createTime: '', // 创建时间
  },

  onLoad: function () {
    // 从全局或缓存中获取用户信息
    const memberId = getApp().getMemberId();
    const phone = getApp().getPhone();
    const name = getApp().getName();
    const avatar = getApp().getAvatar();

    this.setData({
      memberId: memberId,
      phone: phone,
      name: name,
      avatar: avatar,
      createTime: this.formatTime(new Date()), // 当前时间
    });
  },

  // 更新时间格式化（yyyy-MM-dd HH:mm:ss）
  formatTime: function (date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  // 处理输入框的内容
  onInputChange: function (e) {
    this.setData({
      feedbackContent: e.detail.value,
    });
  },

  // 提交反馈
  submitFeedback: function () {
    const { feedbackContent, memberId, phone, name, avatar, createTime } = this.data;

    if (!feedbackContent.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none',
      });
      return;
    }

    // 构建反馈 DTO
    const feedbackDTO = {
      memberId: memberId,
      phone: phone,
      name: name,
      avatar: avatar,
      content: feedbackContent,
      createTime: createTime,
    };

    // 调用后台接口提交反馈
    request({
      url: '/feedback//feedbackMember/create', // 替换为实际的 API 路径
      method: 'POST',
      data: feedbackDTO,
    })
      .then((res) => {
        if (res.data) {
          wx.showToast({
            title: '反馈提交成功',
            icon: 'success',
          });
          this.setData({
            feedbackContent: '', // 清空输入框
          });
        } else {
          wx.showToast({
            title: '提交失败，请稍后再试',
            icon: 'none',
          });
        }
      })
      .catch((err) => {
        wx.showToast({
          title: '提交失败，请稍后再试',
          icon: 'none',
        });
      });
  },

  // 页面样式
  onShareAppMessage: function () {
    return {
      title: '意见反馈',
      path: '/pages/feedback/feedback', // 反馈页面路径
    };
  },
  //跳转我的反馈
  goToMyFeedback: function () {
    wx.navigateTo({
      url: '/pages/feedback/member/list/index', // 跳转到反馈历史页面
    });
  },
});

