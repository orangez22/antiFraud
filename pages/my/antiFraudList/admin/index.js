import request from '@/utils/request';

Page({
  data: {
    infoList: [], // 初始化为空数组，待接口返回后填充
    currentPage: 1, // 当前页
    totalPages: 1, // 总页数
    pageSize: 10, // 每页条数 (10条/页)
    goToPage: '', // 输入框中的页码, 默认为空
    searchTitle: '', // 搜索关键词
    startDate: '', // 开始日期
    endDate: '', // 结束日期
    pageSizes: [3, 5, 10], // 可选择的每页条数
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

    console.log('传递给接口的搜索关键词:', this.data.searchTitle); // 添加日志输出

    // 直接从 data 获取当前的查询条件
    request.post('/list/getInfoList', {
      current: this.data.currentPage,
      size: this.data.pageSize,
      searchTitle: this.data.searchTitle, // 搜索字段
      startDate: this.data.startDate ? this.data.startDate + ' 00:00:00' : '',
      endDate: this.data.endDate ? this.data.endDate + ' 23:59:59' : '',
    })
      .then((response) => {
        wx.hideLoading();
        const { success, data, errorCode, message } = response;

        // 处理返回的数据
        if (errorCode === 20000) {
          console.log("接口返回成功，数据为：", data);
          // 确保这里是从正确的字段提取数据
          this.setData({
            infoList: data.records || data, // 如果没有 records，则直接使用 data
            totalPages: Math.ceil(data.total / this.data.pageSize), // 计算总页数
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

  // 搜索输入框内容变化
  onSearchInput(e) {
    this.setData({
      searchTitle: e.detail.value, // 更新搜索关键词
    });
  },

  // 执行搜索操作
  onSearch() {
    this.setData({ currentPage: 1, goToPage: '' }, () => { // 将goToPage设为空
      this.getAntiFraudInfo(); // 重新加载数据
    });
  },

  // 选择开始日期
  onStartDateChange(e) {
    this.setData({
      startDate: e.detail.value, // 更新开始日期
    });
  },

  // 选择结束日期
  onEndDateChange(e) {
    this.setData({
      endDate: e.detail.value, // 更新结束日期
    });
  },

  // 输入页码
  onInputPageChange(e) {
    let goToPage = e.detail.value.trim();  // 获取输入框的值并去除空格
    if (goToPage === '') {
      this.setData({ goToPage: '' }); // 如果输入框为空，则不设置页码
      return;
    }
    goToPage = parseInt(goToPage) || 1; // 解析输入的页码，若输入不合法则默认 1
    if (goToPage < 1) goToPage = 1;  // 页码不能小于 1
    if (goToPage > this.data.totalPages) goToPage = this.data.totalPages;  // 页码不能大于总页数
    this.setData({ goToPage });
  },

  // 跳转到指定页
  onGoToPage() {
    let goToPage = parseInt(this.data.goToPage) || 1; // 获取用户输入的页码
    if (goToPage < 1) goToPage = 1;  // 确保页码不小于1
    if (goToPage > this.data.totalPages) goToPage = this.data.totalPages;  // 确保页码不大于总页数

    this.setData({ currentPage: goToPage }, () => {
      this.getAntiFraudInfo(); // 重新加载数据
    });
  },

  // 改变每页条数
  onPageSizeChange(e) {
    const pageSize = this.data.pageSizes[e.detail.value];
    this.setData({ pageSize, currentPage: 1, goToPage: '' }, () => {
      this.getAntiFraudInfo(); // 重新加载数据
    });
  },
});
