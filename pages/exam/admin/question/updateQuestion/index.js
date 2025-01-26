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
    const { questionId } = options; // 获取页面传递过来的 questionId
    if (questionId) {
      this.setData({ questionId: questionId }); // 保存 questionId 到 data 中
    }
    this.fetchExamQuestions(); // 加载指定的考试题目数据
  },

  // 获取特定考试的题目
  fetchExamQuestions: function () {
    const { currentPage, pageSize, questionId, questionTypeId } = this.data;
    // 请求后台获取指定考试的题目列表数据
    request.post('/exam/examQuestion/list', {
      current: currentPage,
      size: pageSize,
      questionId: questionId, // 传递 questionId
      questionTypeId: questionTypeId // 传递 questionTypeId（如果有）
    })
      .then((response) => {
        const { success, data, errorCode } = response;

        if (errorCode === 20000) {
          // 请求成功，更新页面数据
          const examQuestionList = data.records || [];

          // 获取 examId
          const examId = examQuestionList[0]?.examId; // 假设返回的数据里至少有一个题目
          if (examId) {
            this.setData({ examId }); // 动态设置 examId
          }

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

  // 处理修改题目文本框的输入
  handleQuestionTextChange: function (e) {
    const { id } = e.currentTarget.dataset;
    const value = e.detail.value;
    const updatedExamQuestionList = this.data.examQuestionList.map(group => {
      group.questions.forEach(item => {
        if (item.id === id) {
          item.questionText = value; // 更新题目内容
        }
      });
      return group;
    });
    this.setData({ examQuestionList: updatedExamQuestionList });
  },

  // 处理修改选项输入
  handleOptionChange: function (e) {
    const { optionKey } = e.currentTarget.dataset;
    const { value } = e.detail;
    const updatedExamQuestionList = this.data.examQuestionList.map(group => {
      group.questions.forEach(item => {
        const option = item.optionsArray.find(option => option.key === optionKey);
        if (option) {
          option.value = value; // 更新选项内容
        }
      });
      return group;
    });
    this.setData({ examQuestionList: updatedExamQuestionList });
  },

  // 处理修改答案输入
  handleAnswerChange: function (e) {
    const { id } = e.currentTarget.dataset;
    const value = e.detail.value;
    const updatedExamQuestionList = this.data.examQuestionList.map(group => {
      group.questions.forEach(item => {
        if (item.id === id) {
          item.answer = value; // 更新答案
        }
      });
      return group;
    });
    this.setData({ examQuestionList: updatedExamQuestionList });
  },

  // 提交更新
  handleSubmit: function () {
    const { examQuestionList } = this.data;
    const updatedQuestions = [];
  
    examQuestionList.forEach(group => {
      group.questions.forEach(item => {
        // 动态生成选项对象，确保对象的键是动态的
        const optionsObject = {};
        
        // 动态填充 optionsObject
        item.optionsArray.forEach(option => {
          optionsObject[option.key] = option.value;
        });
  
        // 输出转换后的对象，查看效果
        console.log(optionsObject);  // 在控制台看到的是动态生成的对象
  
        // 创建符合 ExamQuestionDTO 格式的对象
        const examQuestionDTO = {
          questionId: item.id,
          questionText: item.questionText,
          answer: item.answer,
          options: optionsObject,  // 动态生成的选项对象
          questionTypeId: item.questionTypeId,
          examId: this.data.examId  // 确保传递 examId
        };
  
        updatedQuestions.push(examQuestionDTO); // 添加到 updatedQuestions 数组
      });
    });
  // 使用 wx.request 发送 PUT 请求
  wx.request({
    url: 'http://localhost:28080/exam/examQuestion/update',  // 请求的URL
    method: 'PUT',  // 设置请求方法为 PUT
    data: updatedQuestions[0],  // 直接发送第一个题目对象
    header: {
      'Content-Type': 'application/json'  // 设置请求头为 JSON 格式
    },
    success: (response) => {
      const { success, errorCode } = response.data;  // 获取响应数据
      if (errorCode === 20000) {
        wx.showToast({
          title: '题目创建成功',
          icon: 'success',
        });
        // 延迟 0.5 秒后返回上一页
      setTimeout(() => {
        wx.navigateBack({
          delta: 1  // 返回上一级页面
        });
      }, 500); // 0.5 秒后执行返回操作
      } else {
        wx.showToast({ title: '更新失败', icon: 'none' });
      }
    },
    fail: () => {
      wx.showToast({ title: '请求失败', icon: 'none' });
    }
  });
}
});
