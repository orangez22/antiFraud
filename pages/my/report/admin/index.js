import request from '@/utils/request'

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
          const reportListWithColor = data.records.map(item => ({
            ...item,
            statusColor: this.getStatusColor(item.status) // 计算并设置状态颜色
          }));

          this.setData({
            reportList: reportListWithColor,
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

  // 删除举报信息
  deleteReport(e) {
    const reportId = e.currentTarget.dataset.reportid;

    if (!reportId) {
      wx.showToast({
        title: '无效的举报ID',
        icon: 'none',
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: '您确定要删除这条举报信息吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中' });

          // 修改请求，删除操作需要将id作为URL路径的一部分传递
          request.delete(`/report/reportInfo/delete/${reportId}`)
            .then((response) => {
              wx.hideLoading();
              const { success, message } = response;

              if (success) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                });
                this.getReportList(); // 删除后重新加载列表
              } else {
                wx.showToast({
                  title: message || '删除失败',
                  icon: 'none',
                });
              }
            })
            .catch((error) => {
              wx.hideLoading();
              wx.showToast({
                title: '删除失败，请稍后重试',
                icon: 'none',
              });
            });
        }
      }
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

  // 根据状态返回背景颜色
  getStatusColor(status) {
    switch (status) {
      case '0': // 已读
        return '#A8E6A3'; // 柔和的绿色背景
      case '1': // 未读
        return '#FF8C8C'; // 温暖的红色背景
      case '2': // 已处理
        return '#8EC8FF'; // 清新的蓝色背景
      default:
        return '#F1F1F1'; // 温和的灰色背景
    }
  },

  // 启用下拉刷新
  onPullDownRefresh() {
    // 重置为第一页并重新加载举报信息列表
    this.setData({
      currentPage: 1,
      reportList: [], // 清空当前列表
    }, () => {
      this.getReportList(); // 重新请求数据
    });

    // 停止下拉刷新动画
    wx.stopPullDownRefresh();
  },
});
