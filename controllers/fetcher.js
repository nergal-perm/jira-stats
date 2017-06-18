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

module.exports.getData = function (options, res, callback) {
    let queries = conf.get('queries' + options.dataType[0]);
    let temp = {};
    let restUrl = '/rest/api/latest/search/';

    async.each(queries, function (item, callback) {
        let processedQuery = item.query;
        for (let i = 0; i < options.dataType.length; i++) {
            processedQuery = processedQuery.replace(new RegExp('%' + options.dataType[i] + '%', 'g'), options.dataValue[i]);
        }
        let q = {
            jql: processedQuery
        };

        if (item.type.substring(0, 6) === 'detail') {
            q.fields = 'id,key,summary,priority,status,customfield_10131,versions,customfield_16424';
            performRequest(restUrl, 'GET', q, function (data) {
                temp[item.type] = data.issues;
                reqCounter++;
                callback();
            });
        } else {
            q.maxResults = 0;
            performRequest(restUrl, 'GET', q, function (data) {
                item.count = data.total;
                item.url = host + '/issues/?' + querystring.stringify(q);
                temp[item.type] = item;
                reqCounter++;
                callback();
            });
        }
    }, function (err) {
        if (err) {
            console.log('Something went wrong');
            throw(err);
        } else {
            console.log('Выполнено ' + queries.length + ' запросов');
            temp.options = options;
            callback(res, temp);
        }
    });
};

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