import request from '@/utils/request';

Page({
  data: {
    form: {
      forumId: '', // 文章 ID
      title: '', // 标题
      content: '', // 内容
      categoryId: '', // 分类 ID
      categoryName: '', // 分类名称（显示用）
    },
    categories: [], // 分类列表
  },

  onLoad(options) {
    const forumId = options.id; // 从跳转参数获取论坛ID
    if (!forumId) {
      wx.showToast({
        title: '无效的文章ID',
        icon: 'none',
      });
      return;
    }

    this.setData({
      'form.forumId': forumId,
      'form.categoryName': '', // 默认分类名称为空
    });

    // 加载文章详情
    this.getForumDetail(forumId);

    // 加载分类列表
    this.getCategories();
  },

  // 获取文章详情
  getForumDetail(forumId) {
    request.post('/forum/forumInfo/detail', { forumId })
      .then((response) => {
        const { success, data, errorCode, message } = response;
        if (errorCode === 20000 && success) {
          this.setData({
            'form.title': data.title,
            'form.content': data.content,
            'form.categoryId': data.categoryId,
            'form.categoryName': data.categoryName,
          });
        } else {
          wx.showToast({
            title: message || '加载失败',
            icon: 'none',
          });
        }
      })
      .catch((error) => {
        console.error('获取文章详情失败：', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
      });
  },

  // 获取分类列表
  getCategories() {
    request.post('/forum/forumCategory/selectList')
      .then((response) => {
        const { success, data, errorCode, message } = response;
        if (response.errorCode === 20000) {
          console.log("执行到这了")
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

    this.setData({ [`form.${field}`]: value });
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

  // 提交更新
  onUpdateSubmit() {
    const { form } = this.data;

    if (!form.title || !form.content || !form.categoryId) {
      wx.showToast({
        title: '请完整填写表单',
        icon: 'none',
      });
      return;
    }

    request.post('/forum/forumInfo/update', form)
      .then((response) => {
        const { success, errorCode, message } = response;
        if (response.errorCode === 20000) {
          wx.showToast({
            title: '更新成功',
          });
      setTimeout(() => {
        wx.navigateBack(); // 返回上一页
      }, 1000); // 延迟 1 秒
        } else {
          wx.showToast({
            title: message || '更新失败',
            icon: 'none',
          });
        }
      })
      .catch((error) => {
        console.error('更新失败：', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
      });
  },
});
