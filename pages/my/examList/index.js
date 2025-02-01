import request from '@/utils/request';

Page({
  data: {
    recordList: [], // 考试记录数据
    currentPage: 1, // 当前页码
    totalPages: 1, // 总页数
    pageSize: 10, // 每页条数
    goToPage: 1, // 用户输入的跳转页码
  },

  onLoad() {
    this.getExamRecords();
    wx.setNavigationBarTitle({
      title: '考试记录',
    });
  },

  // 获取考试记录
  getExamRecords() {
    const { currentPage, pageSize } = this.data;

    wx.showLoading({ title: '加载中' });

    request.post('/exam/examRecord/list', { current: currentPage, size: pageSize })
      .then((response) => {
        wx.hideLoading();
        const { success, data, errorCode, message } = response;

        if (errorCode === 20000) {
          this.setData({
            recordList: data.records || [],
            totalPages: data.totalPages || 1,
          });
        } else {
          wx.showToast({
            title: message || '加载失败',
            icon: 'none',
          });
          this.setData({ recordList: [] });
        }
      })
      .catch((error) => {
        wx.hideLoading();
        console.error('请求失败：', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
        this.setData({ recordList: [] });
      });
  },
    // 点击跳转至详情页，并传递 recordId
    goToDetail(e) {
      const recordId = e.currentTarget.dataset.recordid;
      wx.navigateTo({
        url: `/pages/detail/examDetail/detail?recordId=${recordId}`,
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
    const targetPage = Math.min(Math.max(goToPage, 1), totalPages);

    this.setData({ currentPage: targetPage }, () => {
      this.getExamRecords();
    });
  },

  // 修改每页显示条数
  onPageSizeChange(e) {
    const pageSize = this.data.pageSizes[e.detail.value];
    this.setData({ pageSize, currentPage: 1 }, () => {
      this.getExamRecords();
    });
  },
});
