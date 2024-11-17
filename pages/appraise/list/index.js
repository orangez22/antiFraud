// pages/appraise/list/index.js
//import { config } from '../../../utils/config.js';

Page({
  data: {
    page: 1,
    size: 10,
    total: 0,
    totalPage: 0,
    list: [1,2,3,4,5]
  },

  onLoad() {
    const authorization = wx.getStorageSync('authorization');
    if (!authorization || Object.keys(authorization).length === 0) {
      wx.showToast({
        icon: 'none',
        title: '尚未登录, 请先登录'
      });
      setTimeout(() => {
        wx.removeStorageSync('authorization');
        wx.reLaunch({
          url: '../verificationcodelogin/verificationcodelogin'
        });
      }, 777);
      return;
    }
    this.findListPage();
  },

  findListPage() {
    wx.showLoading({
      title: '加载中'
    });
    const authorization = wx.getStorageSync('authorization');
    const {
      page,
      size
    } = this.data;

    wx.request({
      url: `${config.api_base_url}member/evaluate/${page}/${size}`,
      header: {
        'AUTH': authorization.token
      },
      success: (res) => {
        const {
          status,
          data
        } = res.data;
        if (status.flag) {
          this.setData({
            total: data.total,
            totalPage: this.pageTotal(data.total, size),
            list: this.data.list.concat(data.rows)
          });
        } else {
          this.setData({
            list: []
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '请求失败, 网络异常',
          icon: 'none'
        });
      },
      complete: () => {
        wx.stopPullDownRefresh();
        wx.hideLoading();
      }
    });
  },

  pageTotal(rowCount, pageSize) {
    if (!rowCount) return 0;
    return Math.ceil(rowCount / pageSize);
  },

  // 返回上一页
  back() {
    wx.navigateBack();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      page: 1,
      list: [],
      total: 0,
      totalPage: 0
    });
    this.findListPage();
  },

  // 上滑加载更多
  onReachBottom() {
    const {
      page,
      totalPage
    } = this.data;
    if (page < totalPage) {
      this.setData({
        page: page + 1
      });
      this.findListPage();
    } else {
      wx.showToast({
        title: '已经到底部了',
        icon: 'none'
      });
    }
  }
});