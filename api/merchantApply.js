import request from '@/utils/request'

export const merchantApplyApi = (data) => {
  return request({
    url: '',
    method: 'POST',
    data: data
  })
}

export const merchantPageApi = (data) => {
  return request({
    url: '/apply/merchantApply/page',
    method: 'POST',
    data: data
  })
}