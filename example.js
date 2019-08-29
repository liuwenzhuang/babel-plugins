import globalActions from '../actions/globalActions';
import _cst from '../global/constant';
import _util from '../global/util';

var initialState = {
    // 不同集群不同配置信息存储，临时
    configBycluster: null,
    // 数据表
    tableItems: [],
    // 流表
    kafkaTables: [],
    // 离线表
    offlineTables: [],
    //单个数据表信息
    tableInfos: {},
    // yarn 队列
    slaList: [],
    // impala 队列
    impalaList: [],
    // 按集群获取的账号信息
    accountByCluster: {},
    tableColumns: [],
    hiveTableColumns: {},
    // 集群列表
    clusterList: [],
    isNewCluster: false,
    //可用集群列表
    applicableClusterList: [],
    // 数据源列表
    dbList: [],
    // 待编辑任务
    editTask: undefined,
    // 该用户权限
    myPrivs: {},
    // 申请工单详情
    order: {},
    products: {},
    //建表语句
    createSql: '',
    productSummary: '',
    //数据表内容格式
    hiveSerdes: [],
    //kafka server list
    kafkaServer: [],
    //审批联系人信息
    contacts: [],
    unReadMsgs: [],
    // 文件目录列表
    homeDir: '',
    // 文件列表
    listDir: [],
    // 过滤的文件列表
    filterListDir: [],
    // 文件数的总数
    total: 0,
    // path
    dirs: [],
    // 文件目录列表
    outterHomeDir: '',
    // 文件列表
    outterListDir: [],
    // 过滤的文件列表
    outterFilterListDir: [],
    // 文件数的总数
    outterTotal: 0,
    // path
    outterDirs: [],
    //文件列表
    fileLists: [],
    outSideTableProducts: [],
    // 报警组相关
    alarmGroups: [],
    alarmGroupTotal: 0,
    suggestionDbs: []
};
var callBackMaps = {};
/**
 * 获取目录授权文件夹列表
 */

callBackMaps[globalActions.FETCH_CONFIG_BY_CLUSTER] = function (state, action) {
    return _util.dset(state, 'configBycluster', action.config);
};
/**
 * 获取目录授权文件夹列表
 */


callBackMaps[globalActions.GET_FILE_LIST] = function (state, action) {
    return _util.dset(state, 'fileLists', action.lists);
};
/**
 * 添加文件夹列表
 */


callBackMaps[globalActions.ADD_FILE_LIST] = function (state, action) {
    var path = getPath(action.index);
    return _util.dset(state, path, action.lists);
};
/**
 * 获取文件管理目录
 */


callBackMaps[globalActions.GET_HOME_DIR] = function (state, action) {
    return _util.dset(state, action.outter ? 'outterHomeDir' : 'homeDir', action.homeDir);
};
/**
 * 获取文件管理文件列表
 */


callBackMaps[globalActions.GET_LIST_DIR] = function (state, action) {
    var listDirKey = action.outter ? 'outterListDir' : 'listDir';
    var totalKey = action.outter ? 'outterTotal' : 'total';
    return _util.dset(state, [listDirKey, totalKey], [action.lists, action.total]);
};
/**
 * 设置文件列表关键字过滤
 */


callBackMaps[globalActions.FILTER_LIST_DIR] = function (state, action) {
    var key = action.keyword;
    var listDir = action.outter ? _util.cloneObj(state.outterListDir) : _util.cloneObj(state.listDir);
    var filterListDir = [];

    if (key) {
        listDir.forEach(function (list) {
            if (list.pathSuffix.toLowerCase().indexOf(key) !== -1) {
                filterListDir.push(list);
            }
        });
    } else {
        filterListDir = listDir;
    }

    var listDirKey = action.outter ? 'outterFilterListDir' : 'filterListDir';
    var totalKey = action.outter ? 'outterTotal' : 'total';
    return _util.dset(state, [listDirKey, totalKey], [filterListDir, filterListDir.length]);
};
/**
 * 更新路径path
 */


