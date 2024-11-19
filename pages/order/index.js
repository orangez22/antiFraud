Page({
  data: {
    appListHeight: 0,
    currentIndex: "",
    prepay_id: '',
    // 订单
    OrderList: [
      {
        id: 1,
        storeName: "xxx",
        status: "1",
        payAmount: "111",
        discountAmount: "11",
        createdAt: "2024年11月11日12时38分11秒",
        price: "100",
        rate: "0.9"
      }
    ],
    Page: 1,
    Size: 10,
    Total: 0,
    TotalPage: 0,
    allTotal: 1,
    noPayTotal: 2,
    alreadyPayTotal: 3,
    closePayTotal: 4
  },
  onLoad() {
    // this.getOrderData(this.data.currentIndex);
    this.getCountAllStatus();
    this.setListHeight();
  },
  setListHeight() {
    const that = this;
    wx.getSystemInfo({
      success: res => {
        const query = wx.createSelectorQuery();
        query.select('.order-title').boundingClientRect(function (data) {
          that.setData({
            appListHeight: res.windowHeight - data.height
          });
        }).exec();
      }
    });
  },
  getCountAllStatus() {
    const authorization = wx.getStorageSync('authorization');
    wx.request({
      url: `${getApp().globalData.baseUrl}member/orders/countAllStatusOrders`,
      header: {
        AUTH: authorization.token
      },
      success: res => {
        const { status, data } = res.data;
        if (status.flag === true) {
          this.setData({
            allTotal: data.total,
            noPayTotal: data.not_pay,
            alreadyPayTotal: data.paid,
            closePayTotal: data.closed
          });
        }
      }
    });
  },
  getOrderData(ordersStatus) {
    const authorization = wx.getStorageSync('authorization');
    const { Page, Size } = this.data;

    wx.request({
      url: `${getApp().globalData.baseUrl}member/orders/getOrdersByStatus/${Page}/${Size}`,
      header: {
        AUTH: authorization.token
      },
      method: 'POST',
      data: ordersStatus ? { status: ordersStatus } : {},
      success: res => {
        const { status, data } = res.data;
        if (status.flag === true) {
          this.setData({
            OrderList: data.content,
            TotalPage: this.pageTotal(data.total, Size)
          });
        } else {
          this.setData({ OrderList: [] });
        }
      },
      fail: () => {
        wx.showToast({ title: '请求失败, 网络异常', icon: 'none' });
      }
    });
  },
  pageTotal(rowCount, pageSize) {
    if (!rowCount) return 0;
    return Math.ceil(rowCount / pageSize);
  },
  back() {
    wx.navigateBack();
  },

  onReachBottom() {
    const { Page, TotalPage } = this.data;
    if (Page < TotalPage) {
      this.setData({ Page: Page + 1 });
      this.getOrderData(this.data.currentIndex);
    } else {
      wx.showToast({ title: '已经到底部了', icon: 'none' });
    }
  },
  onPullDownRefresh() {
    this.setData({
      Page: 1,
      OrderList: []
    });
    this.getOrderData(this.data.currentIndex);
    wx.stopPullDownRefresh();
  },
  onClickSelectIndex(e) {
    // 获取点击按钮传递的 index 值
    const index = e.currentTarget.dataset.index;

    // 更新 currentIndex 的值
    this.setData({
      currentIndex: index,
    });

    // 根据 currentIndex 加载对应的订单数据
    this.getOrderData(index);
  },
  //投诉商家
  complain(){
    console.log("投诉商家")
  },
  //去支付
  toPay(){
    console.log("去支付")
  },
  goToStore(){
    console.log("再来一单")
  },
  onClickGotoPLPage(){
    console.log("去评论")
  },
  onClickCancelItem(){
    console.log("取消订单")
  },
  onClickDelItem(){
    console.log("删除")
  }
});
