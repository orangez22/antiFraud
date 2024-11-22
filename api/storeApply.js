import request from '@/utils/request'

export const storeApplyApi=(data)=>{
  return request({
    url: '/apply/storeApply/apply',
    data: data,
    method: 'POST',
  })
}

export const storePageApi=(data)=>{
  return request({
    url: '/apply/storeApply/page',
    method: 'POST',
    data: data
  })
} 