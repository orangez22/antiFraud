import request from '@/utils/request'

export function getMerchantPage(params) {
    return request.post(`/merchant/store/page`, params);
}

export function getNearbyPage(params) {
    return request.post(`/merchant/store/nearbyPage`, params);
}