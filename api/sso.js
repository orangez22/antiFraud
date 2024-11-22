import request from '@/utils/request'

export function login(params) {
  return request.post(`/sso/member/login`, params);
}

export function getCode(params) {
  return request.post(`/sso/member/getCode`, params);
}

export function getMemberIdByToken() {
  return request.get(`/sso/member/getMemberIdByToken`);
}

export function findByToken() {
  return request.get(`/sso/member/findByToken`);
}