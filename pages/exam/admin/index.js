import request from '@/utils/request';

Page({
  data: {
    examList: [], // 用于存储考试信息
    examDuration: '00:00', // 存储选择的考试时长
    title: '', // 存储考试标题
  },

  // 页面加载时获取考试列表
  onLoad: function () {
    this.fetchExams(); // 加载考试数据
  },

  // 获取所有考试信息
  fetchExams: function () {
    request.get('/exam/examInfo/list', {
      // 向后端请求获取考试列表数据
    })
    .then((response) => {
      const { success, data, errorCode, message } = response;
      if (response.errorCode === 20000) {
        console.log("接口返回成功，数据为：", data);

        // 假设返回的数据是一个考试列表
        this.setData({
          examList: data || [],
        });
      } else {
        console.error("接口返回成功，但无有效数据：", message || "未知错误");
        this.setData({
          examList: [], // 如果没有数据，显示空列表
        });
      }
    })
    .catch((error) => {
      console.error("请求失败，错误信息：", error);
      this.setData({
        examList: [], // 请求失败时，显示空列表
      });
    });
  },

  // 查看考试信息
  viewExam: function (e) {
    const examId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/exam-detail/exam-detail?id=${examId}`, // 跳转到考试详情页
    });
  },

  // 删除考试
  deleteExam: function (e) {
    const examId = e.currentTarget.dataset.id;
    request.delete(`/exam/examInfo/delete/${examId}`, {
      // 发送删除请求
    })
    .then((response) => {
      const { success, errorCode, message } = response;
      if (response.errorCode === 20000) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        this.fetchExams(); // 删除成功后刷新考试列表
      } else {
        wx.showToast({
          title: message || '删除失败',
          icon: 'none'
        });
      }
    })
    .catch((error) => {
      wx.showToast({
        title: '请求失败',
        icon: 'none'
      });
    });
  },

  // 处理考试标题输入
  handleTitleChange: function (e) {
    this.setData({
      title: e.detail.value
    });
  },

  // 处理考试时长选择
  handleDurationChange: function (e) {
    let examDuration = e.detail.value;
    if (!examDuration.includes(":")) {
      examDuration = `${examDuration}:00`; // 如果没有冒号分隔符，添加秒数
    } else if (examDuration.split(":").length === 2) {
      examDuration = `${examDuration}:00`; // 如果时长只有小时和分钟，添加秒数
    }
    this.setData({
      examDuration: examDuration // 格式化后的时间
    });
  },

  // 创建新的考试
createExam: function () {
  let { title, examDuration } = this.data;

  if (!title || examDuration === '00:00') {
    wx.showToast({
      title: '请输入考试标题和选择考试时长',
      icon: 'none'
    });
    return;
  }

  // 确保格式是 HH:mm:ss
  if (!examDuration.includes(":")) {
    examDuration = `${examDuration}:00`;
  } else if (examDuration.split(":").length === 2) {
    examDuration = `${examDuration}:00`;
  }

  // 格式化当前时间为 "yyyy-MM-dd HH:mm:ss"
  const currentTime = new Date();
  const formattedTime = currentTime.getFullYear() + '-' + 
                        String(currentTime.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(currentTime.getDate()).padStart(2, '0') + ' ' + 
                        String(currentTime.getHours()).padStart(2, '0') + ':' + 
                        String(currentTime.getMinutes()).padStart(2, '0') + ':' + 
                        String(currentTime.getSeconds()).padStart(2, '0');

  const examInfo = {
    title: title,
    duration: examDuration, // 格式化后的时长
    createTime: formattedTime, // 当前时间作为创建时间（无时区）
  };

  request.post('/exam/examInfo/create', examInfo)
    .then((response) => {
      const { success, errorCode, message } = response;
      if (response.errorCode === 20000) {
        wx.showToast({
          title: '创建成功',
          icon: 'success'
        });

        // 清空表单数据
        this.setData({
          title: '', // 清空标题
          examDuration: '00:00', // 清空时长
        });

        this.fetchExams(); // 创建成功后刷新考试列表
      } else {
        wx.showToast({
          title: message || '创建失败',
          icon: 'none'
        });
      }
    })
    .catch((error) => {
      wx.showToast({
        title: '请求失败',
        icon: 'none'
      });
    });
}
});
