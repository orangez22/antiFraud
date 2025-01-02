import request from '@/utils/request';

Page({
  data: {
    categories: [], // 分类数据
    currentPage: 1, // 当前页码
    pageSize: 10, // 每页显示的数量
    categoryName: '', // 分类名称筛选
    startDate: '', // 开始日期筛选
    endDate: '', // 结束日期筛选
    goToPage: 1, // 输入框中的页码
    pageSizes: [10, 20, 30], // 每页显示条数选项
    totalPages: 1, // 总页数
  },

  onLoad() {
    this.loadCategories(); // 加载分类数据
  },

  // 加载分类数据
  loadCategories() {
    const { currentPage, pageSize, categoryName, startDate, endDate } = this.data;

    // 使用 request.post 发送 POST 请求
    request.post('/forum/admin/forumCategory/list', {
      current: currentPage,
      size: pageSize,
      categoryName: categoryName,
      startDate: startDate,
      endDate: endDate,
    })
      .then((response) => {
        const { success, data, errorCode, message } = response;
        if (response.errorCode===20000) {
          console.log("接口返回成功，数据为：", data);
          // 假设返回的数据在 data.records 中
          this.setData({
            categories: response.data || [], // 设置返回的分类数据
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

  // 搜索分类
  searchCategories() {
    this.setData({
      currentPage: 1, // 重置为第一页
    });
    this.loadCategories(); // 重新加载分类数据
  },

  // 新增分类
  addCategory() {
    wx.navigateTo({
      url: '/pages/admin/add-category', // 跳转到新增分类页面
    });
  },

    // 删除分类
  deleteCategory(event) {
    const categoryId = event.currentTarget.dataset.id; // 获取分类 ID
    console.log(event.currentTarget.dataset)
    // 发送删除请求，直接传递分类 ID
    request.post('/forum/admin/forumCategory/delete', {categoryId})
      .then((response) => {
        const { success, errorCode, message } = response;
        if (errorCode === 20000) {
          console.log("分类删除成功");
          // 删除成功后重新加载分类数据
          this.loadCategories();
        } else {
          console.error("删除分类失败:", message || "未知错误");
        }
      })
      .catch((error) => {
        console.error("删除分类请求失败，错误信息：", error);
      });
  },

  // 更新分类名称筛选
  updateCategoryName(e) {
    this.setData({
      categoryName: e.detail.value,
    });
  },

  // 更新开始日期筛选
  updateStartDate(e) {
    this.setData({
      startDate: e.detail.value,
    });
  },

  // 更新结束日期筛选
  updateEndDate(e) {
    this.setData({
      endDate: e.detail.value,
    });
  },

   // 改变分页
   onPageChange(e) {
    this.setData({
      currentPage: e.detail.current + 1, // 假设 e.detail.current 是 0 基础的
    });
    this.loadCategories(); // 重新加载分类数据
  },

  // 每页显示条数改变
  onPageSizeChange(e) {
    this.setData({
      pageSize: this.data.pageSizes[e.detail.value],
      currentPage: 1, // 每次改变分页时，重新加载第一页
    });
    this.loadCategories(); // 重新加载分类数据
  },

  // 输入页码
  onInputPageChange(e) {
    const goToPage = parseInt(e.detail.value) || 1;
    this.setData({ goToPage });
  },

  // 跳转到指定页
  onGoToPage() {
    const goToPage = Math.min(Math.max(this.data.goToPage, 1), this.data.totalPages);
    this.setData({ currentPage: goToPage }, () => {
      this.loadCategories();
    });
  },
});