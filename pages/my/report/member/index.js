import request from '@/utils/request';  // 引入自定义的 request 模块
const app = getApp();  // 获取应用实例

Page({
  data: {
    reportTypes: [], // 举报类型列表
    selectedTypeId: null, // 当前选择的举报类型ID，初始化为 null
    selectedTypeName: '', // 当前选择的举报类型名称
    phone: '',
    content: '',
    description: '', // 举报描述
    longitude: '', // 经度
    latitude: '', // 纬度
  },

  // 页面加载时获取举报类型列表
  onLoad: function () {
    this.fetchReportTypes(); // 获取举报类型
  },

  // 获取举报类型列表
  fetchReportTypes: function () {
    request.get('/report/reportType/list')  // 使用 GET 请求获取举报类型列表
      .then((response) => {
        const { success, data, errorCode, message } = response;
        if (success) {
          this.setData({
            reportTypes: data  // 假设返回数据格式是 { success: true, data: [...] }
          });
        } else {
          wx.showToast({
            title: message || '获取举报类型失败',
            icon: 'none'
          });
        }
      })
      .catch((error) => {
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      });
  },

  // 选择举报类型
  onSelectType: function (e) {
    const selectedTypeId = e.detail.value;  // 获取选中的举报类型ID的索引
    const selectedType = this.data.reportTypes[selectedTypeId];  // 根据索引获取选中的举报类型对象

    if (!selectedType) {
      wx.showToast({
        title: '无效的举报类型',
        icon: 'none'
      });
      return;
    }

    this.setData({
      selectedTypeId: selectedType.id, // 保存选中的举报类型的 id
      selectedTypeName: selectedType.name, // 保存选中的类型名称
    });

    // 如果选中的是 "其他"，并且描述为空，可以提示用户输入描述
    if (selectedType.name === '其他' && !this.data.description) {
      wx.showToast({
        title: '请填写举报描述',
        icon: 'none'
      });
    }
  },

  // 输入举报描述
  onInputDescription: function (e) {
    this.setData({
      description: e.detail.value  // 更新举报描述
    });
  },

  // 输入手机号
  onInputPhone: function (e) {
    this.setData({
      phone: e.detail.value  // 更新手机号
    });
  },

  // 输入举报内容
  onInputContent: function (e) {
    this.setData({
      content: e.detail.value  // 更新举报内容
    });
  },

  // 获取定位
  getLocation: function () {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        // 获取定位成功后更新经纬度
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        });
      },
      fail: () => {
        wx.showToast({
          title: '定位失败，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 提交举报信息
  submitReport: function () {
    const { selectedTypeId, phone, content, description, selectedTypeName, longitude, latitude } = this.data;

    // 获取全局的 memberId
    const memberId = app.getMemberId();

    if (!selectedTypeId || !phone || !content) {
      wx.showToast({
        title: '请填写所有必填信息',
        icon: 'none'
      });
      return;
    }

    // 如果举报类型为"其他"，确保用户填写了描述
    if (selectedTypeName === '其他' && !description) {
      wx.showToast({
        title: '请填写举报描述',
        icon: 'none'
      });
      return;
    }

    // 构造请求数据
    const reportData = {
      memberId: memberId,  // 添加 memberId
      typeId: selectedTypeId,  // 使用从列表中获取的 typeId
      phone: phone,
      content: content,
      description: selectedTypeName === '其他' ? description : '', // 只有"其他"类型需要传递描述
      longitude: longitude || null,  // 经纬度（可选）
      latitude: latitude || null,    // 经纬度（可选）
    };

    // 发起举报请求
    request.post('/report/reportInfo/add', reportData)  // 使用 POST 请求提交举报数据
      .then((response) => {
        const { success, message } = response;
        if (success) {
          wx.showToast({
            title: '举报成功',
            icon: 'success',
            duration: 2000
          });
        } else {
          wx.showToast({
            title: message || '举报失败',
            icon: 'none'
          });
        }
      })
      .catch((error) => {
        wx.showToast({
          title: '请求失败，请稍后重试',
          icon: 'none'
        });
      });
  }
});
