import request from '@/utils/request';

Page({
  data: {
    examId: null, // 存储传递进来的 examId
    questionTypes: [], // 存储题目类型列表
    selectedQuestionType: null, // 当前选中的题目类型
    questionText: '', // 题目内容
    options: [], // 题目选项
    labels: [], // 存储选项标签（A:, B:, C:, D:）
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
        if (response.errorCode === 20000) {
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

    let labels = [];
    if (selectedType.name === '选择题') {
      labels = ['A:', 'B:', 'C:', 'D:'];
    } else if (selectedType.name === '判断题') {
      labels = ['A:', 'B:'];
    }

    this.setData({
      selectedQuestionType: selectedType,
      isMultipleChoice: selectedType.name === '选择题', // 判断是否为选择题
      isTrueFalse: selectedType.name === '判断题', // 判断是否为判断题
      options: selectedType.name === '选择题' ? [''] : selectedType.name === '判断题' ? ['', ''] : [], // 设置默认选项
      labels: labels,  // 存储选项标签
    });
  },

  // 输入题目内容
  onQuestionTextInput: function (e) {
    this.setData({
      questionText: e.detail.value,
    });
  },

  // 输入选项内容
  onOptionInput: function (e) {
    const index = e.target.dataset.index; // 获取当前选项的索引
    const options = [...this.data.options]; // 拷贝现有选项数组
    options[index] = e.detail.value; // 更新对应索引的选项内容
    this.setData({
      options, // 更新选项数组
    });
  },

  // 添加选项
  onAddOption: function () {
    if (this.data.isMultipleChoice) {
      // 选择题最多4个选项
      if (this.data.options.length < 4) {
        this.setData({
          options: [...this.data.options, ''], // 每次新增一个空的选项
        });
      }
    } else if (this.data.isTrueFalse) {
      // 判断题最多2个选项
      if (this.data.options.length < 2) {
        this.setData({
          options: [...this.data.options, ''], // 每次新增一个空的选项
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

    // 格式化选项为正确的形式
    let formattedOptions = {};

    if (this.data.isMultipleChoice) {
      // 选择题处理 A、B、C、D 选项
      const labels = ['A', 'B', 'C', 'D'];
      options.forEach((option, index) => {
        if (option) {
          formattedOptions[labels[index]] = option; // 使用字母作为键
        }
      });
    } else if (this.data.isTrueFalse) {
      // 判断题处理 A 或 B 选项
      const labels = ['A', 'B'];
      options.forEach((option, index) => {
        if (option) {
          formattedOptions[labels[index]] = option; // 使用字母作为键
        }
      });
    }

    // 构造请求数据
    const examQuestionDTO = {
      examId,
      questionTypeId: selectedQuestionType.id, // 题目类型 ID
      questionText,
      options: formattedOptions, // 使用正确格式的选项
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
          // 延迟 0.5 秒后返回上一页
        setTimeout(() => {
          wx.navigateBack({
            delta: 1  // 返回上一级页面
          });
        }, 500); // 0.5 秒后执行返回操作
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