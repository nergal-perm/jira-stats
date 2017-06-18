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
    .file({file: 'config.json'});

let host = conf.get('jiraUrl');
let auth = conf.get('auth');
let proxy = conf.get('HTTP_PROXY');

let reqCounter = 0;  //Счетчик запросов

module.exports.getData = function (options, res, renderCallback) {
    let queries = conf.get('queries' + options.dataType[0]);
    let temp = {};
    let restUrl = '/rest/api/latest/search/';

    // получим список всех запросов со вложенными подзапросами
    let outerQueries = queries.filter(function(item) {
       return item.queries !== undefined;
    });

    async.each(queries, function (item, outerEachCallback) {
        let q = {
            jql: preprocessQuery(item.query, options)
        };

        if (item.subQueries !== undefined) {
            q.fields = 'id,key,summary,priority,status,customfield_10131,versions,customfield_16424';
            performRequest(restUrl, 'GET', q, function(mainQueryData) {
                item.count = mainQueryData.total;
                item.url = host + '/issues/?' + querystring.stringify(q);
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
                            maxResults: 0
                        };
                        performRequest(restUrl, 'GET', iq, function (subQueryData) {
                            issueQuery.count = subQueryData.total;
                            issueQuery.url = host + '/issues/?' + querystring.stringify(iq);
                            temp[issueQuery.type] = issueQuery;
                            reqCounter++;
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
            q.fields = 'id,key,summary,priority,status,customfield_10131,versions,customfield_16424';
            performRequest(restUrl, 'GET', q, function (data) {
                temp[item.type] = data.issues;
                reqCounter++;
                outerEachCallback();
            });
        } else {
            q.maxResults = 0;
            performRequest(restUrl, 'GET', q, function (data) {
                item.count = data.total;
                item.url = host + '/issues/?' + querystring.stringify(q);
                temp[item.type] = item;
                reqCounter++;
                outerEachCallback();
            });
        }
    }, function (err) {
        if (err) {
            console.log('Something went wrong');
            throw(err);
        } else {
            console.log('Выполнено ' + reqCounter + ' запросов');
            temp.options = options;
            renderCallback(res, temp);
        }
    });
};

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

    if (method === 'GET') {
        endpoint += '?' + querystring.stringify(data);
    }

    let options = {
        url: host + endpoint,
        auth: auth,
        method: method
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