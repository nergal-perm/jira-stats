/**
 * Created by ETerekhov on 22.05.2017.
 */
'use strict';

let async = require('async');
let querystring = require('querystring');
let request = require('request');
let conf = require('nconf');

conf.argv()
    .env()
    .file({file: 'config.json'});

let AbstractFetcher = function(name) {
    this.host = conf.get('jiraUrl');
    this.auth = conf.get('auth');
    this.proxy = conf.get('HTTP_PROXY');
    this.name = name;
    this.queries = conf.get(name);
};

AbstractFetcher.prototype.fetchData = function(renderCallback) {
    let _this = this;
    function performRequest(endpoint, method, data, success) {

        if (method === 'GET' && data !== null) {
            endpoint += '?' + querystring.stringify(data);
        }

        let options = {
            url: _this.host + endpoint,
            auth: _this.auth,
            method: method
        };

        // иногда нужно проксировать доступ
        if (_this.proxy) {
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

    let temp = [];
    async.each(this.queries, function (item, callback) {
        performRequest(item.query, 'GET', null, function (data) {
            temp.push(data);
            callback();
        });
    }, function(err) {
        renderCallback(err, temp);
    });



};

module.exports = AbstractFetcher;

