import request from '@/utils/request'

export function getStoreByIdApi(id) {
    return request.get(`/merchant/store/${id}`);
}