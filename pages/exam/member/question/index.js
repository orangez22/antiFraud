import request from '@/utils/request';

Page({
  data: {
    countdown: '', // 存储倒计时
    examQuestionList: [], // 用于存储考试题目列表
    currentPage: 1, // 当前页
    totalPages: 1, // 总页数
    examId: '', // 存储 examId
    duration: 0, // 存储倒计时的秒数
    pageSize: 5, // 每页显示的题目数量
    groupedQuestions: [], // 分组后的题目
    currentTypeIndex: 0, // 当前显示的题型索引
    showSubmitButton: false, // 是否显示提交按钮
    examRecordId: '', // 存储考试记录 ID
    isSubmitted: false, // 是否提交标记，防止再修改
    countdownInterval: null, // 用于存储倒计时定时器
  },

  onLoad(options) {
    // 获取传递过来的 examId、duration 和 examRecordId
    this.setData({
      examId: options.examId || '', // 设置 examId
      duration: this.convertToSeconds(options.duration) || 60 * 60, // 设置倒计时秒数，默认为 1 小时
      examRecordId: options.examRecordId || '', // 设置 examRecordId
    });
    this.startCountdown();
    this.fetchExamQuestions(options.examId); // 获取题目列表
  },

  // 将 HH:mm:ss 转换为秒数
  convertToSeconds(duration) {
    const timeParts = duration.split(':'); // 分割为小时、分钟和秒
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);

    // 计算总秒数
    return (hours * 60 * 60) + (minutes * 60) + seconds;
  },

  // 倒计时函数
  startCountdown() {
    let totalTime = this.data.duration; // 使用传递的倒计时秒数
    const interval = setInterval(() => {
      if (totalTime <= 0) {
        clearInterval(interval); // 时间到时清除定时器
        wx.showToast({
          title: '时间到！',
          icon: 'none'
        });
        this.submitExam(); // 自动提交
        return;
      }

      const minutes = Math.floor(totalTime / 60); // 获取剩余分钟
      const seconds = totalTime % 60; // 获取剩余秒数

      // 更新页面上的倒计时显示
      this.setData({
        countdown: `${this.formatTime(minutes)}:${this.formatTime(seconds)}`
      });

      totalTime--; // 每秒递减一次
    }, 1000);

    // 存储定时器引用，方便清除
    this.setData({
      countdownInterval: interval
    });
  },

  // 格式化时间，确保时间小于10时前面加0
  formatTime(time) {
    return time < 10 ? '0' + time : time;
  },

  // 获取考试题目列表
  fetchExamQuestions: function(examId) {
    const { currentPage, pageSize } = this.data;

    request.post('/exam/examQuestion/list', {
      examId, // 使用存储的 examId
      current: currentPage,
      size: pageSize,
    }).then((response) => {
      const { success, data, errorCode, message } = response;

      if (this.isSuccess(response)) {
        const examQuestionList = data.records || [];

        // 按题目类型进行分组并计算每个类型的分数总和
        const groupedQuestions = this.groupQuestionsByType(examQuestionList);

        // 处理选项字段
        groupedQuestions.forEach(group => {
          group.questions.forEach(item => {
            if (item.options) {
              item.optionsArray = Object.entries(item.options).map(([key, value]) => ({ key, value }));
            }
            item.mark = item.mark || '0';
          });
        });

        this.setData({
          groupedQuestions: groupedQuestions,
          totalPages: groupedQuestions.length, // 页数等于题型数
        });
        this.updateQuestionPage();
      } else {
        wx.showToast({
          title: message || '未能获取题目数据',
          icon: 'none'
        });
      }
    }).catch((error) => {
      console.error("获取考试题目失败", error);
      wx.showToast({
        title: '获取考试题目失败',
        icon: 'none'
      });
    });
  },

  // 按题目类型分组，并计算每个类型的分数总和
  groupQuestionsByType: function (examQuestions) {
    const grouped = [];
    
    examQuestions.forEach(item => {
      const existingGroup = grouped.find(group => group.questionTypeId === item.questionTypeId);
      
      if (existingGroup) {
        existingGroup.questions.push(item);
        existingGroup.totalMark += parseInt(item.mark);  // 累加分数
      } else {
        grouped.push({
          questionTypeName: item.questionTypeName,
          questionTypeId: item.questionTypeId,
          questions: [item],
          totalMark: parseInt(item.mark) || 0,  // 初始分数为该题的分数
        });
      }
    });
    
    return grouped;
  },

  // 判断接口返回的状态
  isSuccess(response) {
    const { success, data, errorCode, message } = response;
    return errorCode === 20000 && success && data; // 判断成功的标准
  },

  // 提交考试
  submitExam() {
    const { examId, examRecordId, groupedQuestions } = this.data;

    // 停止倒计时
    clearInterval(this.data.countdownInterval);

    // 构造用户答案
    const answers = [];
    groupedQuestions.forEach(group => {
      group.questions.forEach(question => {
        if (question.selected) {
          answers.push({
            questionId: question.id,  // 题目ID
            answer: question.selected  // 用户选择的答案
          });
        }
      });
    });

    // 提交数据
    request.post('/exam/examRecordDetail/submit', {
      recordId: examRecordId,  // 从传递的 examRecordId 获取
      answers,   // 用户的答案列表
    }).then((response) => {
      const { success, message } = response;

      if (success) {
        wx.showToast({
          title: '考试提交成功',
          icon: 'success'
        });
        // 跳转到结果页面
        wx.navigateTo({
          url: `/pages/exam/result/index?examId=${examId}`, 
        });
        // 禁用所有选择操作
        this.setData({
          isSubmitted: true
        });
      } else {
        wx.showToast({
          title: message || '提交失败',
          icon: 'none'
        });
      }
    }).catch((error) => {
      console.error("提交考试失败", error);
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      });
    });
  },

  // 切换题目类型页
  updateQuestionPage() {
    const { groupedQuestions, currentTypeIndex } = this.data;
    const currentGroup = groupedQuestions[currentTypeIndex] || {};
    const currentQuestions = Array.isArray(currentGroup.questions) ? currentGroup.questions : []; // Ensure it's an array

    this.setData({
      examQuestionList: currentQuestions,
      showSubmitButton: currentTypeIndex === groupedQuestions.length - 1, // 判断是否是最后一页
    });
  },

  // 下一页
  nextPage() {
    if (this.data.currentTypeIndex < this.data.totalPages - 1) {
      this.setData({
        currentTypeIndex: this.data.currentTypeIndex + 1,
        currentPage: 1, // 每次切换题型时重置为第一页
      });
      this.updateQuestionPage();
    }
  },

  // 上一页
  previousPage() {
    if (this.data.currentTypeIndex > 0) {
      this.setData({
        currentTypeIndex: this.data.currentTypeIndex - 1,
        currentPage: 1, // 每次切换题型时重置为第一页
      });
      this.updateQuestionPage();
    }
  },

  // 处理选项选择
  onOptionSelect(e) {
    const { value } = e.detail; // 获取选中的选项值
    const { groupedQuestions, currentTypeIndex, isSubmitted } = this.data;
    
    // 如果考试已经提交，禁止修改选择
    if (isSubmitted) {
      wx.showToast({
        title: '考试已提交，不能修改',
        icon: 'none'
      });
      return;
    }

    // 找到当前题型的题目列表
    const currentGroup = groupedQuestions[currentTypeIndex] || {};
    const currentQuestions = Array.isArray(currentGroup.questions) ? currentGroup.questions : []; 

    currentQuestions.forEach(question => {
      question.selected = ''; // 首先清空选中项
      // 遍历选项数组
      question.optionsArray.forEach(option => {
        if (option.key === value) {
          question.selected = value; // 设置选中值
        }
      });
    });

    // 更新题目列表数据
    this.setData({
      groupedQuestions: [...groupedQuestions], 
    });
  }
});
