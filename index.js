var async = require('async');
var querystring = require('querystring');
var request = require('request');
var conf = require('nconf');
var fs = require('fs');

conf.argv()
    .env()
    .file({ file: 'config.json' });


var host = conf.get('jiraUrl');
var auth = conf.get('auth');
var issueId = 'HCS-27678';

function performRequest(endpoint, method, data, success) {

    if (method == 'GET') {
        endpoint += '?' + querystring.stringify(data);
    };

    var options = {
	      url: host + endpoint,
	      auth: auth,
	      method: method
    };

    request(options, function(err, res, body) {
	      success(JSON.parse(body), options.url);
    });

}

function getSomeData() {
    var queries = conf.get('queries');
    async.each(queries, function(item, callback) {
        var q = {
            jql: item.query.replace('%issues%', issueId)
        };
            
        performRequest('/rest/api/latest/search/', 'GET', q, function(data) {
	          item.count = data.total;                
            item.url = host + '/issues/?' + querystring.stringify(q);
	          callback();
	      });
    }, function(err) {
	      if (err) {
	          console.log('Something went wrong');
	      } else {
            console.log('Обнаружено ' + queries.length + ' записей');
            fillTemplate(queries);
	      }
    });
}

function fillTemplate(queries) {
    fs.readFile('template.html','utf8',function(err, data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(/%main_link%/g, '<a href="'+ host + '/browse/' + issueId + '">'+ host + "/browse/" + issueId + "</a>");
        queries.forEach(function(item, index, array) {
            result = result.replace(new RegExp("%" + item.type + '%',"g"),'<a href="' + item.url + '">' + item.count + '</a>')
                .replace(new RegExp("%" + item.type + "_count%", "g"), item.count);
            
	      });

        fs.writeFile('report.html', result, 'utf8', function(err) {
            if (err) return console.log(err);
        });
    });
}

getSomeData();
