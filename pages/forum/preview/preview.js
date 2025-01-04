import request from '@/utils/request';

Page({
  data: {
    forumList: [], // 初始化为空数组，待接口返回后填充
    currentPage: 1, // 当前页
    totalPages: 1, // 总页数
    pageSize: 10, // 每页条数
    goToPage: 1, // 输入框中的页码
    pageSizes: [10, 20, 30, 50], // 每页条数选择
    categoryId: 1, // 默认分类ID（根据实际情况修改）
  },

  onLoad() {
    this.getForumList(); // 页面加载时获取论坛列表
    wx.setNavigationBarTitle({
      title: '论坛列表',
    });
  },

  // 获取论坛列表数据
  getForumList() {
    wx.showLoading({ title: '加载中' });

    const { currentPage, pageSize, categoryId } = this.data;

    // 使用 request.post 方法来发送 POST 请求
    request.post('/forum/admin/forumInfo/getForumList', { 
      categoryId, 
      current: currentPage, 
      size: pageSize 
    })
      .then((response) => {
        wx.hideLoading();
        const { success, data, errorCode, message } = response;
        // 处理返回的数据
        if (response.errorCode === 20000 && data) {
          console.log("接口返回成功，数据为：", data);
          
          // 假设返回的数据中有 `records`（数据列表）和 `total`（总条数）
          const { records, total } = data;

          // 更新数据
          this.setData({
            forumList: records || [], // 将论坛内容更新到界面
            totalPages: Math.ceil(total / pageSize), // 计算总页数
          });
        } else {
          console.error("接口返回成功但无有效数据：", message || "未知错误");
          this.setData({
            forumList: [],
          });
        }
      })
      .catch((error) => {
        wx.hideLoading();
        console.error("请求失败，错误信息：", error);
        // 请求失败时，使用空列表
        this.setData({
          forumList: [],
        });
      });
  },

  // 点击论坛内容跳转详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id; // 获取文章 ID
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`,
    });
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
      this.getForumList();
    });
  },

  // 改变每页条数
  onPageSizeChange(e) {
    const pageSize = this.data.pageSizes[e.detail.value];
    this.setData({ pageSize, currentPage: 1 }, () => {
      this.getForumList();
    });
  },
});
