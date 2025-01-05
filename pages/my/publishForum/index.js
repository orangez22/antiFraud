import request from '@/utils/request';

Page({
  data: {
    form: {
      forumId: '', // 文章 ID
      title: '', // 标题
      content: '', // 内容
      categoryId: '', // 分类 ID
      categoryName: '', // 分类名称（显示用）
      image: '', // 图片
    },
    categories: [], // 分类列表
    previewContent: '', // 预览内容
  },

  onLoad() {
    // 加载分类列表
    this.getCategories();
  },

  // 获取分类列表
  getCategories() {
    request.post('/forum/forumCategory/selectList')
      .then((response) => {
        const { success, data, errorCode, message } = response;
        if (response.errorCode === 20000) {
          // 将分类数据转换为前端需要的格式
          const categories = data.map(item => ({
            id: item.value,
            name: item.label,
          }));
          this.setData({ categories });
        } else {
          wx.showToast({
            title: message || '分类加载失败',
            icon: 'none',
          });
        }
      })
      .catch((error) => {
        console.error('获取分类列表失败：', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
      });
  },

  // 表单字段更改处理
  onInputChange(e) {
    const field = e.currentTarget.dataset.field; // 数据字段
    const value = e.detail.value; // 用户输入值

    // 更新字段内容
    const newForm = { ...this.data.form, [field]: value };

    // 更新表单数据
    this.setData({
      form: newForm,
      previewContent: newForm.content,  // 直接同步内容到预览区域
    });
  },

  // 分类选择更改
  onCategoryChange(e) {
    const categoryIndex = e.detail.value; // 用户选择的分类索引
    const category = this.data.categories[categoryIndex]; // 获取分类信息

    this.setData({
      'form.categoryId': category.id,
      'form.categoryName': category.name,
    });
  },

  // 富文本操作（加粗、斜体等）
  onRichTextOperation(tag) {
    const content = this.data.form.content;
    let updatedContent = `<${tag}>${content}</${tag}>`;  // 将内容包裹在标签中
    this.setData({
      form: {
        ...this.data.form,
        content: updatedContent,
      },
      previewContent: updatedContent,  // 同步到预览区域
    }, () => {
      console.log('Updated content:', updatedContent);
    });
  },

  // 加粗操作
  onBold() {
    this.onRichTextOperation('b');
  },

  // 斜体操作
  onItalic() {
    this.onRichTextOperation('i');
  },

  // 增加emoji表情
  onAddEmoji() {
    const content = this.data.form.content;
    this.setData({
      form: {
        ...this.data.form,
        content: `${content}😊`, // 添加emoji表情
      },
      previewContent: `${content}😊`,  // 同步到预览区域
    });
  },

  // 修改字体大小
  onFontSizeChange(e) {
    const size = e.target.dataset.size;
    const content = this.data.form.content;
    const updatedContent = `<span style="font-size:${size}">${content}</span>`;
    this.setData({
      form: {
        ...this.data.form,
        content: updatedContent,
      },
      previewContent: updatedContent,  // 同步到预览区域
    });
  },

  // 左对齐
  onAlignLeft() {
    const content = this.data.form.content;
    this.setData({
      form: {
        ...this.data.form,
        content: `<div style="text-align:left">${content}</div>`,
      },
      previewContent: `<div style="text-align:left">${content}</div>`,  // 同步到预览区域
    });
  },

  // 居中对齐
  onAlignCenter() {
    const content = this.data.form.content;
    this.setData({
      form: {
        ...this.data.form,
        content: `<div style="text-align:center">${content}</div>`,
      },
      previewContent: `<div style="text-align:center">${content}</div>`,  // 同步到预览区域
    });
  },

  // 右对齐
  onAlignRight() {
    const content = this.data.form.content;
    this.setData({
      form: {
        ...this.data.form,
        content: `<div style="text-align:right">${content}</div>`,
      },
      previewContent: `<div style="text-align:right">${content}</div>`,  // 同步到预览区域
    });
  },

  // 下划线
  onUnderline() {
    const content = this.data.form.content;
    this.setData({
      form: {
        ...this.data.form,
        content: `<u>${content}</u>`,
      },
      previewContent: `<u>${content}</u>`,  // 同步到预览区域
    });
  },

  // 字体颜色变化
  onTextColorChange() {
    const content = this.data.form.content;
    this.setData({
      form: {
        ...this.data.form,
        content: `<span style="color:red">${content}</span>`, // 字体颜色设置为红色
      },
      previewContent: `<span style="color:red">${content}</span>`,  // 同步到预览区域
    });
  },

  // 提交发布
  onPublishSubmit() {
    const { form } = this.data;

    if (!form.title || !form.content || !form.categoryId) {
      wx.showToast({
        title: '请完整填写表单',
        icon: 'none',
      });
      return;
    }

    // 构造发布请求的数据
    const forumPublishDTO = {
      categoryId: form.categoryId,
      title: form.title,
      image: form.image,
      content: form.content,
    };
    console.log(forumPublishDTO);

    // 发送发布请求
    request.post('/forum/forumInfo/publish', forumPublishDTO)
      .then((response) => {
        const { success, errorCode, message } = response;
        if (response.errorCode === 20000) {
          wx.showToast({
            title: '发布成功',
          });
          setTimeout(() => {
            wx.navigateBack(); // 发布成功后返回上一页
          }, 1000);
        } else {
          wx.showToast({
            title: message || '发布失败',
            icon: 'none',
          });
        }
      })
      .catch((error) => {
        console.error('发布失败：', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
      });
  },
});
