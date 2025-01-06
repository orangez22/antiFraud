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
    emojiList: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😜", "😝", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "🙄", "😬", "🤥", "😮‍💨", "😯", "😦", "😧", "😮", "😲", "🥺", "😳", "🤯", "😵", "😵‍💨", "🤕", "🤒", "😣", "😖", "😫", "😩", "🥱", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😶‍🌫️", "🙄", "😏", "😒", "🙃", "🤐"],  // 预设emoji列表
    colorList: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#000000", "#FFFFFF", "#808080", "#800000", "#808000", "#008000", "#000080", "#800080", "#008080", "#FF6347", "#FFA500", "#008080", "#40E0D0", "#9ACD32", "#FFD700", "#DA70D6", "#3CB371", "#7B68EE", "#6A5ACD", "#FF8C00", "#87CEFA", "#00FF7F", "#48D1CC", "#C71585", "#EE82EE", "#F08080", "#20B2AA", "#9370DB", "#98FB98", "#8B0000", "#FF1493", "#DC143C", "#00BFFF", "#ADFF2F", "#FA8072", "#7FFFD4", "#66CDAA", "#00CED1", "#F5FFFA", "#FFE4E1", "#D8BFD8", "#FFEFD5", "#FDF5E6", "#FFF0F5", "#7CFC00", "#FFFACD", "#ADD8E6", "#F0E68C", "#E0FFFF", "#FAFAD2", "#D3D3D3", "#C0C0C0", "#A9A9A9", "#808080", "#696969", "#484848", "#2F4F4F", "#000000"], // 颜色选择器
    showEmojiPicker: false,  // 控制emoji选择器的显示与隐藏
    showColorPicker: false, // 控制颜色选择器的显示与隐藏
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

    // 如果字段是内容，则更新预览内容
    let newPreviewContent = this.data.previewContent;
    if (field === 'content') {
      newPreviewContent = value;
    }

    // 更新表单数据和预览内容
    this.setData({
      form: newForm,
      previewContent: newPreviewContent,
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

  // 显示/隐藏 emoji 选择器
  toggleEmojiPicker() {
    this.setData({
      showEmojiPicker: !this.data.showEmojiPicker,
    });
  },

  // 选择emoji
  onEmojiSelect(e) {
    const emoji = e.currentTarget.dataset.emoji;
    const content = this.data.form.content;
    this.setData({
      form: {
        ...this.data.form,
        content: `${content}${emoji}`, // 在内容后追加选中的emoji
      },
      previewContent: `${content}${emoji}`,  // 同步到预览区域
    });
  },

  // 显示/隐藏颜色选择器
  toggleColorPicker() {
    this.setData({
      showColorPicker: !this.data.showColorPicker,
    });
  },

  // 颜色选择事件
  onTextColorChange(e) {
    const color = e.currentTarget.dataset.color;
    const content = this.data.form.content;
    const updatedContent = `<span style="color:${color}">${content}</span>`;
    this.setData({
      form: {
        ...this.data.form,
        content: updatedContent,
      },
      previewContent: updatedContent,
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
      previewContent: updatedContent,  // 直接同步到预览区域
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