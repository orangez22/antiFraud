import request from '@/utils/request'
import {
  validateForm,
  isLogin
} from '@/utils/common'

import {
  setToken,
  getToken
} from '@/utils/auth'
Page({
  data: {
    industryIndex: 0,
    industryArray: [],
    isChain: '0',
    memberId: undefined,
    merchantName: '',
    contract: '',
    phone: '',
    cityPickerValueDefault: [0, 0, 0],
    label: '',
    provinceId: '',
    cityId: '',
    areaId: '',
    address: '',
    recommendation: '',
    longitude: '',
    latitude: '',
    businessHoursStart: '09:00',
    businessHoursEnd: '22:00',
    region:['福建省','厦门市','思明区','集美区']
  },

  onLoad() {
    isLogin()
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  clearField(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: '' });
  },

  onIndustryChange(e) {
    const index = e.detail.value;
    this.setData({
      industryIndex: index,
      industryId: this.data.industryArray[index].id
    });
  },

  bindStartTimeChange(e) {
    this.setData({ businessHoursStart: e.detail.value });
  },

  bindEndTimeChange(e) {
    this.setData({ businessHoursEnd: e.detail.value });
  },

  openAddressPicker() {
    // 选择地址逻辑
  },

  onSubmit() {
    if (!this.validateFields()) return;
    const formData = {
      merchantName: this.data.merchantName,
      contract: this.data.contract,
      phone: this.data.phone,
      provinceId: this.data.provinceId,
      cityId: this.data.cityId,
      areaId: this.data.areaId,
      address: this.data.address,
      recommendation: this.data.recommendation
    };
    // 提交逻辑
  },

  validateFields() {
    const {  merchantName, contract, phone, industryId, label, address } = this.data;
    if (!merchantName) return this.showError('请填写商家');
    if (!contract) return this.showError('请填写联系人');
    if (!phone) return this.showError('请填写联系电话');
    if (!industryId) return this.showError('请选择行业');
    if (!label) return this.showError('请选择省市区');
    if (!address) return this.showError('请输入详细地址');
    return true;
  },

  showError(msg) {
    wx.showToast({ icon: 'none', title: msg });
    return false;
  },
  bindRegionChange:function(e){
    console.log(e.detail.value)
  }
});