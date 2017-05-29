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
        return request(options, function (err, res, body) {
            let result = {};
            try {
                result = JSON.parse(body);
            } catch (e) {
                throw(e);
            }
            success(result);
        });

    }

    let requestsCount = 0;
    async.eachSeries(this.queries, function (item, callback) {
        for(let queryStringItem in item.qs) {
            if (item.qs.hasOwnProperty(queryStringItem)) {
                let value = item.qs[queryStringItem];
                _this.replacement.forEach(function(replacement) {
                    value = value.replace('%' + replacement.key + '%', replacement.value);
                });
                item.qs[queryStringItem] = value;
            }
        }
        let query = item.resource + (item.qs ? '?' + querystring.stringify(item.qs) : '');
        console.log('Performing request number ' + (requestsCount + 1));
        performRequest(query, 'GET', function (data) {
            requestsCount++;
            _this.process(data, temp);
            callback();
        });
    }, function(err) {
        console.log('Made ' + requestsCount + ' requests');
        renderCallback(err, temp);
    });



};

module.exports = AbstractFetcher;

