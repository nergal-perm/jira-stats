/**
 * Created by ETerekhov on 22.05.2017.
 */
'use strict';

let async = require('async');
let querystring = require('querystring');
let request = require('request');
let nconf = require('nconf');

// Инициализация конфигурации
nconf.argv().env();
if (nconf.get('NODE_ENV') === 'tests') {
    nconf.add('config', {type: 'file', file: 'test-config.json'});
} else {
    nconf.add('config', {type: 'file', file: 'config.json'});
}

let AbstractFetcher = function(name, replacementMap) {
    this.host = nconf.get('jiraUrl');
    this.auth = nconf.get('auth');
    this.proxy = nconf.get('HTTP_PROXY');
    this.name = name;
    this.queries = nconf.get(name);
    this.replacement = replacementMap;
};

AbstractFetcher.prototype.fetchData = function(renderCallback) {
    let _this = this;
    let temp = [];
    function performRequest(query, method, success) {

        let options = {
            url: _this.host + query,
            auth: _this.auth,
            method: method
        };

        // иногда нужно проксировать доступ
        if (_this.proxy) {
            options.proxy = proxy;
        }

        request(options, function (err, res, body) {
            let result = {};
            console.log(JSON.stringify(res));
            try {
                result = JSON.parse(body);
            } catch (e) {
                console.log(options.url + '\n' + body);
                throw(e);
            }
            success(result);
        });

    }

    async.each(this.queries, function (item, callback) {
        let query = item.resource + (item.qs ? '?' + querystring.stringify(item.qs) : '');
        _this.replacement.forEach(function(replacement) {
            query = query.replace('%25' + replacement.key + '%25', replacement.value);
        });
        performRequest(query, 'GET', function (data) {
            _this.process(data, temp);
            callback();
        });
    }, function(err) {
        renderCallback(err, temp);
    });



};

module.exports = AbstractFetcher;