callBackMaps[globalActions.UPDATE_DIR] = function (state, action) {
    return _util.dset(state, action.outter ? 'outterDirs' : 'dirs', action.dirs);
};

callBackMaps[globalActions.RECEIVE_WORKERS] = function (state, action) {
    return _util.dset(state, 'products', action.products);
};
/**
 *  [获取我的权限]
 */


callBackMaps[globalActions.RECEIVE_MY_PRIVS] = function (state, action) {
    return _util.dset(state, 'myPrivs', action.myPrivs, true);
};
/**
 *  [设置新的权限]
 */


callBackMaps[globalActions.SET_NEW_PRIVS] = function (state, action) {
    var id = action.id,
        resource = action.resource;
    _cst.MY_PRIVS.resources[resource + '-' + id] = ['*'];
    return _util.dset(state, 'myPrivs.resources.' + (resource + '-' + id), ['*']);
};
/**
 *  [初始化数据表内容格式数据]
 */


callBackMaps[globalActions.INIT_HIVESERDES] = function (state, action) {
    var serdes = [].concat(action.serdes);
    return _util.dset(state, 'hiveSerdes', serdes);
};
/**
 *  [初始化数据表数据]
 */


callBackMaps[globalActions.INIT_TABLESDATA] = function (state, action) {
    var tables = action.tables.map(function (item) {
        return {
            name: item.db,
            type: item.type || 'offline',
            children: [],
            isIn: item.dbowner === _cst.COOKIE.product
        };
    }); // 区分流表和普通离线表

    return _util.dset(state, 'tableItems', tables);
};
/**
 * 初始化离线表kafka表
 */


callBackMaps[globalActions.INIT_TABLE_LIST] = function (state, action) {
    var tables = action.tables;
    var kafkaTables = [],
        offlineTables = [];
    tables.forEach(function (item) {
        var db = {
            name: item.db,
            type: item.type || 'offline',
            children: [],
            isIn: item.dbowner === _cst.COOKIE.product
        };

        if (item.type === 'kafka') {
            kafkaTables.push(db);
        } else {
            offlineTables.push(db);
        }
    });
    return _util.dset(state, ['kafkaTables', 'offlineTables'], [kafkaTables, offlineTables]);
};
/**
 *  [添加单个数据表数据]
 */


callBackMaps[globalActions.GET_SINGLE_TABLE] = function (state, action) {
    var path = 'tableInfos.' + action.name;
    return _util.dset(state, path, action.info);
}; // 获取队列列表


callBackMaps[globalActions.GET_SLA] = function (state, action) {
    return _util.dset(state, 'slaList', action.data);
};

callBackMaps[globalActions.GET_IMPALA] = function (state, action) {
    return _util.dset(state, 'impalaList', action.data);
}; // 获取按集群的账号信息


callBackMaps[globalActions.GET_ACCOUNT_BY_CLUSTER] = function (state, action) {
    return _util.dset(state, 'accountByCluster', action.payload);
};
/**
 * 设置待编辑项目
 */


callBackMaps[globalActions.SET_EDIT_TASK] = function (state, action) {
    return _util.dset(state, 'editTask', action.task);
};
/**
 *  [获取表字段列表]
 */


callBackMaps[globalActions.INIT_TABLECOLUMNS] = function (state, action) {
    var dbs = {},
        outSideTableProducts = [],
        suggestionDbs = [];

    for (var i = 0, len = action.list.length; i <= len - 1; i++) {
        var list = action.list[i],
            tables = {};
        if (outSideTableProducts.indexOf(list.product) === -1 && list.product !== _cst.COOKIE.product) outSideTableProducts.push(list.product);

        for (var j = 0, len2 = list.tables.length; j <= len2 - 1; j++) {
            var t = list.tables[j];
            tables[t.name] = t.columns.map(function (column) {
                return column.name;
            });
        }

        dbs[list.db] = tables;
        suggestionDbs.push(_.merge({
            name: list.db
        }, list));
    }

    return _util.dset(state, ['hiveTableColumns', 'tableColumns', 'outSideTableProducts', 'suggestionDbs'], [dbs, action.list, outSideTableProducts, suggestionDbs]);
};

