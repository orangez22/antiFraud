import request from '@/utils/request'

export function getStoreByIdApi(id) {
    return request.get(`/merchant/store/${id}`);
}

export function getPageApi(params) {
    return request.post(`/merchant/store/page`, params);
}

export const downloadQRCodeApi=(data)=>{
    return request({
        url: '/base/qrcode/generate',
        method:'POST',
        data: data
    })
}