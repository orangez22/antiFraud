import request from '@/utils/request';

Page({
  data: {
    reportList: [], // 举报信息列表
    currentPage: 1, // 当前页码
    totalPages: 1, // 总页数
    pageSize: 10, // 每页条数
    goToPage: 1, // 用户输入的跳转页码
    description: '', // 搜索描述
    memberId: 0, // 用户ID
  },

  onLoad() {
    const app = getApp();
    const memberId = app.getMemberId(); // 从全局方法获取用户ID

    if (!memberId) {
      wx.showToast({
        title: '用户未登录',
        icon: 'none',
      });
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/login/phone/code/index',
        });
      }, 1500);
      return;
    }

    this.setData({ memberId });
    this.getReportList(); // 加载举报信息列表
    wx.setNavigationBarTitle({
      title: '举报列表',
    });
  },

  // 获取举报信息列表
  getReportList() {
    const { currentPage, pageSize, memberId, description } = this.data;

    wx.showLoading({ title: '加载中' });

    // 请求后端数据
    request.post('/report/reportInfo/list', { memberId, current: currentPage, size: pageSize, description })
      .then((response) => {
        wx.hideLoading();
        const { success, data, errorCode, message } = response;

        if (success) {
          this.setData({
            reportList: data.records || [],
            totalPages: data.totalPages || 1,
          });
        } else {
          wx.showToast({
            title: message || '加载失败',
            icon: 'none',
          });
          this.setData({
            reportList: [],
          });
        }
      })
      .catch((error) => {
        wx.hideLoading();
        console.error('请求失败：', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
        this.setData({
          reportList: [],
        });
      });
  },

  // 搜索输入事件
  onSearchInput(e) {
    this.setData({ description: e.detail.value });
  },

  // 搜索按钮点击事件
  onSearch() {
    this.setData({ currentPage: 1 }, () => {
      this.getReportList();
    });
  },

  // 查看举报详情
  goToDetail(e) {
    const reportId = e.currentTarget.dataset.reportid;

    if (!reportId) {
      wx.showToast({
        title: '无效的举报ID',
        icon: 'none',
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/detail/reportDetail/detail?id=${reportId}`,
    });
  },

  // 输入跳转页码
  onInputPageChange(e) {
    const goToPage = parseInt(e.detail.value) || 1;
    this.setData({ goToPage });
  },

  // 跳转到指定页码
  onGoToPage() {
    const { goToPage, totalPages } = this.data;
    const page = Math.min(Math.max(goToPage, 1), totalPages);

    if (page !== goToPage) {
      this.setData({ currentPage: page }, () => {
        this.getReportList();
      });
    }
  },

  // 每页条数改变事件
  onPageSizeChange(e) {
    const pageSize = this.data.pageSizes[e.detail.value];
    this.setData({ pageSize, currentPage: 1 }, () => {
      this.getReportList();
    });
  },
});
