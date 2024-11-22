// pages/store/apply/index.js
import request from '@/utils/request';
import {
  getUser
} from '@/utils/auth'
Page({
  data: {
    isChain: '0',
    memberId: getUser().id,
    storeName: '',
    imageUrl: '', // 存储选择的图片URL
    coverImageUrl: '',
    phone: '',
    idCard: '',
    email: '',
    businessLicense: '',
    bankName: '',
    bankAccount: '',
    accountName: '',
    accountType: '',
    accountTypeName: '',
    accountTypeOptions: ['对私', '对公'], // 下拉框选项
    industryId: '',
    province: '福建省',
    city: '厦门市',
    area: '思明区',
    address: '',
    recommendation: '',
    businessHoursStart: '09:00',
    businessHoursEnd: '22:00',
    longitude: '',
    latitude: '',
    region: ['福建省', '厦门市', '思明区'],
  },

  onLoad() {

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
  // 处理下拉框选中事件
  onPickerChange(e) {
    const selectedIndex = e.detail.value; // 获取选中的索引
    const selectedType = this.data.accountTypeOptions[selectedIndex]; // 获取选中的类型
    this.setData({
      accountTypeName: selectedType, // 更新选中的账户类型
      accountType: selectedIndex, // 更新选中的账户类型
    });
  },
  onInputChange(e) {
    const field = e.currentTarget.dataset.field; // 获取字段名称
    this.setData({
      [field]: e.detail.value // 更新对应字段值
    });
  },
  // 选择店内图片
  chooseImage: function () {
    wx.chooseImage({
      count: 1, // 只允许选择1张图片
      sizeType: ['original', 'compressed'], // 可以选择原图或压缩图
      sourceType: ['album', 'camera'], // 可以选择相册或相机
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]; // 获取选择的图片路径
        this.setData({
          imageUrl: tempFilePath, // 设置图片路径
        });

        // 可选：上传图片到服务器
        this.uploadImage(tempFilePath);
      },
      fail: (err) => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'none',
        });
      }
    });
  },
  chooseCoverImage: function () {
    wx.chooseImage({
      count: 1, // 只允许选择1张图片
      sizeType: ['original', 'compressed'], // 可以选择原图或压缩图
      sourceType: ['album', 'camera'], // 可以选择相册或相机
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]; // 获取选择的图片路径
        this.setData({
          coverImageUrl: tempFilePath, // 设置图片路径
        });

        // 可选：上传图片到服务器
        this.uploadImage(tempFilePath);
      },
      fail: (err) => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'none',
        });
      }
    });
  },

  onRecommendationInput(e) {
    this.setData({
      recommendation: e.detail.value
    });
  },

  onClickSubmitBtn() {
    console.log(this.data);
    // 执行提交申请操作(向后端发起请求)
    request({
      url: '/apply/storeApply/apply',
      data: this.data,
      method: 'post'
    }).then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    })
    //请求完成后跳转到列表页面
    wx.redirectTo({
      url: '/pages/store/apply/list/index'
    })
  },
});