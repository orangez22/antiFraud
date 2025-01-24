import request from '@/utils/request';

Page({
  data: {
    examQuestionList: [], // 用于存储考试题目列表
    currentPage: 1, // 当前页
    pageSize: 10, // 每页条数
    examId: null, // 存储传递进来的 examId
  },

  // 页面加载时获取考试题目列表
  onLoad: function (options) {
    const { id } = options; // 获取页面传递过来的 examId
    if (id) {
      this.setData({ examId: id }); // 保存 examId 到 data 中
      this.fetchExamQuestions(id); // 加载指定的考试题目数据
    }
  },

  // 获取特定考试的题目
  fetchExamQuestions: function (examId) {
    const { currentPage, pageSize } = this.data;

    // 请求后台获取指定考试的题目列表数据
    request.post('/exam/examQuestion/list', { current: currentPage, size: pageSize, examId })
      .then((response) => {
        const { success, data, errorCode } = response;

        if (errorCode === 20000) {
          // 请求成功，更新页面数据
          const examQuestionList = data.records || [];
          // 处理选项字段
          examQuestionList.forEach(item => {
            if (item.options) {
              item.options = item.options || {};  
              // 将 options 对象转换为键值对数组，方便在 WXML 中遍历
              item.optionsArray = Object.entries(item.options).map(([key, value]) => ({ key, value }));
            }
          });

          this.setData({ examQuestionList });
        } else {
          // 请求失败时，清空数据并显示错误提示
          this.setData({ examQuestionList: [] });
          wx.showToast({ title: '获取题目失败', icon: 'none' });
        }
      })
      .catch(() => {
        // 请求失败时，清空数据并显示失败提示
        this.setData({ examQuestionList: [] });
        wx.showToast({ title: '请求失败', icon: 'none' });
      });
  },

  // 删除题目
  deleteExamQuestion: function (e) {
    const questionId = e.currentTarget.dataset.id;
    // 确认是否删除题目
    wx.showModal({
      title: '删除确认',
      content: '确定要删除该题目吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用删除接口，使用 DELETE 方法，URL 中传递 questionId
          request.delete(`/exam/examQuestion/delete/${questionId}`)
            .then((response) => {
              const { success, errorCode, message } = response;
              if (errorCode === 20000) {
                // 删除成功后刷新题目列表
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                this.fetchExamQuestions(this.data.examId); // 重新加载当前 examId 下的题目
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
        }
      }
    });
  },

  // 跳转到创建新题目页面
  navigateToCreate: function () {
    wx.navigateTo({
      url: '/pages/exam-question-create/exam-question-create', // 跳转到创建页面
    });
  },

  // 更新题目
  updateExamQuestion: function (e) {
    const questionId = e.currentTarget.dataset.id;

    // 跳转到更新页面，并传递题目ID
    wx.navigateTo({
      url: `/pages/exam-question-update/exam-question-update?id=${questionId}`,
    });
  }
});
