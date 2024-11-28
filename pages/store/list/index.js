import { isLogin } from '@/utils/common'
import { storePageApi } from '@/api/storeApply'
import {
  getUser
} from '@/utils/auth'
import {downloadQRCodeApi} from "@/api/storeApi";
import {getId} from "@/utils/auth";
import {getPageApi} from "../../../api/storeApi";
Page({
  data: {
    stories: [], // 存储申请数据
    current: 1,    // 当前页码
    pageSize: 10,   // 每页大小
    total: 0,   // 总记录数
    totalPage: 0 // 总页数
  },

  onLoad() {
    isLogin(); // 检查登录状态
  },

  onShow() {
    this.resetData(); // 初始化数据`
    this.getStories(); // 加载数据
  },

  onReachBottom() {
    const { page, totalPage } = this.data;
    if (page < totalPage) {
      this.setData({ page: page + 1 });
      this.getStories();
    } else {
      wx.showToast({
        title: '已经到底部了',
        icon: 'none'
      });
    }
  },

  onPullDownRefresh() {
    this.resetData(); // 重置分页数据
    this.getStories(); // 加载第一页数据
    wx.stopPullDownRefresh(); // 停止下拉刷新

  },

  resetData() {
    this.setData({
      stories: [],
      current: 1,
      pageSize: 10,
      total: 0,
      totalPage: 0
    });
  },
  getStatusText(status) {
    switch (status) {
      case '0': return '待审核';
      case '1': return '审核通过';
      case '2': return '审核失败';
      default: return '未知状态';
    }
  },

  getStatusClass(status) {
    switch (status) {
      case '0': return 'state-pending';
      case '1': return 'state-approved';
      case '2': return 'state-rejected';
      default: return '';
    }
  },

  downloadQRCode(event){
    isLogin()
    const merchantId=getId()
    const storeId = event.currentTarget.dataset.id;
    downloadQRCodeApi({
      'text':`/pages/pay/index/index?merchantId=${merchantId}&storeId=${storeId}`,
      'size': 300,
      'filePath': ''
    }).then(res => {
      console.log(res)
      // 可以在这里执行下载二维码的逻辑
      wx.showToast({
        title: `正在下载店铺 ${id} 的二维码`,
        icon: 'none'
      });
    })
  },

  // 查看详情
  onClickWSDetailInfo(e) {
    const item = e.currentTarget.dataset.item;
    if (!item.id) return;
    wx.navigateTo({
      url: `../submitdetails/submitdetails?id=${item.id}`
    });
  },

  // 计算总页数
  pageTotal(rowCount, pageSize) {
    return rowCount ? Math.ceil(rowCount / pageSize) : 0;
  },

  // 获取申请列表
  getStories() {

    wx.showLoading({ title: '加载中' });

    getPageApi({'current':this.data.current,'pageSize':this.data.pageSize}).then((res) => {
      wx.hideLoading();
      const { success, data } = res;
      if (success && data.records) {
        const { records, total } = data;
        this.setData({
          applys: this.data.applys.concat(records), // 拼接新数据
          total, // 总记录数
          totalPage: this.pageTotal(total, this.data.pageSize) // 总页数
        });
      } else {
        this.handleEmptyData();
      }
    })
        .catch((err) => {
          console.log(err);
          wx.hideLoading();
          this.handleEmptyData();
          wx.showToast({
            title: '请求失败，网络异常',
            icon: 'none'
          });
        });
  },

  handleEmptyData() {
    this.setData({
      stories: [],
      total: 0,
      totalPage: 0
    });
  },

  isMerchant(){
    let user = getUser()
    if(user.isMerchant == "0"){
      wx.redirectTo({
        url: 'pages/my/index'
      })
    }
  }
});