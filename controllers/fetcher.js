var async = require('async');
var querystring = require('querystring');
var request = require('request');
var conf = require('nconf');

conf.argv()
    .env()
    .file({ file: 'config.json' });

var host = conf.get('jiraUrl');
var auth = conf.get('auth');
var proxy = conf.get('HTTP_PROXY');

var counter = 0;  //Счетчик запросов

module.exports.getData = function(options, res, callback) {
	var queries = conf.get('queries'+options.dataType);
	var temp = {};

  async.each(queries, function(item, callback) {
  	var q = {
  		jql: item.query.replace(new RegExp('%'+options.dataType + '%', 'g'), options.dataValue)
  	};

  	if (item.type.substring(0,6) === 'detail') {
  		q.fields = 'id,key,summary,priority,status,customfield_10131'
        performRequest('/rest/api/latest/search/', 'GET', q, function(data) {
                temp[item.type] = data.issues;
                counter++;
                callback();
	      });    		
  	} else {
        q.maxResults = 0;
        performRequest('/rest/api/latest/search/', 'GET', q, function(data) {
                item.count = data.total;                
                item.url = host + '/issues/?' + querystring.stringify(q);
                temp[item.type] = item;
                counter++;
                callback();
	      });    		
  	}
  }, function(err) {
      if (err) {
          console.log('Something went wrong');
            throw(err);
      } else {
          console.log('Выполнено ' + queries.length + ' запросов');
          temp.options = options;
          callback(res, temp);
      }
  });	
}

function performRequest(endpoint, method, data, success) {

    if (method == 'GET') {
        endpoint += '?' + querystring.stringify(data);
    };

    var options = {
	      url: host + endpoint,
	      auth: auth,
	      method: method
    };

    // иногда нужно проксировать доступ
    if(proxy) {
      options.proxy = proxy;
    }

    request(options, function(err, res, body) {
      var result = {};
    	try {
    		result = JSON.parse(body);
    	} catch (e) {
    		console.log(options.url + '\n' + body);
    		throw(e);
    	}
    	success(result);
    });

}