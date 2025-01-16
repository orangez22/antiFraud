Page({
  data: {
    role: null, // 当前用户角色
  },

  onLoad() {
    // 显示加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true, // 设置mask，使用户无法与页面互动
    });

    // 模拟获取角色的延迟，确保加载提示有效
    setTimeout(() => {
      const app = getApp();
      const role = app.getRole(); // 获取全局角色

      if (!role) {
        console.error('未获取到用户角色，请检查登录逻辑！');
        wx.hideLoading();  // 隐藏加载提示
        return;
      }

      this.setData({ role });

      // 根据角色跳转到不同页面
      if (role === '0') {
        // 管理员
        wx.redirectTo({
          url: '/pages/feedback/admin/index', // 管理员页面
        });
      } else if (role === '1') {
        // 普通用户
        wx.redirectTo({
          url: '/pages/feedback/member/index', // 普通用户页面
        });
      } else {
        console.error('未知角色，请检查逻辑！');
      }

      // 隐藏加载提示
      wx.hideLoading();
    }, 500);  // 模拟延迟，确保加载动画显示足够时间
  },
});
