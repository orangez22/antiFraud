Page({
  data: {
    swiperList: [
      { goods_id: 1, image_src: 'banner1.jpg' },
      { goods_id: 2, image_src: 'banner2.jpg' },
      { goods_id: 3, image_src: 'banner3.jpg' }
    ],
    searchValue: ''  // 存储搜索框的值
  },

  onLoad: function() {
    // 页面加载时可以进行一些数据初始化
    this.getSwiperList();
  },

  // 获取轮播图数据（模拟请求数据）
  getSwiperList() {
    this.setData({
      swiperList: [
        { goods_id: 1, image_src: '/banner1.png' },
        { goods_id: 2, image_src: '/banner2.png' },
        { goods_id: 3, image_src: '/banner3.png' }
      ]
    });
  },

  // 搜索框输入事件
  onSearchInput(e) {
    this.setData({
      searchValue: e.detail.value  // 获取搜索框的输入值
    });
  },

  // 搜索按钮点击事件
  onSearchClick() {
    const searchValue = this.data.searchValue.trim();
    if (searchValue) {
      wx.navigateTo({
        url: `/subpkg/search/search?query=${searchValue}`  // 跳转到搜索结果页面
      });
    } else {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
    }
  },

  // 跳转到详情页面
  goToDetail() {
    console.log("跳转")
    wx.navigateTo({
      url: '/subpkg/detail/detail'  // 假设有一个详情页面
    });
  }
});