callBackMaps[globalActions.GET_CLUSTER_LIST] = function (state, action) {
    return _util.dset(state, ['clusterList', 'isNewCluster'], [action.list, action.isNewCluster]);
};

callBackMaps[globalActions.GET_APPLICABLE_CLUSTER_LIST] = function (state, action) {
    return _util.dset(state, 'applicableClusterList', action.list);
};
/**
 * 设置数据源列表
 */


callBackMaps[globalActions.GET_DBLIST] = function (state, action) {
    return _util.dset(state, 'dbList', action.list);
};
/**
 * 设置全部数据源列表
 */


callBackMaps[globalActions.GET_ALLDBLIST] = function (state, action) {
    return _util.dset(state, 'allDBList', action.list);
};
/**
 * 设置kafka server
 */


callBackMaps[globalActions.GET_KAFKA_SERVER] = function (state, action) {
    return _util.dset(state, 'kafkaServer', action.list);
};

callBackMaps[globalActions.RECEIVE_ORDER_DETAILS] = function (state, action) {
    return _util.dset(state, 'order', action.order, true);
};
/**
 * 获取建表语句
 */


callBackMaps[globalActions.FETCH_CREATE_SQL] = function (state, action) {
    return _util.dset(state, 'createSql', action.sql);
};
/**
 * 项目信息
 */


callBackMaps[globalActions.PRODUCT_SUMMARY] = function (state, action) {
    return _util.dset(state, 'productSummary', action.data);
};
/**
 * 审批联系人信息
 */


callBackMaps[globalActions.GET_CONTACTS] = function (state, action) {
    return _util.dset(state, 'contacts', action.contacts);
};

callBackMaps[globalActions.RECEIVE_UNREAD_MSGS] = function (state, action) {
    return _util.dset(state, 'unReadMsgs', action.msgs.reverse());
};

callBackMaps[globalActions.MARK_ALL_READ] = function (state, action) {
    var msgType = action.msgType;
    return _util.dset(state, 'unReadMsgs', !msgType ? [] : state.unReadMsgs.filter(function (msg) {
        return msg.type != msgType;
    }));
};

callBackMaps[globalActions.MARK_MSG_READ] = function (state, action) {
    var unReadMsgs = state.unReadMsgs,
        index = _util.findIndex(unReadMsgs, 'id', action.id);

    return index === -1 ? state : _util.dset(state, 'unReadMsgs[' + index + ']', null);
};
/**
 * 保存报警组相关信息
 *
 * @typedef {Object} AlarmItemUser
 * @property {number} id
 * @property {number} groupid
 * @property {string} email
 * @property {string} name
 *
 * @typedef {Object} AlarmItem
 * @property {number} id
 * @property {string} name
 * @property {string} product
 * @property {string} description
 * @property {number} createdAt 创建时间
 * @property {AlarmItemUser[]} users
 *
 * @param state
 * @param {Object} action
 * @param {AlarmItemUser[]} action.groups
 * @param {number} action.total
 * @returns {*|Object[]}
 */


callBackMaps[globalActions.FETCH_ALARM_GROUP_LIST] = function (state, action) {
    return _util.dset(state, ['alarmGroups', 'alarmGroupTotal'], [action.groups, action.total]);
};

function globalReducers(state, action) {
    state = state || initialState;
    if (!callBackMaps[action.type]) return state;
    return callBackMaps[action.type](state, action);
}

/**
 * 根据索引数组拼接在fileLists中的修改位置
 * @param index         {Array}             索引数组
 * @returns             {Array|String}      返回需要修改的位置
 */


function getPath(index) {
    index = _util.cloneObj(index);
    if (index.length == 0) return 'fileLists';

    var list,
        _index = index.shift();

    list = _util.stringf('fileLists[<%s>].children', _index);

    while (index.length) {
        _index = index.shift();
        list += _util.stringf('[<%s>].children', _index);
    }

    return list;
}

export default globalReducers;
