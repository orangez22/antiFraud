// pages/merchant/apply/index/index.js
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
    idCard:'',
    email:'',
    recommendation: '',
    region: ['福建省', '厦门市', '思明区'],
    province: '',
    city: '',
    area: ''
  },

  onLoad() {
    isLogin(); // 检查登录状态
    getIdByToken(); // 获取 Token 中的 ID
  },

  onShow() {
    isLogin(); // 检查登录状态
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field; // 获取字段名称
    this.setData({
      [field]: e.detail.value // 更新对应字段值
    });
  },
  onRecommendationInput(e) {
    this.setData({
      recommendation: e.detail.value
    });
  },
  bindStartTimeChange(e) {
    this.setData({
      businessHoursStart: e.detail.value // 更新开始时间
    });
  },

  bindEndTimeChange(e) {
    this.setData({
      businessHoursEnd: e.detail.value // 更新结束时间
    });
  },

  bindRegionChange(e) {
    const [province, city, area] = e.detail.value; // 解构省市区
    this.setData({
      region: e.detail.value,
      province: province,
      city: city,
      area: area
    });
  },

  apply() {
    // 校验必填字段
    if (!this.validateFields()) return;

    // 构造提交数据
    const formData = {
      merchantName: this.data.merchantName,
      contract: this.data.contract,
      phone: this.data.phone,
      province: this.data.province,
      city: this.data.city,
      area: this.data.area,
      idCard:this.data.idCard,
      email:this.data.email,
      address: this.data.address,
      recommendation: this.data.recommendation,
      businessHoursStart: this.data.businessHoursStart,
      businessHoursEnd: this.data.businessHoursEnd
    };

    // 提交入驻申请
    request({
      url:'/apply/merchantApply',
      data:formData,
      method:'post'
    })
      .then((res) => {
        if(res.success){
          setTimeout(function(){
            wx.showToast({ icon: 'success', title: '提交成功' });
          },1000)
          wx.navigateTo({
            url: '/pages/merchant/apply/list/index',
          })
        }
      })
      .catch((error) => {
        console.log(error)
        wx.showToast({ icon: 'none', title: error.message || '提交失败' });
      });
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