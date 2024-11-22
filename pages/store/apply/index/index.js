import request from '@/utils/request';
import { getUser } from '@/utils/auth';
import {storeApplyApi} from '@/api/storeApply'
Page({
  data: {
    memberId: getUser().id,
    storeName: '',
    imageUrl: '', // 店内照片
    coverImageUrl: '', // 店面照片
    phone: '',
    idCard: '',
    email: '',
    businessLicense: '',
    bankName: '',
    bankAccount: '',
    accountName: '',
    accountType: '', // 账户类型索引
    accountTypeName: '', // 账户类型名称
    accountTypeOptions: ['对私', '对公'], // 账户类型选项
    province: '福建省',
    city: '厦门市',
    area: '思明区',
    address: '',
    recommendation: '',
    businessHoursStart: '09:00',
    businessHoursEnd: '22:00',
    region: ['福建省', '厦门市', '思明区'],
  },

  // 省市区选择
  bindRegionChange(e) {
    const [province, city, area] = e.detail.value;
    this.setData({
      region: e.detail.value,
      province,
      city,
      area,
    });
  },

  // 下拉选择账户类型
  onPickerChange(e) {
    const selectedIndex = e.detail.value;
    const selectedType = this.data.accountTypeOptions[selectedIndex];
    this.setData({
      accountType: selectedIndex,
      accountTypeName: selectedType,
    });
  },

  // 通用输入事件处理
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value,
    });
  },

  // 图片选择处理器
  chooseImage(type) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          [type]: tempFilePath,
        });

        // 可选：上传图片到服务器
        this.uploadImage(tempFilePath, type);
      },
      fail: () => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'none',
        });
      },
    });
  },

  // 选择店内照片
  chooseImageInside() {
    this.chooseImage('imageUrl');
  },

  // 选择店面照片
  chooseImageCover() {
    this.chooseImage('coverImageUrl');
  },

  // 上传图片
  uploadImage(filePath, type) {
    wx.uploadFile({
      url: '/upload/image', // 替换为实际上传接口
      filePath,
      name: 'file',
      success: (res) => {
        const { data } = JSON.parse(res.data);
        this.setData({
          [type]: data.url,
        });
        wx.showToast({ title: '上传成功', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '上传失败', icon: 'none' });
      },
    });
  },

  // 提交表单
  onClickSubmitBtn() {
    if (!this.validateForm()) return;

    const formData = this.getFormData();

    storeApplyApi(formData).then((res) => {
        if (res.success) {
          wx.showToast({ title: '提交成功', icon: 'success' });
          wx.redirectTo({ url: '/pages/store/apply/list/index' });
        } else {
          wx.showToast({ title: res.message || '提交失败', icon: 'none' });
        }
      })
      .catch(() => {
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      });
  },

  // 获取表单数据
  getFormData() {
    const {
      storeName,
      imageUrl,
      coverImageUrl,
      phone,
      idCard,
      email,
      businessLicense,
      bankName,
      bankAccount,
      accountName,
      accountType,
      province,
      city,
      area,
      address,
      recommendation,
      businessHoursStart,
      businessHoursEnd,
    } = this.data;

    return {
      storeName,
      imageUrl,
      coverImageUrl,
      phone,
      idCard,
      email,
      businessLicense,
      bankName,
      bankAccount,
      accountName,
      accountType,
      province,
      city,
      area,
      address,
      recommendation,
      businessHoursStart,
      businessHoursEnd,
    };
  },

  // 校验表单数据
  validateForm() {
    const {
      storeName,
      phone,
      idCard,
      businessLicense,
      address,
    } = this.data;

    if (!storeName) return this.showValidationError('请填写店铺名称');
    if (!phone) return this.showValidationError('请填写联系电话');
    if (!idCard) return this.showValidationError('请填写身份证号');
    if (!businessLicense) return this.showValidationError('请填写营业执照编号');
    if (!address) return this.showValidationError('请填写详细地址');

    return true;
  },

  // 显示校验错误
  showValidationError(message) {
    wx.showToast({ title: message, icon: 'none' });
    return false;
  },
});