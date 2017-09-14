/**
 * Created by Евгений on 18.06.2017.
 */
'use strict';

let async = require('async');
let querystring = require('querystring');
let request = require('request');
let conf = require('nconf');

conf.argv()
    .env()
    .file('config.json')
    .file('queries', 'queries.json');

let host = conf.get('jiraUrl');
let auth = conf.get('auth');
let proxy = conf.get('HTTP_PROXY');
let projects = conf.get('projects');

let madeQueries = 0;  //Счетчик выполненных запросов
let totalQueries = 0;

module.exports.getProjects = function(callback) {
    performRequest('/rest/api/latest/project', 'GET', null, function(result) {
        let projectNames = [];
        result.forEach(function(item) {
            if (projects.includes(item.key)) {
                projectNames.push({key: item.key, name: item.name});
            }
        });
        callback(projectNames);
    });
};

module.exports.getStatus = function() {
    return {
        madeQueries: madeQueries,
        totalQueries: totalQueries,
        description: madeQueries < totalQueries ?
            'Выполняем запросы...' :
            'Обрабатываем данные...',
        percent: parseInt((madeQueries / totalQueries) * 100),
        style: 'width:' + parseInt((madeQueries / totalQueries) * 100) +'%;'
    }
};

module.exports.getData = function (options, res, renderCallback) {
    let queries = conf.get('queries' + options.dataType[0]);
    totalQueries += queries.length;
    let temp = {};
    let restUrl = '/rest/api/latest/search/';

    totalQueries += queries.filter(function(item) {
        return item.subQueries !== undefined;
    }).length * 200;

    queries.sort(function(a,b) {
        if (a.subQueries && b.subQueries) {
            return b.subQueries.length - a.subQueries.length;
        }
        if (a.subQueries) {
            return -1;
        }
        if (b.subQueries) {
            return 1;
        }
        return 0;
    });

    async.each(queries, function (item, outerEachCallback) {
        let q = {
            jql: preprocessQuery(item.query, options)
        };

        if (item.subQueries !== undefined) {
            q.fields = 'id,key,summary,priority,status,customfield_10131,versions,customfield_16424';
            performRequest(restUrl, 'GET', q, function(mainQueryData) {
                madeQueries++;
                totalQueries -= (200 - mainQueryData.total * item.subQueries.length);
                item.count = mainQueryData.total;
                item.url = getIssuesFilterUrl(q);
                item.issues = mainQueryData.issues;
                temp[item.type] = item;
                // Для каждой возвращенной задачи нужно выполнять несколько запросов с подстановкой
                async.each(item.subQueries, function(subQuery, innerEachCallback) {
                    async.each(mainQueryData.issues, function(subIssue, issuesCallback) {
                        let innerOptions = {
                            dataType: options.dataType.concat(item.replacementMap.dataType),
                            dataValue: options.dataValue.concat([])
                        };
                        item.replacementMap.dataValue.forEach(function(dv) {
                            innerOptions.dataValue.push(subIssue[dv]);
                        });
                        let issueQuery = {
                            type: preprocessQuery(subQuery.type, innerOptions)
                        };
                        let iq = {
                            jql: preprocessQuery(subQuery.query, innerOptions),
                        };
                        if (item.limit) {
                            iq.maxResults = subIssue.limit;
                        }
                        if (item.fields) {
                            iq.fields = subIssue.fields;
                        }
                        performRequest(restUrl, 'GET', iq, function (subQueryData) {
                            issueQuery.count = subQueryData.total;
                            issueQuery.url = getIssuesFilterUrl(iq);
                            issueQuery.issues = subQueryData.issues;
                            temp[issueQuery.type] = issueQuery;
                            madeQueries++;
                            issuesCallback();
                        });
                    }, function (err) {
                        if (err) {throw err;}
                        innerEachCallback();
                    });
                }, function(err) {
                    if(err) { throw err;}
                    outerEachCallback();
                });
            });
        } else if (item.type.substring(0, 6) === 'detail') {
            q.fields = item.fields || 'id,project,key,summary,priority,status,customfield_10131,versions,customfield_16424';
            if (item.limit) {
                q.maxResults = item.limit;
            }
            performRequest(restUrl, 'GET', q, function (data) {
                temp[item.type] = {
                    issues: data.issues,
                    url: getIssuesFilterUrl(q)
                };
                madeQueries++;
                outerEachCallback();
            });
        } else {
            q.maxResults = item.limit || 0;
            performRequest(restUrl, 'GET', q, function (data) {
                item.count = data.total;
                item.url = getIssuesFilterUrl(q);
                temp[item.type] = item;
                madeQueries++;
                outerEachCallback();
            });
        }
    }, function (err) {
        if (err) {
            console.log('Something went wrong');
            throw(err);
        } else {
            console.log('Выполнено ' + madeQueries + ' запросов');
            temp.options = options;
            renderCallback(res, temp);
        }
    });
};

function getIssuesFilterUrl(q) {
    return host + '/issues/?' + querystring.stringify(q);
}

/**
 * Заменяет все вхождения строк подстановки в запросе на конкретные значения
 * @param configItem Объект конфигурации, содержащий тип и строку запроса
 * @param options Объект конфигурации, содержащий карту необходимых замен
 * @returns {{jql: (ParsedQueryString|*|null)}}
 */
function preprocessQuery(stringToProcess, options) {
    for (let i = 0; i < options.dataType.length; i++) {
        stringToProcess = stringToProcess.replace(new RegExp('%' + options.dataType[i] + '%', 'g'), options.dataValue[i]);
    }
    return stringToProcess;
}

function performRequest(endpoint, method, data, success) {

    if (method === 'GET' && data) {
        endpoint += '?' + querystring.stringify(data);
    }

    let options = {
        url: host + endpoint,
        auth: auth,
        method: method,
        timeout: 120000
    };

    // иногда нужно проксировать доступ
    if (proxy) {
        options.proxy = proxy;
    }

    request(options, function (err, res, body) {
        let result = {};
        try {
            result = JSON.parse(body);
        } catch (e) {
            console.log(options.url + '\n' + body);
            throw(e);
        }
        success(result);
    });

}