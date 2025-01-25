import request from '@/utils/request';

Page({
  data: {
    examId: null, // 存储传递进来的 examId
    questionTypes: [], // 存储题目类型列表
    selectedQuestionType: null, // 当前选中的题目类型
    questionText: '', // 题目内容
    options: [], // 题目选项
    answer: '', // 正确答案
    isMultipleChoice: false, // 判断是否是选择题
    isTrueFalse: false, // 判断是否是判断题
  },

  // 页面加载时获取题目类型列表
  onLoad: function (options) {
    const { examId } = options; // 获取页面传递过来的 examId
    if (examId) {
      this.setData({ examId }); // 保存 examId 到 data 中
    }
    this.loadQuestionTypes(); // 加载题目类型数据
  },

  // 获取题目类型列表
  loadQuestionTypes: function () {
    request.post('/exam/examQuestionType/getAll', {})
      .then((response) => {
        const { success, data, errorCode } = response;
        if (errorCode === 20000) {
          this.setData({
            questionTypes: data || [],
          });
        } else {
          wx.showToast({ title: '加载题目类型失败', icon: 'none' });
        }
      })
      .catch(() => {
        wx.showToast({ title: '请求失败', icon: 'none' });
      });
  },

  // 选择题目类型
  onQuestionTypeChange: function (e) {
    const index = e.detail.value;
    const selectedType = this.data.questionTypes[index];
    this.setData({
      selectedQuestionType: selectedType,
      isMultipleChoice: selectedType.name === '选择题', // 判断是否为选择题
      isTrueFalse: selectedType.name === '判断题', // 判断是否为判断题
      options: selectedType.name === '选择题' ? [''] : selectedType.name === '判断题' ? ['A:', 'B:'] : [], // 设置默认选项
    });
  },

  // 获取选项标签（A, B, C, D）
  getOptionLabel: function (index) {
    console.log("执行了 getOptionLabel", index);
    if (this.data.isMultipleChoice==true) {
      console.log("执行了")
      const labels = ['A:', 'B:', 'C:', 'D:'];
      return labels[index] || `选项${index + 1}:`; // 返回 A、B、C、D 标签
    }
    if (this.data.isTrueFalse) {
      const labels = ['A:', 'B:'];
      return labels[index] || `选项${index + 1}:`; // 判断题显示A:B
    }
    return ''; // 对于其他题型没有选项标签
  },

  // 输入题目内容
  onQuestionTextInput: function (e) {
    this.setData({
      questionText: e.detail.value,
    });
  },

  // 输入选项内容
  onOptionInput: function (e) {
    const index = e.target.dataset.index
    console.log(index);
    const options = [...this.data.options];
    options[index] = e.detail.value;
    this.setData({
      options,
    });
  },

  // 添加选项
  onAddOption: function () {
    if (this.data.isMultipleChoice) {
      // 选择题最多4个选项
      if (this.data.options.length < 4) {
        this.setData({
          options: [...this.data.options, ''],
        });
      }
    } else if (this.data.isTrueFalse) {
      // 判断题最多2个选项
      if (this.data.options.length < 2) {
        this.setData({
          options: [...this.data.options, ''],
        });
      }
    }
  },

  // 删除选项
  onRemoveOption: function (e) {
    const index = e.target.dataset.index;
    const options = this.data.options.filter((_, i) => i !== index); // 删除选项
    this.setData({
      options,
    });
  },

  // 输入正确答案
  onAnswerInput: function (e) {
    this.setData({
      answer: e.detail.value,
    });
  },

  // 提交试题
  onSubmit: function () {
    const { questionText, selectedQuestionType, options, answer, examId } = this.data;

    if (!questionText || !answer || !selectedQuestionType.id) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    // 构造请求数据
    const examQuestionDTO = {
      examId,
      questionTypeId: selectedQuestionType.id, // 题目类型 ID
      questionText,
      options: options.reduce((acc, option, idx) => {
        acc[`option${idx + 1}`] = option; // 将选项格式化为 Map
        return acc;
      }, {}),
      answer,
    };

    // 发起请求提交新增题目
    request.post('/exam/examQuestion/create', examQuestionDTO)
      .then((response) => {
        const { success, errorCode, message } = response;
        if (errorCode === 20000) {
          wx.showToast({
            title: '题目创建成功',
            icon: 'success',
          });
          wx.navigateBack(); // 提交成功后返回上一页
        } else {
          wx.showToast({
            title: message || '题目创建失败',
            icon: 'none',
          });
        }
      })
      .catch(() => {
        wx.showToast({
          title: '请求失败',
          icon: 'none',
        });
      });
  },
});
