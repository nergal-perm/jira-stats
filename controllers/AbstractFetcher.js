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
};

module.exports = AbstractFetcher;

