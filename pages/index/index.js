import request from '@/utils/request';

Page({
  data: {
    swiperList: [
      { image_src: '/banner1.png' },
      { image_src: '/banner2.png' },
      { image_src: '/banner3.png' },
    ],
    infoList: [], // 初始化为空数组，待接口返回后填充
    searchValue: '', // 存储搜索框的值
  },

  onLoad() {
    this.getAntiFraudInfo(); // 页面加载时获取反诈科普内容
  },

  // 搜索框输入事件
  onSearchInput(e) {
    this.setData({
      searchValue: e.detail.value, // 获取搜索框的输入值
    });
  },

  // 搜索按钮点击事件
  onSearchClick() {
    const searchValue = this.data.searchValue.trim();
    if (searchValue) {
      wx.navigateTo({
        url: `/subpkg/search/search?query=${searchValue}`, // 跳转到搜索结果页面
      });
    } else {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none',
      });
    }
  },

  // 获取反诈科普内容数据
  getAntiFraudInfo() {
    wx.showLoading({ title: '加载中' });

    // 使用 request.post 方法来发送 POST 请求
    request.post('/list/list/getInfoList', { current: 1, size: 4 })
      .then((response) => {
        wx.hideLoading();
        console.log("完整的返回数据：", response); // 输出完整的返回数据
        const { success, data, errorCode, message } = response;

        // 处理返回的数据
        if (errorCode === 20000) {
          console.log("接口返回成功，数据为：", response.data);
          this.setData({
            infoList: response.data, // 直接将接口返回的数据设置到 infoList
          });
        } else {
          console.error("接口返回成功但无有效数据：", message || "未知错误");
          // 如果没有数据，显示空列表或提示
          this.setData({
            infoList: [],
          });
        }
      })
      .catch((error) => {
        wx.hideLoading();
        console.error("请求失败，错误信息：", error);
        // 请求失败时，使用空列表
        this.setData({
          infoList: [],
        });
      });
  },

  // 点击查看更多
  goToMoreInfo() {
    wx.navigateTo({
      url: '/pages/detail/detail',
    });
  },

  // 点击反诈内容跳转详情页
  goToDetail(e) {
    console.log("跳转至详情页");
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`,
    });
  },
});
