import request from '@/utils/request'

export function getListApi(params) {
  return request.post(`/list/getInfoList`, params);
}