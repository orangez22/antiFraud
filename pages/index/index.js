Page({
  data: {
    swiperList: [
      { image_src: '/banner1.png' },
      { image_src: '/banner2.png' },
      { image_src: '/banner3.png' },
    ],
    infoList: [
      {
        id: 1,
        image: "/list1.png",
        title: "“举”多得！搜罗涉诈线索，抽奖赢好礼！",
        date: "2024-07-20",
        description: "反诈公共服务平台，为您的安全保驾护航！",
      },
      {
        id: 2,
        image: "/list2.jpg",
        title: "一张照片可实时视频换脸！谨防AI新型网络诈骗手段",
        date: "2024-07-19",
        description: "AI时代，肉眼所见的也不一定是真相。",
      },
      {
        id: 3,
        image: "/list3.png",
        title: "冒充领导诈骗已经是next level了！有时候你老板真不是你老板",
        date: "2024-08-01",
        description: "警惕冒充领导诈骗！",
      },
      {
        id: 4,
        image: "/list4.jpg",
        title: "焦点访谈丨警惕手机里的“李鬼” 遇到这种APP赶紧删→",
        date: "2024-07-28",
        description: "警惕手机里的“李鬼”式APP！",
      },
    ],
    searchValue: ''  // 存储搜索框的值
  },

  onLoad: function() {
    // 页面加载时可以进行一些数据初始化
    this.getSwiperList();
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

   // 获取反诈科普内容数据
   getAntiFraudInfo() {
    wx.request({
      url: 'https://example.com/api/anti-fraud',
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({ infoList: res.data.data });
        }
      },
      fail: () => {
        console.log('反诈内容接口异常，使用默认数据');
      }
    });
  },

  // 点击反诈内容跳转详情页
  goToDetail(e) {
    console.log("跳转至详情页")
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },
  onLoad() {
    // 对默认数据按日期排序
    const sortedList = this.sortInfoList(this.data.infoList);
    this.setData({
      infoList: sortedList,
    });
  },

  // 对反诈科普数据按日期从大到小排序
  sortInfoList(data) {
    return data.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  },

});
