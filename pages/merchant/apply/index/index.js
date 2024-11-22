import request from '@/utils/request';
import { isLogin, getIdByToken } from '@/utils/common';
import { getUser } from '@/utils/auth';

Page({
  data: {
    memberId: getUser().id,
    merchantName: '',
    contract: '',
    phone: '',
    address: '',
    idCard: '',
    email: '',
    recommendation: '',
    recommendId:'',
    region: ['福建省', '厦门市', '思明区'],
    province: '福建省',
    city: '厦门市',
    area: '思明区'
  },

  onLoad() {
    this.ensureLogin();
  },

  onShow() {
    this.ensureLogin();
  },

  ensureLogin() {
    if (!isLogin()) {
      wx.redirectTo({ url: '/pages/login/index' });
      return;
    }
    getIdByToken(); // 可根据需要使用
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  bindRegionChange(e) {
    const [province, city, area] = e.detail.value;
    this.setData({
      region: e.detail.value,
      province,
      city,
      area
    });
  },

  apply() {
    if (!this.validateFields()) return;

    const formData = this.getFormData();

    request({
      url: '/apply/merchantApply',
      method: 'POST',
      data: formData
    })
      .then((res) => {
        if (res.success) {
          wx.showToast({ icon: 'success', title: '提交成功' });
          wx.navigateTo({ url: '/pages/merchant/apply/list/index' });
        } else {
          this.showError(res.message || '提交失败');
        }
      })
      .catch((error) => {
        this.showError(error.message || '提交失败');
      });
  },

  getFormData() {
    const {
      merchantName, contract, phone, province, city, area, idCard, email, address, recommendation,recommendId
    } = this.data;

    return {
      merchantName,
      contract,
      phone,
      province,
      city,
      area,
      idCard,
      email,
      address,
      recommendation,
      recommendId
    };
  },

  validateFields() {
    const { merchantName, contract, phone, address } = this.data;

    if (!merchantName) return this.showError('请填写商家名称');
    if (!contract) return this.showError('请填写联系人');
    if (!phone) return this.showError('请填写联系电话');
    if (!address) return this.showError('请输入详细地址');

    return true;
  },

  showError(msg) {
    wx.showToast({ icon: 'none', title: msg });
    return false;
  }
});