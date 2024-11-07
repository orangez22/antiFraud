import request from '@/utils/request'
import {
  isLogin
} from '@/utils/common'
Page({
      data: {
        indicatorColor: '#fff',
        indicatorActiveColor: '#FD4D7D',
        indicatorNavColor: '#D8D8D8',
        indicatorActiveNavColor: '#F02230',
        selectIndex: 2,
        adData: [],
        swiperData: [],
        navData: [],
        store_list: [],
        zh_page: 1,
        zh_size: 10,
        zh_total: 0,
        zh_totalPage: 0,
        latitude: '', // 纬度
        longitude: '', // 经度
        address: '正在获取您的地址',
        h5ListHeight: 0,
        appListHeight: 0,
      },
      onLoad() {
        this.getLocationAndData();
        //this.getBannerData();
      },
      onReachBottom() {
        if (this.data.zh_page < this.data.zh_totalPage) {
          this.setData({
            zh_page: this.data.zh_page + 1
          });
          this.getShopData();
        } else {
          wx.showToast({
            title: '已经到底部了',
            icon: 'none'
          });
        }
      },
      onPullDownRefresh() {
        this.setData({
          store_list: [],
          zh_page: 1
        });
        this.getShopData();
        wx.stopPullDownRefresh();
      },

      getLocationAndData() {
        wx.getLocation({
          type: 'wgs84',
          success: (res) => {
            console.log(res)
            this.setData({
              latitude: res.latitude,
              longitude: res.longitude
            });
            this.getShopData();
            this.getAddressFromCoords();
          },
          fail: (res) => {
            console.log(res)
          },
        });
      },
      getAddressFromCoords() {
        wx.request({
          url: `member/map/getAddress/${this.data.longitude}/${this.data.latitude}/`,
          success: (res) => {
            const {
              status,
              data
            } = res.data;
            this.setData({
              address: status.flag ? data.addressComponent.district : '',
            });
          },
        });
      },

      pageTotal(rowCount, pageSize) {
        if (!rowCount) return 0;
        return Math.ceil(rowCount / pageSize);
      },
      navigateToSearchResult(item) {
        if (item.id) {
          wx.navigateTo({
            url: `../searchresult/searchresult?flag=1&id=${item.id}&name=${item.name}`,
          });
        }
      },
      scanCode() {
        isLogin()
        wx.scanCode({
          success: (res) => {
            wx.navigateTo({
              url: res.result.split('#')[1]
            });
          },
        });
      },
      openWXSM() {
        wx.hideLoading();
        jweixin.scanQRCode({
          needResult: 1,
          success: (res) => {
            wx.navigateTo({
              url: res.resultStr.split('#')[1]
            });
          },
        });
      },
      getAdData() {
        wx.request({
          url: `ad/ad/index`,
          method: 'POST',
          data: {
            area_list: this.data.address
          },
          success: (res) => {
            const {
              status,
              data
            } = res.data;
            this.setData({
              adData: status.flag ? data : []
            });
          },
        });
      },
      getBannerData() {
        wx.showLoading({
          title: '加载中'
        });
        request({
          url: `/ad/banner/index`,
          method: 'POST',
        }).then(res => {
          const {
            status,
            data
          } = res.data;
          this.setData({
            swiperData: status.flag ? data : []
          });
        }).catch(err => {
          console.log(err)
          wx.hideLoading()
        })

      },
      getNavData() {
        wx.request({
          url: `merchant/industry/index`,
          success: (res) => {
            const {
              status,
              data
            } = res.data;
            this.setData({
              navData: status.flag ? data : []
            });
          },
          complete: this.getAdData,
        });
      },
      getShopData() {
        request({
            url: `/merchant/store/getStoresByPoint/${this.data.zh_page}/${this.data.zh_size}`,
            method: 'POST',
            data: {
              latitude: this.data.latitude,
              longitude: this.data.longitude
            }})
          .then(res => {
            const {
              status,
              data
            } = res.data;
            if (status.flag) {
              this.setData({
                store_list: this.data.store_list.concat(data.storeAndTagsList),
                zh_total: data.total,
                zh_totalPage: this.pageTotal(data.total, this.data.zh_size),
              });
            }
          })
          .catch(err => {
            console.log(err)
          })


        },
      });