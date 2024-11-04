// pages/order/index.js
import request from '@/utils/request';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appListHeight: 0,
    h5ListHeight: 0,
    selectIndex: 0,
    prepay_id: '',
    // 全部订单
    allOrderList: [],
    allPage: 1,
    allSize: 10,
    allTotal: 0,
    allTotalPage: 0,
    // 没有支付的
    noPayPage: 1,
    noPaySize: 10,
    noPayTotal: 0,
    noPayTotalPage: 0,
    noPayOrderList: [],
    // 已经支付的
    alreadyPayPage: 1,
    alreadyPaySize: 10,
    alreadyPayTotal: 0,
    alreadyPayTotalPage: 0,
    alreadyPayOrderList: [],
    // 关闭的订单
    closePayPage: 1,
    closePaySize: 10,
    closePayTotal: 0,
    closePayTotalPage: 0,
    closePayOrderList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const token = uni.getStorageSync('token');
    if (!token) {
      uni.showToast({
        icon: 'none',
        title: '尚未登录, 请先登录'
      });
      uni.reLaunch({
        url: '../verificationcodelogin/verificationcodelogin'
      })
      return false;
    }
    this._getAllOrderData();
    this._getNoPayOrderData();
    this._getAlreadyPayOrderData();
    this._getClosePayOrderData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    if (this.selectIndex === 0) {
      this.allOrderList = [];
      this.allPage = 1;
      this.allSize = 10;
      this.allTotal = 0;
      this.allTotalPage = 0;
      this._getAllOrderData();
    } else if (this.selectIndex === 1) {
      this.noPayPage = 1;
      this.noPaySize = 10;
      this.noPayTotal = 0;
      this.noPayTotalPage = 0;
      this.noPayOrderList = [];
      this._getNoPayOrderData();
    } else if (this.selectIndex === 2) {
      this.alreadyPayPage = 1;
      this.alreadyPaySize = 10;
      this.alreadyPayTotal = 0;
      this.alreadyPayTotalPage = 0;
      this.alreadyPayOrderList = [];
      this._getAlreadyPayOrderData();
    } else if (this.selectIndex === 3) {
      this.closePayPage = 1;
      this.closePaySize = 10;
      this.closePayTotal = 0;
      this.closePayTotalPage = 0;
      this.closePayOrderList = [];
      this._getClosePayOrderData();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  // 返回
  back() {
    uni.navigateBack({})
  },

  onClickGotoZLYD() {
    uni.showToast({
      icon: 'none',
      title: '功能正在开发中....'
    })
  },
  // 取消订单，取消订单跟删除是不一样的，取消了，是针对未支付的订单去说的
  // 取消了以后，就跑到了已关闭的单子里面去了
  onClickCancelItem(item) {
    wx.showModal({
      content: '是否要取消该订单',
      success: (res) => {
        if (res.confirm) {
          request({
            url: `/orders/orders/cancelOrCloseOrders/${item.id}`,
            method: 'PUT',
          }).then(res=>{
            const { status, data } = res.data;
            console.log(status, data);
          }).catch(err=>{
            console.error('请求失败', err);
          });
        }
      }
    });
  },
  // item是对象的本身
  // num是决定你删除的是【全部】【未支付0】【已支付1】【已关闭2】
  onClickDelItem(item, num) {
    wx.showModal({
      content: '是否要删除该订单',
      success: res => {
        if (res.confirm) {
          wx.request({
            url: `/orders/orders/deleteOrders/${item.id}`,
            method: 'PUT',
            success: res => {
              const { status, data } = res.data;
              if (status.flag === true) {
                wx.showToast({
                  icon: 'none',
                  title: '删除成功'
                });
                if (num === undefined) {
                  this.allOrderList = [];
                  this.allPage = 1;
                  this.allSize = 10;
                  this.allTotal = 0;
                  this.allTotalPage = 0;
                  this._getAllOrderData();
                } else if (num === 0) {
                  this.allOrderList = [];
                  this.allPage = 1;
                  this.allSize = 10;
                  this.allTotal = 0;
                  this.allTotalPage = 0;
                  this._getAllOrderData();
                  
                  this.noPayPage = 1;
                  this.noPaySize = 10;
                  this.noPayTotal = 0;
                  this.noPayTotalPage = 0;
                  this.noPayOrderList = [];
                  this._getNoPayOrderData();
                } else if (num === 1) {
                  this.allOrderList = [];
                  this.allPage = 1;
                  this.allSize = 10;
                  this.allTotal = 0;
                  this.allTotalPage = 0;
                  this._getAllOrderData();
                  
                  this.alreadyPayPage = 1;
                  this.alreadyPaySize = 10;
                  this.alreadyPayTotal = 0;
                  this.alreadyPayTotalPage = 0;
                  this.alreadyPayOrderList = [];
                  this._getAlreadyPayOrderData();
                } else if (num === 2) {
                  this.allOrderList = [];
                  this.allPage = 1;
                  this.allSize = 10;
                  this.allTotal = 0;
                  this.allTotalPage = 0;
                  this._getAllOrderData();
                  
                  this.closePayPage = 1;
                  this.closePaySize = 10;
                  this.closePayTotal = 0;
                  this.closePayTotalPage = 0;
                  this.closePayOrderList = [];
                  this._getClosePayOrderData();
                }
              } else {
                wx.showToast({
                  icon: 'none',
                  title: status.msg
                });
              }
            },
            fail: () => {
              wx.showToast({
                icon: 'none',
                title: '无法删除, 网络异常'
              });
            }
          });
        }
      }
    });
  },
  onClickSelectIndex(index) {
    if (index === this.selectIndex) {
      return false;
    }
    this.selectIndex = index;
  },
  pageTotal(rowCount, pageSize) {
    if (rowCount === null || rowCount === '') {
      return 0;
    } else {
      if (pageSize !== 0 && rowCount % pageSize === 0) {
        return parseInt(rowCount / pageSize);
      }
      if (pageSize !== 0 && rowCount % pageSize !== 0) {
        return parseInt(rowCount / pageSize) + 1;
      }
    }
  },
  // 全部订单
  _getAllOrderData() {
    const page = this.allPage;
    const size = this.allSize;
    uni.request({
      url: `/orders/orders/${page}/${size}`,
      header: {
        AUTH: 'ROBOT ' + uni.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      success: res => {
        let {
          status,
          data
        } = res.data;
        if (status.flag === true) {
          this.allTotal = data.total;
          this.allTotalPage = this.pageTotal(this.allTotal, this.allSize);
          this.allOrderList = this.allOrderList.concat(data.rows);
        } else {
          this.allOrderList = [];
        }
      },
      fail: () => {
        uni.showToast({
          title: '请求失败, 网络异常',
          icon: 'none'
        });
      },
      complete: () => {
        uni.stopPullDownRefresh();
      }
    });
  },
  // 没有支付的订单
  _getNoPayOrderData() {
    const page = this.noPayPage;
    const size = this.noPaySize;
    uni.request({
      url: `/orders/orders/payment/0/${page}/${size}`,
      success: res => {
        let {
          status,
          data
        } = res.data;
        if (status.flag === true) {
          this.noPayTotal = data.total;
          this.noPayTotalPage = this.pageTotal(this.noPayTotal, this.noPaySize);
          this.noPayOrderList = this.noPayOrderList.concat(data.rows);
        } else {
          this.noPayOrderList = [];
        }
      },
      fail: () => {
        uni.showToast({
          title: '请求失败, 网络异常',
          icon: 'none'
        });
      },
      complete: () => {
        uni.stopPullDownRefresh();
      }
    });
  },
  // 已支付的订单
  _getAlreadyPayOrderData() {
    const page = this.alreadyPayPage;
    const size = this.alreadyPaySize;
    uni.request({
      url: `/orders/orders/payment/1/${page}/${size}`,
      success: res => {
        let {
          status,
          data
        } = res.data;
        if (status.flag === true) {
          this.alreadyPayTotal = data.total;
          this.alreadyPayTotalPage = this.pageTotal(this.alreadyPayTotal, this.alreadyPaySize);
          this.alreadyPayOrderList = this.alreadyPayOrderList.concat(data.rows);
        } else {
          this.alreadyPayOrderList = [];
        }
      },
      fail: () => {
        uni.showToast({
          title: '请求失败, 网络异常',
          icon: 'none'
        });
      },
      complete: () => {
        uni.stopPullDownRefresh();
      }
    });
  },
  // 关闭的订单
  _getClosePayOrderData() {
    const page = this.closePayPage;
    const size = this.closePaySize;
    uni.request({
      url: `/orders/orders/payment/2/${page}/${size}`,
      header: {
        AUTH: 'ROBOT ' + uni.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      success: res => {
        let {
          status,
          data
        } = res.data;
        if (status.flag === true) {
          this.closePayTotal = data.total;
          this.closePayTotalPage = this.pageTotal(this.closePayTotal, this.closePaySize);
          this.closePayOrderList = this.closePayOrderList.concat(data.rows);
        } else {
          this.closePayOrderList = [];
        }
      },
      fail: () => {
        uni.showToast({
          title: '请求失败, 网络异常',
          icon: 'none'
        });
      },
      complete: () => {
        uni.stopPullDownRefresh();
      }
    });
  },
  // 全部订单
  onScrolltolowerAllOrderList() {
    const page1 = this.allPage + 1;
    const totalPage = this.allTotalPage;
    if (page1 <= totalPage) {
      this.allPage = page1;
      this._getAllOrderData();
    } else {
      uni.showToast({
        title: '已经到底部了',
        icon: 'none'
      });
    }
  },
  // 未支付
  onScrolltolowerNoPayOrderList() {
    const page1 = this.noPayPage + 1;
    const totalPage = this.noPayTotalPage;
    if (page1 <= totalPage) {
      this.noPayPage = page1;
      this._getNoPayOrderData();
    } else {
      uni.showToast({
        title: '已经到底部了',
        icon: 'none'
      });
    }
  },
  // 已支付的
  onScrolltolowerAlreadyPayOrderList() {
    const page1 = this.alreadyPayPage + 1;
    const totalPage = this.alreadyPayTotalPage;
    if (page1 <= totalPage) {
      this.alreadyPayPage = page1;
      this._getAlreadyPayOrderData();
    } else {
      uni.showToast({
        title: '已经到底部了',
        icon: 'none'
      });
    }
  },
  // 关闭的订单
  onScrolltolowerClosePayOrderList() {
    const page1 = this.closePayPage + 1;
    const totalPage = this.closePayTotalPage;
    if (page1 <= totalPage) {
      this.closePayPage = page1;
      this._getClosePayOrderData();
    } else {
      uni.showToast({
        title: '已经到底部了',
        icon: 'none'
      });
    }
  },
  // 投诉商家
  onClickTSSJ(obj) {
    if (!obj.storeId) {
      return false;
    }
    uni.navigateTo({
      url: `../complaintsmerchant/complaintsmerchant?storeid=${obj.storeId}&storename=${obj.storeName}`
    });
  },
  onClickGotoPLPage(item, flag) {
    if (!item.storeId) {
      return false;
    }
    if (!item.id) {
      return false;
    }
    if (!item.storeName) {
      return false;
    }
    uni.navigateTo({
      url: `../gotoappraise/gotoappraise?ordersId=${item.id}&storeId=${item.storeId}&storeName=${item.storeName}&flag=${flag}`
    });
  }
})