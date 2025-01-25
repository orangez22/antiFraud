import request from '@/utils/request';

Page({
  data: {
    examQuestionList: [], // 用于存储考试题目列表
    currentPage: 1, // 当前页
    pageSize: 1, // 每页条数
    examId: null, // 存储传递进来的 examId
    questionId: null, // 从上一个页面获取的题目ID
    questionTypeId: '' // 可选的题目类型ID
  },

  // 页面加载时获取考试题目列表
  onLoad: function (options) {
    const { examId, questionId } = options; // 获取页面传递过来的 examId 和 questionId
    if (examId) {
      this.setData({ examId: examId }); // 保存 examId 到 data 中
    }
    if (questionId) {
      this.setData({ questionId: questionId }); // 保存 questionId 到 data 中
    }
    this.fetchExamQuestions(); // 加载指定的考试题目数据
  },

  // 获取特定考试的题目
  fetchExamQuestions: function () {
    const { currentPage, pageSize, examId, questionId, questionTypeId } = this.data;
    console.log(questionId)
    // 请求后台获取指定考试的题目列表数据
    request.post('/exam/examQuestion/list', {
      current: currentPage,
      size: pageSize,
      examId: examId,  // 传递 examId
      questionId: questionId, // 传递 questionId
      questionTypeId: questionTypeId // 传递 questionTypeId（如果有）
    })
      .then((response) => {
        const { success, data, errorCode } = response;

        if (errorCode === 20000) {
          // 请求成功，更新页面数据
          const examQuestionList = data.records || [];

          // 按题目类型进行分组
          const groupedQuestions = this.groupQuestionsByType(examQuestionList);

          // 处理选项字段
          groupedQuestions.forEach(group => {
            group.questions.forEach(item => {
              if (item.options) {
                item.options = item.options || {};  
                // 将 options 对象转换为键值对数组，方便在 WXML 中遍历
                item.optionsArray = Object.entries(item.options).map(([key, value]) => ({ key, value }));
              }
            });
          });

          this.setData({ examQuestionList: groupedQuestions });
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

  // 按题目类型分组题目
  groupQuestionsByType: function (examQuestionList) {
    const grouped = [];
    examQuestionList.forEach(item => {
      const group = grouped.find(g => g.typeId === item.questionTypeId);
      if (group) {
        group.questions.push(item);
      } else {
        grouped.push({ typeId: item.questionTypeId, typeName: item.questionTypeName, questions: [item] });
      }
    });
    return grouped;
  },

  // 页面下拉加载更多
  onReachBottom: function () {
    this.setData({ currentPage: this.data.currentPage + 1 });
    this.fetchExamQuestions();
  },

  // 搜索框更新参数并重新请求数据
  handleSearchChange: function (e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({ [field]: value }, () => {
      this.fetchExamQuestions(); // 每次更改搜索条件后重新请求数据
    });
  }
});
