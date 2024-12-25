import request from '@/utils/request';

Page({
  data: {
    infoList: [], // 初始化为空数组，待接口返回后填充
    currentPage: 1, // 当前页
    totalPages: 7, // 总页数
    pageSize: 10, // 每页条数
    goToPage: 1, // 输入框中的页码
  },

  onLoad() {
    this.getAntiFraudInfo(); // 页面加载时获取反诈科普内容
    wx.setNavigationBarTitle({
      title: '反诈咨询集',
    });
  },

  // 获取反诈科普内容数据
  getAntiFraudInfo() {
    wx.showLoading({ title: '加载中' });

    // 使用 request.post 方法来发送 POST 请求
    request.post('/list/getInfoList', { current: this.data.currentPage, size: this.data.pageSize })
      .then((response) => {
        wx.hideLoading();
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

  // 点击反诈内容跳转详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id; // 获取文章 ID
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`,
    });
  },

  // 输入页码
  onInputPageChange(e) {
    const goToPage = parseInt(e.detail.value) || 1;
    this.setData({ goToPage });
  },

  // 跳转到指定页
  onGoToPage() {
    const goToPage = Math.min(Math.max(this.data.goToPage, 1), this.data.totalPages);
    this.setData({ currentPage: goToPage }, () => {
      this.getAntiFraudInfo();
    });
  },
  // 改变每页条数
  onPageSizeChange(e) {
    const pageSize = this.data.pageSizes[e.detail.value];
    this.setData({ pageSize, currentPage: 1 }, () => {
      this.getAntiFraudInfo();
    });
  },
});
