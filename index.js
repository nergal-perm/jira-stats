var async = require('async');
var querystring = require('querystring');
var request = require('request');
var conf = require('nconf');

conf.argv()
    .env()
    .file({ file: 'config.json' });


var host = conf.get('jiraUrl');

function performRequest(endpoint, method, data, success) {
    var auth = conf.get('auth'); 

    if (method == 'GET') {
	endpoint += '?' + querystring.stringify(data);
    };

    var options = {
	url: host + endpoint,
	auth: auth,
	method: method
    };

    request(options, function(err, res, body) {
	success(JSON.parse(body));
    });

}

function getSomeData() {
    var queries = conf.get('queries');
    async.each(queries, function(item, callback) {
	performRequest('/rest/api/latest/search/', 'GET', {
	    jql: item.query.replace('%issues%', 'HCS-33561')
	}, function(data) {
	    item.count = data.total;
	    callback();
	});
    }, function(err) {
	if (err) {
	    console.log('Something went wrong');
	} else {
	    queries.forEach(function(item, index, array) {
		console.log(item.type + ': ' + item.count);
	    });
	}
    });
}

getSomeData();
