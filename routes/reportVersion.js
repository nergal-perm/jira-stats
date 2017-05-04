var express = require('express');
var router = express.Router();
var pug = require('pug');
var fs = require('fs');
var childProcess = require('child_process');
var path = require('path');
var phantomjs = require('phantomjs-prebuilt');
var binPath = phantomjs.path;
var fetcher = require('../controllers/fetcher');
    
var result = {};
var response = {};

/* GET report. */
router.post('/', function(req, res, next) {
  version = "11.0.11";
  var dateArr = req.body.dateTestEnd.split('-');
  result.input.dateTestEnd = dateArr[2] + '.' + dateArr[1] + '.' + dateArr[0];
  getSomeData(res, generateResponse);
});

router.get('/report', function(req, res, next) {
  var options = {
    dataType: ["Version", "prevVersion"],
    dataValue: ["11.1.1", "11.1.0"]
  }
  version = "11.1.1";
  fetcher.getData(options, res, generateResponse);
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

function generateResponse(res, incoming_data) {
    result.input = {
      projectName: 'ГИС ЖКХ',
      testDate: '24.03.2017',
      portalLink: 'https://kpak.dom.test.gosuslugi.ru/#!/main',
      revision: '11.0.11#rev135022',
      browser: 'Chrome 56',
      testCoverage: [
        'Тестирование доработок',
        'Валидация дефектов',
        'Регрессионное тестирование по сценариям высокого приоритета'
      ],
      version: incoming_data.options.dataValue[0]
    };
    result.summary = {
      newDefectsQuality: 3,
      wholeSystemQuality: 1,
      defectsCreated: incoming_data.МММ_заведено_новых_дефектов.count || 0,
      defectsCreatedLink: incoming_data.МММ_заведено_новых_дефектов.url,
      indDefectsCreated: incoming_data.РРР_заведено_новых_дефектов_наведенные.count || 0,
      indDefectsCreatedLink: incoming_data.РРР_заведено_новых_дефектов_наведенные.url,
      defectsFixed: incoming_data.ЖЖЖ_исправлено_дефектов_заведенных_в_версии.count || 0,
      defectsFixedLink: incoming_data.ЖЖЖ_исправлено_дефектов_заведенных_в_версии.url,
      indDefectsFixed: incoming_data.fixed_new_defects_induced.count || 0,
      indDefectsFixedLink: incoming_data.fixed_new_defects_induced.url,
      defectsPostponed: incoming_data.postponed_new_defects.count || 0,
      defectsPostponedLink: incoming_data.postponed_new_defects.url,
      indDefectsPostponed: incoming_data.postponed_new_defects_induced.count || 0,
      indDefectsPostponedLink: incoming_data.postponed_new_defects_induced.url,
      defectsActual: incoming_data.actual_new_defects.count || 0,
      defectsActualLink: incoming_data.actual_new_defects.url,
      indDefectsActual: incoming_data.actual_new_defects_induced.count || 0,
      indDefectsActualLink: incoming_data.actual_new_defects_induced.url
    };
    result.actualDefects = {
      blocker: 29,
      blockerLink: '#',
      critical: 566,
      criticalLink: '#',
      major: 716,
      majorLink: '#',
      minor: 0,
      minorLink: '#',
      trivial: 0,
      trivialLink: '#',
      total: 1312
    };
    result.inducedActualForVersionQuality = getQuality({
      trivial: incoming_data.наведенные_оставшиеся_к_выпуску_trivial.count,
      minor: incoming_data.наведенные_оставшиеся_к_выпуску_minor.count,
      major: incoming_data.наведенные_оставшиеся_к_выпуску_major.count,
      critical: incoming_data.наведенные_оставшиеся_к_выпуску_critical.count,
      blocker: incoming_data.наведенные_оставшиеся_к_выпуску_blocker.count
    });
    result.inducedActualForSystemQuality = getQuality({
      trivial: incoming_data.наведенные_оставшиеся_в_системе_trivial.count,
      minor: incoming_data.наведенные_оставшиеся_в_системе_minor.count,
      major: incoming_data.наведенные_оставшиеся_в_системе_major.count,
      critical: incoming_data.наведенные_оставшиеся_в_системе_critical.count,
      blocker: incoming_data.наведенные_оставшиеся_в_системе_blocker.count
    });
    result.inducedAsAWholeQuality = getQuality({
      trivial: incoming_data.наведенные_в_целом_trivial.count,
      minor: incoming_data.наведенные_в_целом_minor.count,
      major: incoming_data.наведенные_в_целом_major.count,
      critical: incoming_data.наведенные_в_целом_critical.count,
      blocker: incoming_data.наведенные_в_целом_blocker.count
    });
    result.existingDefectsQuality = getQuality({
        trivial: incoming_data.существующие_ранее_trivial.count,
        minor: incoming_data.существующие_ранее_minor.count,
        major: incoming_data.существующие_ранее_major.count,
        critical: incoming_data.существующие_ранее_critical.count,
        blocker: incoming_data.существующие_ранее_blocker.count        
    });
/*    
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
*/
    response = res;
    response.render('reportVersion', {result: result});
    //pug.renderFile('./views/chart.pug', result, createChart);
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