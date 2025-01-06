import request from '@/utils/request';

Page({
  data: {
    categories: [], // 用于存储从后端获取的分类数据
    recommendedCategories: [], // 热门分类
    selectedCategoryId: null, // 存储用户选择的分类ID
  },

  onLoad() {
    this.loadCategories(); // 加载论坛分类数据
  },

  // 加载分类数据
  loadCategories() {
    request.post('/forum/forumCategory/getList', {
      // 向后端请求获取分类数据
    })
    .then((response) => {
      const { success, data, errorCode, message } = response;
      if (errorCode === 20000) {
        console.log("接口返回成功，数据为：", data);

        // 假设返回的数据是一个分类列表
        const categories = data || [];
        
        // 如果后端数据包含 postCount，进行热门分类的处理
        const recommendedCategories = categories
          .filter(item => item.postCount)  // 仅保留有帖子数的分类
          .sort((a, b) => b.postCount - a.postCount) // 按照 postCount 降序排序
          .slice(0, 3); // 获取前 3 个热门分类

        this.setData({
          categories: categories,
          recommendedCategories: recommendedCategories, // 设置热门分类数据
        });
      } else {
        console.error("接口返回成功，但无有效数据：", message || "未知错误");
        this.setData({
          categories: [], // 如果没有数据，显示空列表
        });
      }
    })
    .catch((error) => {
      console.error("请求失败，错误信息：", error);
      this.setData({
        categories: [], // 请求失败时，显示空列表
      });
    });
  },

  // 用户点击选择分类
  onCategorySelect(e) {
    const categoryId = e.currentTarget.dataset.id; // 获取分类 ID
    this.setData({
      selectedCategoryId: categoryId, // 更新选中的分类ID
    });

    // 跳转到该分类的帖子列表页面
    wx.navigateTo({
      url: `/pages/forum/preview/preview?categoryId=${categoryId}`, // 跳转到分类页面，并传递 categoryId
    });
  },

  // 点击我要发帖按钮
  goToPostPage() {
    const { selectedCategoryId } = this.data;

    if (!selectedCategoryId) {
      wx.showToast({
        title: '请先选择一个论坛版块',
        icon: 'none',
      });
      return;
    }

    // 跳转到发帖页面，并传递选中的分类ID
    wx.navigateTo({
      url: `/pages/forum/post/post?categoryId=${selectedCategoryId}`,
    });
  },
});
