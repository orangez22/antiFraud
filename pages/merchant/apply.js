Page({
  data: {
    industryIndex: 0,
    industryArray: [],
    isChain: '0',
    memberId: undefined,
    companyName: '',
    storeName: '',
    contract: '',
    phone: '',
    industryId: '',
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
    businessHoursEnd: '22:00'
  },

  onLoad() {
    const authorization = wx.getStorageSync('authorization');
    if (!authorization) {
      wx.showToast({ icon: 'none', title: '尚未登录，请先登录' });
      wx.reLaunch({ url: '../login/login' });
      return;
    }
    this.getIndustryData();
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  clearField(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: '' });
  },

  setIsChain(e) {
    const isChain = e.currentTarget.dataset.value;
    this.setData({
      isChain,
      companyName: isChain === '0' ? '' : this.data.companyName
    });
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
      isChain: this.data.isChain,
      companyName: this.data.companyName,
      storeName: this.data.storeName,
      contract: this.data.contract,
      phone: this.data.phone,
      industryId: this.data.industryId,
      provinceId: this.data.provinceId,
      cityId: this.data.cityId,
      areaId: this.data.areaId,
      address: this.data.address,
      recommendation: this.data.recommendation
    };
    // 提交逻辑
  },

  validateFields() {
    const { isChain, companyName, storeName, contract, phone, industryId, label, address } = this.data;
    if (!storeName) return this.showError('请填写店铺名称');
    if (!contract) return this.showError('请填写联系人');
    if (!phone) return this.showError('请填写联系电话');
    if (!industryId) return this.showError('请选择行业');
    if (!label) return this.showError('请选择省市区');
    if (!address) return this.showError('请输入详细地址');
    if (isChain === '1' && !companyName) return this.showError('请填写公司名称');
    return true;
  },

  showError(msg) {
    wx.showToast({ icon: 'none', title: msg });
    return false;
  }
});