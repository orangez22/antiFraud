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
        content: "反诈公共服务平台，为您的安全保驾护航！",
        author:"反诈科普平台"
      },
      {
        id: 2,
        image: "/list2.jpg",
        title: "一张照片可实时视频换脸！谨防AI新型网络诈骗手段",
        date: "2024-07-19",
        content: "AI时代，肉眼所见的也不一定是真相。",
        author:"反诈科普平台"
      },
      {
        id: 3,
        image: "/list3.png",
        title: "冒充领导诈骗已经是next level了！有时候你老板真不是你老板",
        date: "2024-08-01",
        content: "警惕冒充领导诈骗！",
        author:"反诈科普平台"
      },
      {
        id: 4,
        image: "/list4.jpg",
        title: "焦点访谈丨警惕手机里的“李鬼” 遇到这种APP赶紧删→",
        date: "2024-07-28",
        content: "警惕手机里的“李鬼”式APP！",
        author:"反诈科普平台"
      },
    ],
    searchValue: ''  // 存储搜索框的值
  },

  onLoad() {
    this.getAntiFraudInfo();
    // 对默认数据按日期排序
    const sortedList = this.sortInfoList(this.data.infoList);
    this.setData({
      infoList: sortedList,
    })
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
    console.log("发送了请求");
    wx.request({
      method: 'POST',
      url: 'https://ample.com', // 后端接口路径
      success: (res) => {
        // 检查接口返回的 code 是否为 200
        if (res.data && res.data.code === 200) {
          console.log("接口返回成功，数据为：", res.data.data);
          this.setData({ infoList: res.data.data });
        } else {
          // 如果 code 不为 200，提示错误并使用默认数据
          console.error("接口返回错误：", res.data.message || "未知错误");
          const defaultData = this.sortInfoList(this.data.infoList);
          this.setData({ infoList: defaultData });
        }
      },
      fail: (err) => {
        // 如果请求失败，进入 fail 回调
        console.error("请求失败，错误信息：", err);
        const defaultData = this.sortInfoList(this.data.infoList);
        this.setData({ infoList: defaultData });
      },
    });
  },
  goToMoreInfo() {
    wx.navigateTo({
      url: '/pages/detail/detail',
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


  // 对反诈科普数据按日期从大到小排序
  sortInfoList(data) {
    return data.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  },

});
