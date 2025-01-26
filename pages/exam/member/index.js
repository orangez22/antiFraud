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
    })
  }})