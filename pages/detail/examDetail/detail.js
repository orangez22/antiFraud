import request from '@/utils/request';

Page({
  data: {
    examRecordId: '', // 存储转换后的 examRecordId
    examDetails: [], // 存储考试记录详情
    groupedExamDetails: [], // 存储按题型分组的考试记录详情
    totalScore: 0, // 总分
  },

  onLoad(options) {
    // 获取传递过来的 recordId（这里传递的是 recordId）
    const recordId = options.recordId || '';
    
    // 将 recordId 转换为 examRecordId（在此我们假设转换逻辑）
    const examRecordId = this.convertRecordIdToExamRecordId(recordId);

    // 设置 examRecordId
    this.setData({
      examRecordId: examRecordId
    });

    console.log("examRecordId:", this.data.examRecordId);  // 调试输出

    // 获取考试记录详情
    this.fetchExamRecordDetails(examRecordId);
  },

  // 模拟转换 recordId 为 examRecordId 的函数（根据实际需求）
  convertRecordIdToExamRecordId(recordId) {
    // 这里可以根据实际情况进行转换
    return recordId; // 如果 recordId 已经是 examRecordId 的形式，直接返回
  },

  // 获取考试记录详情
  fetchExamRecordDetails(examRecordId) {
    request.get('/exam/examRecordDetail/list', {
      examRecordId: examRecordId, // 传递正确的 examRecordId
    }).then((response) => {
      const { success, data, message } = response;

      if (success) {
        let examDetails = data || [];

        // 处理选项字段，将选项转化为数组形式，便于 WXML 遍历
        examDetails.forEach(item => {
          if (item.questionOption) {
            // 将 options 对象转换为键值对数组，方便在 WXML 中遍历
            item.optionsArray = Object.entries(item.questionOption).map(([key, value]) => ({ key, value }));
          }
          item.mark = item.mark || '0'; // 默认分值为 0
        });

        // 按题型进行分组
        const groupedExamDetails = this.groupQuestionsByType(examDetails);

        // 计算总分
        const totalScore = examDetails.reduce((total, detail) => {
          return total + (parseFloat(detail.score) || 0); // 累加每题得分
        }, 0);

        // 更新页面数据
        this.setData({
          examDetails: examDetails,
          groupedExamDetails: groupedExamDetails,
          totalScore: totalScore,
        });
      } else {
        wx.showToast({
          title: message || '获取考试记录失败',
          icon: 'none',
        });
      }
    }).catch((error) => {
      console.error('获取考试记录详情失败:', error);
      wx.showToast({
        title: '获取考试记录失败',
        icon: 'none',
      });
    });
  },

  // 按题目类型分组
  groupQuestionsByType: function (examDetails) {
    const grouped = [];

    examDetails.forEach(item => {
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

  // 显示题目选项
  getQuestionOptions(options) {
    return Object.keys(options).map(key => `${key}: ${options[key]}`).join('， ');
  }
});
