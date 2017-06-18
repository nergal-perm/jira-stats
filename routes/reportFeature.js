let express = require('express');
let router = express.Router();
let pug = require('pug');
let fs = require('fs');
let childProcess = require('child_process');
let path = require('path');
let phantomjs = require('phantomjs-prebuilt');
let binPath = phantomjs.path;
let fetcher = require('../controllers/fetcher');

let result = {};
let response = {};

/* GET report. */
router.post('/', function(req, res) {
    result.input = req.body;
    result.input.testCoverage = req.body.testCoverage.split('\n').map(function(item) {
        return item;
    });
    result.input.additionalInfo = req.body.additionalInfo.split('\n').map(function(item) {
        return item;
    });
    let options = {
        dataType: ["Feature"],
        dataValue: [req.body.featureID]
    };
    let dateArr = req.body.dateTestEnd.split('-');
    result.input.dateTestEnd = dateArr[2] + '.' + dateArr[1] + '.' + dateArr[0];
    fetcher.getData(options, res, generateResponse);
});

router.get('/data', function(req, res) {
    res.render('inputFeature', { defaults: {
        projectName: 'ГИС ЖКХ',
        date: getTodaysDate(),
        testCoverage: 'Тестирование доработки включало в себя следующие активности:\r\n1. Тестирование доработки;\r\n2. Валидация заведенных дефектов.',
        additionalInfo: 'Доработка переведена на валидацию. Продолжаем валидировать дефекты после их исправления. Так же дополнительное тестирование будет произведено в рамках регрессионного тестирования всех подсистем.'
    },
        submitAddress: 'report-feature'});
});

function getTodaysDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1; //January is 0!

    let yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    }
    if(mm<10){
        mm='0'+mm;
    }
    return yyyy+'-'+mm+'-'+dd;
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
    if (err) { throw err; }
    fs.writeFileSync('./public/chart.html', chartTemplate);
    let childArgs = [
        path.join(process.cwd(), 'chart.js')
    ];
    childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
        if (err) {
            console.log(stderr.toString());
            throw(err);
        }
        response.render('reportFeature', {result: result});
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