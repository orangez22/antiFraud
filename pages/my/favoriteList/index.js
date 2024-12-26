import request from '@/utils/request';

Page({
  data: {
    infoList: [], // 收藏列表数据
    currentPage: 1, // 当前页码
    totalPages: 1, // 总页数
    pageSize: 10, // 每页条数
    goToPage: 1, // 用户输入的跳转页码
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
      // 跳转到登录页面
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/login/phone/code/index', // 替换为你的登录页面路径
        });
      }, 1500);
      return;
    }

    this.setData({ memberId });
    this.getFavoriteInfo(); // 加载收藏列表
    wx.setNavigationBarTitle({
      title: '收藏列表',
    });
  },

  // 获取收藏列表
  getFavoriteInfo() {
    const { currentPage, pageSize, memberId } = this.data;

    wx.showLoading({ title: '加载中' });

    request.post('/list/favoriteList', { memberId, current: currentPage, size: pageSize })
      .then((response) => {
        wx.hideLoading();
        const { success, data, errorCode, message } = response;

        if (errorCode === 20000) {
          this.setData({
            infoList: data.records || [],
            totalPages: data.totalPages || 1,
          });
        } else {
          wx.showToast({
            title: message || '加载失败',
            icon: 'none',
          });
          this.setData({
            infoList: [],
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
          infoList: [],
        });
      });
  },

  goToDetail(e) {
    // 获取反诈信息的 ID
  console.log('e.currentTarget.dataset:', e.currentTarget.dataset); // 打印 dataset
    const antiFraudInfoId = e.currentTarget.dataset.antifraudinfoid; 
    console.log('antiFraudInfoId:', antiFraudInfoId);  // 打印一下 ID 来调试
    if (!antiFraudInfoId) {
      wx.showToast({
        title: '无效的 ID',
        icon: 'none',
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/detail/detail?id=${antiFraudInfoId}`, // 传递 antiFraudInfoId 到详情页
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
      this.getFavoriteInfo();
    });
  },

  // 修改每页显示条数
  onPageSizeChange(e) {
    const pageSize = this.data.pageSizes[e.detail.value];
    this.setData({ pageSize, currentPage: 1 }, () => {
      this.getFavoriteInfo();
    });
  },
});
