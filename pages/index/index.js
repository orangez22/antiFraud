import {
    isLogin
} from '@/utils/common'
import {getNearbyPage} from "@/api/merchantApi";

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

    },
    getBannerData() {

    },
    getNavData() {

    },
    getShopData() {
        getNearbyPage({
            latitude: this.data.latitude,
            longitude: this.data.longitude,
            distance: 100
        }).then(res => {
            if (res.success) {
                const { records, total, size, current, pages } = res.data;
                this.setData({
                    store_list: this.data.zh_page === 1
                        ? records
                        : [...this.data.store_list, ...records],
                    zh_total: total,
                    zh_size: size,
                    zh_page: current,
                    zh_totalPage: pages
                });
            }
        }).catch(err => {
            console.log(err);
        });
    },
});