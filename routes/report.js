var async = require('async');
var querystring = require('querystring');
var request = require('request');
var conf = require('nconf');
var express = require('express');
var router = express.Router();

conf.argv()
    .env()
    .file({ file: 'config.json' });

var host = conf.get('jiraUrl');
var auth = conf.get('auth');

var issueId = conf.get('issueID');
var counter = 0;
var result = {};

/* GET report. */
router.get('/', function(req, res, next) {
  getSomeData(res, generateResponse);
});

router.get('/status', function(req, res, next) {
	res.send(JSON.stringify({progress: counter}));
})

router.get('/result', function(req, res, next) {
	res.send(JSON.stringify(result));
})

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

function getSomeData(res, cb) {
    var queries = conf.get('queries');
    var result = {};
    async.each(queries, function(item, callback) {
    	var q = {
    		jql: item.query.replace('%issues%', issueId)
    	};

    	if (item.type.substring(0,6) === 'detail') {
    		q.fields = 'id,key,summary,priority,status,customfield_10131'
	        performRequest('/rest/api/latest/search/', 'GET', q, function(data) {
	                result[item.type] = data.issues;
	                counter++;
	                callback();
		      });    		
    	} else {
	        q.maxResults = 0;
	            
	        performRequest('/rest/api/latest/search/', 'GET', q, function(data) {
	                item.count = data.total;                
	                item.url = host + '/issues/?' + querystring.stringify(q);
	                result[item.type] = item;
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
            cb(res, result);
	      }
    });
}

function generateResponse(res, incoming_data) {
    result = {
        summary: {
            defectsCreated: incoming_data.total_defects.count,
            defectsActual: incoming_data.actual_defects.count,
            questionsCreated: incoming_data.total_questions.count,
            questionsActual: incoming_data.actual_questions.count
        },
        actualDefects: {
            blocker: incoming_data.actual_blocker.count,
            critical: incoming_data.actual_critical.count,
            major: incoming_data.actual_major.count,
            minor: incoming_data.actual_minor.count,
            trivial: incoming_data.actual_trivial.count,
            total: incoming_data.actual_blocker.count + incoming_data.actual_critical.count +
                   incoming_data.actual_major.count + incoming_data.actual_minor.count + 
                   incoming_data.actual_trivial.count
        },
        createdDefects: {
            blocker: incoming_data.total_blocker.count,
            critical: incoming_data.total_critical.count,
            major: incoming_data.total_major.count,
            minor: incoming_data.total_minor.count,
            trivial: incoming_data.total_trivial.count,
            total: incoming_data.total_blocker.count + incoming_data.total_critical.count +
                   incoming_data.total_major.count + incoming_data.total_minor.count + 
                   incoming_data.total_trivial.count            
        }
    };

    result.actualQuality = getQuality(result.actualDefects);
    result.createdQuality = getQuality(result.createdDefects);
    result.detailedBC = incoming_data.detailed_critical_and_blocker;
    result.detailedBlocked = incoming_data.detailed_blocked;

    res.end(JSON.stringify(result));
}

function getQuality(defects) {
    if (defects.blocker > 0) {
    	return 1;
    } else if (defects.critical > 2) {
    	return 2;    	
    } else if (defects.critical <= 2 && defects.critical > 0) {
    	return 3;
    } else if (defects.major <= 2 && defects.major > 0) {
    	return 4;
    } else {
    	return 5;
    }
}

module.exports = router;