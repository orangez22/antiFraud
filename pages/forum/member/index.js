import request from '@/utils/request';

Page({
  data: {
    categories: [], // 用于存储从后端获取的分类数据
    recommendedCategories: [], // 热门分类
    selectedCategoryId: null, // 存储用户选择的分类ID
    categoryClickCount: {}, // 用于存储每个分类的点击次数
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
        
        // 初始化每个分类的点击次数
        const categoryClickCount = {};
        categories.forEach(category => {
          categoryClickCount[category.categoryId] = 0; // 初始时，点击次数为 0
        });

        this.setData({
          categories: categories,
          categoryClickCount: categoryClickCount, // 设置初始的点击次数
        });

        // 初次加载时，可以选出前几个热门分类
        this.updateRecommendedCategories();
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

    // 更新该分类的点击次数
    this.updateCategoryClickCount(categoryId);

    // 跳转到该分类的帖子列表页面
    wx.navigateTo({
      url: `/pages/forum/preview/preview?categoryId=${categoryId}`, // 跳转到分类页面，并传递 categoryId
    });
  },

  // 更新分类点击次数
  updateCategoryClickCount(categoryId) {
    const { categoryClickCount } = this.data;
    categoryClickCount[categoryId] = (categoryClickCount[categoryId] || 0) + 1; // 点击次数累加
    this.setData({
      categoryClickCount: categoryClickCount,
    });

    // 更新热门分类
    this.updateRecommendedCategories();
  },

  // 更新热门分类
  updateRecommendedCategories() {
    const { categories, categoryClickCount } = this.data;

    // 按照点击次数进行排序，选出前 3 个热门分类
    const recommendedCategories = categories
      .sort((a, b) => categoryClickCount[b.categoryId] - categoryClickCount[a.categoryId]) // 按点击次数降序排序
      .slice(0, 3); // 获取前 3 个热门分类

    this.setData({
      recommendedCategories: recommendedCategories,
    });
  },

  // 点击我要发帖按钮
  goToPostPage() {
    // const { selectedCategoryId } = this.data;

    // if (!selectedCategoryId) {
    //   wx.showToast({
    //     title: '请先选择一个论坛版块',
    //     icon: 'none',
    //   });
    //   return;
    // }
    // 跳转到发帖页面，并传递选中的分类ID
    wx.navigateTo({
      url: '/pages/my/publishForum/index'
    });
  },
});
