import request from '@/utils/request'

export function getMerchantPage(params) {
    return request.post(`/merchant/store/page`, params);
}