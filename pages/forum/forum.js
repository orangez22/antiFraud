Page({
  data: {
    role: null, // 当前用户角色
  },

  onLoad() {
    const app = getApp();
    const role = app.getRole(); // 获取全局角色

    if (!role) {
      console.error('未获取到用户角色，请检查登录逻辑！');
      return;
    }

    this.setData({ role });

    // 根据角色跳转到不同页面
    if (role === '0') {
      // 管理员
      wx.redirectTo({
        url: '/pages/forum/admin/index', // 管理员页面
      });
    } else if (role === '1') {
      // 普通用户
      wx.redirectTo({
        url: '/pages/forum/member/index', // 普通用户页面
      });
    } else {
      console.error('未知角色，请检查逻辑！');
    }
  },
});
