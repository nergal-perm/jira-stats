var async = require('async');
var querystring = require('querystring');
var request = require('request');
var conf = require('nconf');
var express = require('express');
var router = express.Router();
var pug = require('pug');
var fs = require('fs');
var childProcess = require('child_process');
var path = require('path');
var phantomjs = require('phantomjs-prebuilt');
var binPath = phantomjs.path;
    
conf.argv()
    .env()
    .file({ file: 'config.json' });

var host = conf.get('jiraUrl');
var auth = conf.get('auth');

var issueId;
var counter = 0;
var result = {};
var response = {};

var stubResult = {
  
}



/* GET report. */
router.post('/', function(req, res, next) {
  result.input = req.body;
  result.input.testCoverage = req.body.testCoverage.split('\n').map(function(item) {
    return item;
  });
  result.input.additionalInfo = req.body.additionalInfo.split('\n').map(function(item) {
    return item;
  });
  issueId = req.body.featureID;
  var dateArr = req.body.dateTestEnd.split('-');
  result.input.dateTestEnd = dateArr[2] + '.' + dateArr[1] + '.' + dateArr[0];
  getSomeData(res, generateResponse);
});

router.get('/data', function(req, res, next) {
  res.render('input', { defaults: {
    projectName: 'ГИС ЖКХ',
    date: getTodaysDate(),
    testCoverage: 'Тестирование доработки включало в себя следующие активности:\r\n1. Тестирование доработки;\r\n2. Валидация заведенных дефектов.',
    additionalInfo: 'Доработка переведена на валидацию. Продолжаем валидировать дефекты после их исправления. Так же дополнительное тестирование будет произведено в рамках регрессионного тестирования всех подсистем.'
  } });
});

function getTodaysDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!

  var yyyy = today.getFullYear();
  if(dd<10){
      dd='0'+dd;
  } 
  if(mm<10){
      mm='0'+mm;
  } 
  return yyyy+'-'+mm+'-'+dd;
}

router.get('report', function(req, res, next) {
  render('reportVersion', {result: stubResult});
});

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
    var queries = conf.get('queriesVersion');
    var temp = {}
    async.each(queries, function(item, callback) {
    	var q = {
    		jql: item.query.replace('%issues%', issueId)
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
            cb(res, temp);
	      }
    });
}

function generateResponse(res, incoming_data) {
    result.input.featureLink = 'https://jira.lanit.ru/browse/' + result.input.featureID;
    result.input.featureName = incoming_data.detailed_main[0].fields.summary;
    result.summary = {
        defectsCreated: incoming_data.total_defects.count || 0,
        defectsCreatedLink: incoming_data.total_defects.url,
        defectsActual: incoming_data.actual_defects.count || 0,
        defectsActualLink: incoming_data.actual_defects.url,
        questionsCreated: incoming_data.total_questions.count || 0,
        questionsCreatedLink: incoming_data.total_questions.url,
        questionsActual: incoming_data.actual_questions.count || 0,
        questionsActualLink: incoming_data.actual_questions.url
    };
    result.actualDefects = {
        blocker: incoming_data.actual_blocker.count || 0,
        blockerLink: incoming_data.actual_blocker.url,
        critical: incoming_data.actual_critical.count || 0,
        criticalLink: incoming_data.actual_critical.url,
        major: incoming_data.actual_major.count || 0,
        majorLink: incoming_data.actual_major.url,
        minor: incoming_data.actual_minor.count || 0,
        minorLink: incoming_data.actual_minor.url,
        trivial: incoming_data.actual_trivial.count || 0,
        trivialLink: incoming_data.actual_trivial.url,
        total: (incoming_data.actual_blocker.count || 0) + (incoming_data.actual_critical.count || 0) +
               (incoming_data.actual_major.count || 0) + (incoming_data.actual_minor.count || 0) + 
               (incoming_data.actual_trivial.count || 0)
    };
    result.createdDefects = {
        blocker: incoming_data.total_blocker.count,
        blockerLink: incoming_data.total_blocker.url,
        critical: incoming_data.total_critical.count,
        criticalLink: incoming_data.total_critical.url,
        major: incoming_data.total_major.count,
        majorLink: incoming_data.total_major.url,
        minor: incoming_data.total_minor.count,
        minorLink: incoming_data.total_minor.url,
        trivial: incoming_data.total_trivial.count,
        trivialLink: incoming_data.total_trivial.url,
        total: (incoming_data.total_blocker.count || 0) + (incoming_data.total_critical.count || 0) +
               (incoming_data.total_major.count || 0) + (incoming_data.total_minor.count || 0) + 
               (incoming_data.total_trivial.count || 0)
    };

    result.chartData = [
      {label: "Blocker", value: result.createdDefects.blocker },
      {label: "Critical", value: result.createdDefects.critical },
      {label: "Major", value: result.createdDefects.major },
      {label: "Minor", value: result.createdDefects.minor },
      {label: "Trivial", value: result.createdDefects.trivial }
    ];

    result.actualQuality = getQuality(result.actualDefects);
    result.createdQuality = getQuality(result.createdDefects);
    result.detailedBC = incoming_data.detailed_critical_and_blocker || [];
    result.detailedBlocked = incoming_data.detailed_blocked || [];

    response = res;
    pug.renderFile('./views/chart.pug', result, createChart);
}

function createChart(err, chartTemplate) {
    fs.writeFileSync('./public/chart.html', chartTemplate);
    var childArgs = [
        path.join(process.cwd(), 'chart.js')
    ];
    childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
        if (err) {
            console.log(stderr.toString());
            throw(err);
        }
        response.render('reportVersion', {result: result});
    });
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