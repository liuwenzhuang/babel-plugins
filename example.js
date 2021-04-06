import util from 'Global/util';
import { PopupWindow } from 'Components/components';
import { userToken } from 'Global/constant';
import _cns from 'Global/constant';
export const handleErr = err => {
  PopupWindow.alert({
    data: {
      alert: [err.msg || '请求错误']
    }
  });
  return Promise.reject(err);
};

export const Type = {
  hive: 'TABLE',
  cube: 'CUBE'
};

export const TypeMap = {
  [Type.hive]: 'Hive',
  [Type.cube]: 'Cube'
};

export function getUrlDetail(configId, apiKey) {
  return util
    .requestQ({
      url: '/v1/outputsubscribe/url/detail/get',
      method: 'get',
      query: {
        email: userToken.email,
        product: userToken.product,
        clusterid: userToken.clusterid,
        configId,
        apiKey
      }
    })
    .then(res => {
      return res.result;
    });
}

/**
 * 获取集群订阅列表
 * @param pageType 1表示项目当前集群下的订阅 2表示集群产出订阅
 */
export function getConfigList(pageNo, pageSize, pageType) {
  return util
    .requestQ({
      url: '/v1/outputsubscribe/config/list',
      method: 'get',
      query: {
        email: userToken.email,
        product: userToken.product,
        clusterid: userToken.clusterid,
        pageNo,
        pageSize,
        pageType
      }
    })
    .then(res => {
      return res.result;
    })
    .catch(handleErr);
}

export function getConfigDetailList(configId, pageNo, pageSize, keyword) {
  return util
    .requestQ({
      url: '/v1/outputsubscribe/detail/list',
      method: 'get',
      query: {
        email: userToken.email,
        product: userToken.product,
        clusterid: userToken.clusterid,
        configId,
        pageNo,
        pageSize,
        keyword
      }
    })
    .then(res => {
      return res.result;
    })
    .catch(handleErr);
}

export function postDeleteDetail(detailId) {
  return util
    .requestQ({
      url: '/v1/outputsubscribe/detail/delete',
      method: 'post',
      data: {
        email: userToken.email,
        product: userToken.product,
        clusterid: userToken.clusterid,
        detailId
      }
    })
    .then(res => {
      return res.result;
    })
    .catch(handleErr);
}

export function postDeleteConfig(configId) {
  return util
    .requestQ({
      url: '/v1/outputsubscribe/config/delete',
      method: 'post',
      data: {
        email: userToken.email,
        product: userToken.product,
        clusterid: userToken.clusterid,
        configId
      }
    })
    .then(res => {
      return res.result;
    })
    .catch(handleErr);
}

export function getMemberList() {
  return util
    .requestQ({
      url: _cns.API + '/api/user/useraccounts/list',
      method: 'POST',
      data: {
        email: _cns.COOKIE.email,
        product: _cns.COOKIE.product,
        clusterid: userToken.clusterid,
        pageSize: 65535
      }
    })
    .then(res => {
      return res?.result?.list ?? [];
    })
    .catch(handleErr);
}

export function getHiveDBList() {
  return util
    .requestQ({
      url: '/v1/outputsubscribe/hive/db/common/list',
      method: 'get',
      query: {
        email: userToken.email,
        product: userToken.product,
        clusterid: userToken.clusterid,
        pageSize: 65535
        // pageSize: 100
      }
    })
    .then(res => {
      return res?.result?.list ?? [];
    })
    .catch(handleErr);
}

export function getCubeList() {
  return util
    .requestQ({
      url: '/v1/outputsubscribe/cube/cluster/list',
      method: 'get',
      query: {
        email: userToken.email,
        product: userToken.product,
        clusterid: userToken.clusterid,
        pageSize: 65535
        // pageSize: 100
      }
    })
    .then(res => {
      // {name, uri}
      return res?.result?.list ?? [];
    })
    .catch(handleErr);
}

export function getHiveTableList(pageNo, pageSize, dbName, keyword) {
  return util
    .requestQ({
      url: '/v1/outputsubscribe/hive/table/common/list',
      method: 'get',
      query: {
        email: userToken.email,
        product: userToken.product,
        clusterid: userToken.clusterid,
        pageNo,
        pageSize,
        dbName,
        keyword
      }
    })
    .then(res => {
      // {dbName, tblName, tblId}
      return res?.result?.list ?? [];
    })
    .catch(handleErr);
}

export function getCubeTableList(pageNo, pageSize, kylinUri, keyword) {
  return util
    .requestQ({
      url: '/v1/outputsubscribe/cube/name/list',
      method: 'get',
      query: {
        email: userToken.email,
        product: userToken.product,
        clusterid: userToken.clusterid,
        pageNo,
        pageSize,
        kylinUri,
        keyword
      }
    })
    .then(res => {
      // {clusterName, clusterUri, cubeName, cubeProject}
      return res?.result?.list ?? [];
    })
    .catch(handleErr);
}

export function postCreateSubscibe(data) {
  return util
    .requestQ({
      url: '/v1/outputsubscribe/config/create',
      method: 'POST',
      data: {
        email: _cns.COOKIE.email,
        product: _cns.COOKIE.product,
        clusterid: userToken.clusterid,
        ...data
      }
    })
    .then(res => {
      return res.result;
    })
    .catch(handleErr);
}

export function getSubscibeDetail(configId) {
  return util
    .requestQ({
      url: '/v1/outputsubscribe/config/get',
      method: 'get',
      query: {
        email: userToken.email,
        product: userToken.product,
        clusterid: userToken.clusterid,
        configId
      }
    })
    .then(res => {
      return res.result;
    })
    .catch(handleErr);
}

export function postEditSubscibe(data) {
  return util
    .requestQ({
      url: '/v1/outputsubscribe/config/edit',
      method: 'POST',
      data: {
        email: _cns.COOKIE.email,
        product: _cns.COOKIE.product,
        clusterid: userToken.clusterid,
        ...data
      }
    })
    .then(res => {
      return res.result;
    })
    .catch(handleErr);
}

export function getCubeConfigured() {
  return util
    .requestQ({
      url: '/v1/outputsubscribe/cube/cluster/configured',
      method: 'get',
      query: {
        email: userToken.email,
        product: userToken.product,
        clusterid: userToken.clusterid
      }
    })
    .then(res => {
      return res.result;
    })
    .catch(handleErr);
}
