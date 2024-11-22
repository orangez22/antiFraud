import { isLogin, getIdByToken ,validateForm} from '@/utils/common';
import { getUser } from '@/utils/auth';
import {merchantPageApi} from '@/api/merchantApply'
import {merchantApplyApi} from "../../../../api/merchantApply";

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
    const formData = this.getFormData();

    // 校验表单数据
    validateForm(formData, this.rules)
        .then(() => {
          // 如果校验通过，则提交表单数据
          return merchantApplyApi(formData);
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
          // 如果校验失败或提交失败，显示错误信息
          this.showError(error || '提交失败');
        });
  }
  ,

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
  rules: {
    merchantName: [{ required: true, message: '商户名称必填' }],
    idCard: [{ required: true, message: '法人身份证号码必填' }],
    contract: [{ required: true, message: '联系人必填' }],
    phone: [{ required: true, message: '联系电话必填' }],
    email: [
      { required: true, message: '邮箱必填' },
      { pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, message: '请输入有效的邮箱' }
    ],
    recommendId: [
      // 推荐人不是必填项，但如果有值，需要校验是否为有效ID
      { pattern: /^[0-9]*$/, message: '推荐人ID必须为数字' }
    ],
    address: [{ required: true, message: '详细地址必填' }],
    recommendation: [
      // 品牌介绍不是必填项，如果有值，可以设置最大长度限制
      { max: 500, message: '品牌介绍不能超过500个字符' }
    ]
  },

  showError(msg) {
    wx.showToast({ icon: 'none', title: msg });
    return false;
  }
});