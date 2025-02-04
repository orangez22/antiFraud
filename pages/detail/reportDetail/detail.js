import request from '@/utils/request';

Page({
  data: {
    reportInfo: {},
  },

  onLoad(options) {
    const reportId = options.id;  // 获取举报ID
    this.getReportInfo(reportId);
  },

  // 获取举报信息
  getReportInfo(reportId) {
    wx.showLoading({ title: '加载举报信息...' });

    request.get(`/report/reportInfo/detail/${reportId}`)
      .then((response) => {
        wx.hideLoading();
        const { success, data, message } = response;

        if (success) {
          this.setData({
            reportInfo: data,
          });
        } else {
          wx.showToast({
            title: message || '举报信息加载失败',
            icon: 'none',
          });
        }
      })
      .catch((error) => {
        wx.hideLoading();
        console.error('获取举报信息失败：', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
      });
  },

  // 下载附件
  downloadAttachment() {
    const attachment = this.data.reportInfo.attachment;
    if (attachment) {
      wx.downloadFile({
        url: attachment,
        success(res) {
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success(result) {
              wx.showToast({
                title: '下载成功',
              });
            },
            fail() {
              wx.showToast({
                title: '下载失败',
              });
            },
          });
        },
      });
    }
  },

  // 标记为已处理
  onMarkAsRead() {
    const reportId = this.data.reportInfo.id;
    wx.showLoading({ title: '标记为已处理...' });

    request.put(`/report/reportInfo/handle/${reportId}`)
      .then((response) => {
        wx.hideLoading();
        if (response.success) {
          wx.showToast({
            title: '标记为已处理',
          });
          this.setData({
            'reportInfo.status': '2',  // 设置状态为已处理
          });
        } else {
          wx.showToast({
            title: response.message || '标记失败',
            icon: 'none',
          });
        }
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
      });
  },
});
