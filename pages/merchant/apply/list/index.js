import request from '@/utils/request';
import { isLogin } from '@/utils/common';
import {merchantPageApi} from '@/api/merchantApply'
Page({
  data: {
    applys: [], // 申请数据
    page: 1,
    size: 10,
    totalPage: 0
  },

  onLoad() {
    this.loadData();
  },

  loadData() {
    wx.showLoading({ title: '加载中' });

    merchantPageApi({ current: this.data.page, size: this.data.size })
    .then(({ success, data }) => {
      wx.hideLoading();
      if (success) {
        const formattedData = data.records.map((item) => ({
          ...item,
          statusText: this.getStatusText(item.status),
          statusClass: this.getStatusClass(item.status)
        }));
        this.setData({
          applys: this.data.applys.concat(formattedData),
          totalPage: Math.ceil(data.total / this.data.size)
        });
      }
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
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

  // 查看原因
  onClickSeeReason(e) {
    const { remark } = e.currentTarget.dataset.item;
    wx.showModal({ content: remark || '暂无原因', showCancel: false });
  },

  // 新增申请
  addApply() {
    wx.navigateTo({ url: '/pages/merchant/apply/index/index' });
  },
});