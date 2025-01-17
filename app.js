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
    role: null,
    avatar: null, // 新增字段：头像
    name: null, // 新增字段：用户名
    phone: null, // 新增字段：手机号
    gender: null, // 新增字段：性别
  },

  // 设置 memberId 并存储到本地
  setMemberId(memberId) {
    this.globalData.memberId = memberId;
    wx.setStorageSync('memberId', memberId); // 存储到本地
    console.log('设置全局 memberId:', memberId);
  },

  // 获取 memberId
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

  // 设置头像
  setAvatar(avatar) {
    this.globalData.avatar = avatar;
    wx.setStorageSync('avatar', avatar);
    console.log('设置全局头像:', avatar);
  },

  // 获取头像
  getAvatar() {
    if (!this.globalData.avatar) {
      this.globalData.avatar = wx.getStorageSync('avatar') || null;
    }
    console.log('获取全局头像:', this.globalData.avatar);
    return this.globalData.avatar;
  },

  // 设置用户名
  setName(name) {
    this.globalData.name = name;
    wx.setStorageSync('name', name);
    console.log('设置全局用户名:', name);
  },

  // 获取用户名
  getName() {
    if (!this.globalData.name) {
      this.globalData.name = wx.getStorageSync('name') || null;
    }
    console.log('获取全局用户名:', this.globalData.name);
    return this.globalData.name;
  },

  // 设置手机号
  setPhone(phone) {
    this.globalData.phone = phone;
    wx.setStorageSync('phone', phone);
    console.log('设置全局手机号:', phone);
  },

  // 获取手机号
  getPhone() {
    if (!this.globalData.phone) {
      this.globalData.phone = wx.getStorageSync('phone') || null;
    }
    console.log('获取全局手机号:', this.globalData.phone);
    return this.globalData.phone;
  },

  // 设置性别
  setGender(gender) {
    this.globalData.gender = gender;
    wx.setStorageSync('gender', gender);
    console.log('设置全局性别:', gender);
  },

  // 获取性别
  getGender() {
    if (!this.globalData.gender) {
      this.globalData.gender = wx.getStorageSync('gender') || null;
    }
    console.log('获取全局性别:', this.globalData.gender);
    return this.globalData.gender;
  },
});