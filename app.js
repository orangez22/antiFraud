App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    });
  },
  globalData: {
    memberId: null, // 全局变量
    userInfo: null,
    role:null
  },

  // 设置 memberId 并存储到本地
  setMemberId(memberId) {
    this.globalData.memberId = memberId;
    wx.setStorageSync('memberId', memberId); // 存储到本地
    console.log('设置全局 memberId:', memberId);
  },

  // 优先从本地存储获取 memberId
  getMemberId() {
    if (!this.globalData.memberId) {
      this.globalData.memberId = wx.getStorageSync('memberId') || null; // 从本地存储获取
    }
    console.log('获取全局 memberId:', this.globalData.memberId);
    return this.globalData.memberId;
  },
   // 设置角色并存储
   setRole(role) {
    this.globalData.role = role;
    wx.setStorageSync('role', role);
    console.log('设置全局角色:', role);
  },

  // 获取角色
  getRole() {
    if (!this.globalData.role) {
      this.globalData.role = wx.getStorageSync('role') || null;
    }
    console.log('获取全局角色:', this.globalData.role);
    return this.globalData.role;
  },
});
