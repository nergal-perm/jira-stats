/**
 * Created by Евгений on 18.06.2017.
 */
"use strict";
const express = require('express');
const router = express.Router();
const pug = require('pug');
const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');
const phantomjs = require('phantomjs-prebuilt');
const binPath = phantomjs.path;
const fetcher = require('../controllers/fetcher');

let result = {};
let response = {};

router.get('/report', function(req, res, next) {
    // На время тестирования
    result.input = {

    };
    result.input.testCoverage = req.body.testCoverage ? req.body.testCoverage.split('\n').map(function(item) {
        return item;
    }) : "";
    result.input.additionalInfo = req.body.additionalInfo ? req.body.additionalInfo.split('\n').map(function(item) {
        return item;
    }) : "";
    let options = {
        dataType: ["Version", "prevVersion"],
        dataValue: ["11.1.1", "11.1.0"]
    };
    //let dateArr = req.body.dateTestEnd.split('-');
    //result.input.dateTestEnd = dateArr[2] + '.' + dateArr[1] + '.' + dateArr[0];
    fetcher.getData(options, res, generateResponse);
});

function generateResponse(res, incoming_data) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(incoming_data));
    return;
    /*
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
        defectsCreated: incoming_data['МММ_заведено_новых_дефектов'].count || 0,
        defectsCreatedLink: incoming_data['МММ_заведено_новых_дефектов'].url,
        indDefectsCreated: incoming_data['РРР_заведено_новых_дефектов_наведенные'].count || 0,
        indDefectsCreatedLink: incoming_data['РРР_заведено_новых_дефектов_наведенные'].url,
        defectsFixed: incoming_data['ЖЖЖ_исправлено_дефектов_заведенных_в_версии'].count || 0,
        defectsFixedLink: incoming_data['ЖЖЖ_исправлено_дефектов_заведенных_в_версии'].url,
        indDefectsFixed: incoming_data['ППП_исправлено_дефектов_заведенных_в_версии_наведенные'].count || 0,
        indDefectsFixedLink: incoming_data['ППП_исправлено_дефектов_заведенных_в_версии_наведенные'].url,
        defectsPostponed: incoming_data['ЦЦЦ_снесено_дефектов'].count || 0,
        defectsPostponedLink: incoming_data['ЦЦЦ_снесено_дефектов'].url,
        indDefectsPostponed: incoming_data['ССС_снесено_дефектов_наведенные'].count || 0,
        indDefectsPostponedLink: incoming_data['ССС_снесено_дефектов_наведенные'].url,
        defectsActual: incoming_data['ЛЛЛ_актуально_дефектов'].count || 0,
        defectsActualLink: incoming_data['ЛЛЛ_актуально_дефектов'].url,
        indDefectsActual: incoming_data['ЙЙЙ_актуально_дефектов_наведенные'].count || 0,
        indDefectsActualLink: incoming_data['ЙЙЙ_актуально_дефектов_наведенные'].url
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
        trivial: incoming_data['наведенные_оставшиеся_к_выпуску_trivial'].count,
        minor: incoming_data['наведенные_оставшиеся_к_выпуску_minor'].count,
        major: incoming_data['наведенные_оставшиеся_к_выпуску_major'].count,
        critical: incoming_data['наведенные_оставшиеся_к_выпуску_critical'].count,
        blocker: incoming_data['наведенные_оставшиеся_к_выпуску_blocker'].count
    });
    result.inducedActualForSystemQuality = getQuality({
        trivial: incoming_data['наведенные_оставшиеся_в_системе_trivial'].count,
        minor: incoming_data['наведенные_оставшиеся_в_системе_minor'].count,
        major: incoming_data['наведенные_оставшиеся_в_системе_major'].count,
        critical: incoming_data['наведенные_оставшиеся_в_системе_critical'].count,
        blocker: incoming_data['наведенные_оставшиеся_в_системе_blocker'].count
    });
    result.inducedAsAWholeQuality = getQuality({
        trivial: incoming_data['наведенные_в_целом_trivial'].count,
        minor: incoming_data['наведенные_в_целом_minor'].count,
        major: incoming_data['наведенные_в_целом_major'].count,
        critical: incoming_data['наведенные_в_целом_critical'].count,
        blocker: incoming_data['наведенные_в_целом_blocker'].count
    });
    result.existingDefectsQuality = getQuality({
        trivial: incoming_data['существующие_ранее_trivial'].count,
        minor: incoming_data['существующие_ранее_minor'].count,
        major: incoming_data['существующие_ранее_major'].count,
        critical: incoming_data['существующие_ранее_critical'].count,
        blocker: incoming_data['существующие_ранее_blocker'].count
    });
    result.defects_need_to_fix = incoming_data['detailed_требующие_исправления_дефекты'];
    result.newdefectsChartData = [
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
    response.render('reportVersion', {result: result});
    //pug.renderFile('./views/chart.pug', result, createChart);

    */
}

function createChart(err, chartTemplate) {
    fs.writeFileSync('./public/chart.html', chartTemplate);
    const childArgs = [
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