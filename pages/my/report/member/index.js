import request from '@/utils/request';  // 引入自定义的 request 模块

Page({
  data: {
    reportTypes: [], // 举报类型列表
    selectedTypeId: '', // 当前选择的举报类型ID
    selectedTypeName: '', // 当前选择的举报类型名称
    phone: '',
    content: '',
    description: '', // 举报描述
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
          // 成功返回数据，存储举报类型列表
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
    const selectedTypeId = e.detail.value;  // 获取选中的举报类型ID
    const selectedType = this.data.reportTypes[selectedTypeId];  // 获取选中的举报类型

    this.setData({
      selectedTypeId: selectedTypeId,
      selectedTypeName: selectedType.name, // 保存选中的类型名称
    });
  },

  // 输入举报描述
  onInputDescription: function (e) {
    this.setData({
      description: e.detail.value  // 更新举报描述
    });
  },

  // 提交举报信息
  submitReport: function () {
    const { selectedTypeId, phone, content, description, selectedTypeName } = this.data;

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
      typeId: selectedTypeId,
      phone: phone,
      content: content,
      description: selectedTypeName === '其他' ? description : '', // 只有"其他"类型需要传递描述
    };

    // 发起举报请求
    request.post('/report/add', reportData)  // 使用 POST 请求提交举报数据
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



