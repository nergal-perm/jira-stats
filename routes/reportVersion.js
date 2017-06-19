/**
 * Created by Евгений on 18.06.2017.
 */
"use strict";
const express = require('express');
const router = express.Router();
const pug = require('pug');
const fs = require('fs');
const path = require('path');
const fetcher = require('../controllers/fetcher');

let result = {};
let response = {};

router.get('/report', function(req, res, next) {
    // На время тестирования
    result.summary = getSummary(req);
    result.testCoverage = getInitialTestCoverage(req);
    let options = {
        dataType: ["Version", "prevVersion"],
        dataValue: ["11.1.6", "11.1.0"]
    };
    //let dateArr = req.body.dateTestEnd.split('-');
    //result.input.dateTestEnd = dateArr[2] + '.' + dateArr[1] + '.' + dateArr[0];
    fetcher.getData(options, res, generateResponse);
});

function getSummary(request) {
    let summary = request.body;
    summary.additionalInfo = request.body.additionalInfo ? request.body.additionalInfo.split('\n').map(function(item) {
        return item;
    }) : "";
    return summary;
}

function getInitialTestCoverage(request) {
    return request.body.testCoverage ? request.body.testCoverage.split('\n').map(function(item) {
        return item;
    }) : "";
}

function getQualityAsessment(incomingData) {
    let versionDefects = {
        blocker: incomingData['наведенные_оставшиеся_к_выпуску_blocker'].count,
        critical: incomingData['наведенные_оставшиеся_к_выпуску_critical'].count,
        major: incomingData['наведенные_оставшиеся_к_выпуску_major'].count,
        minor: incomingData['наведенные_оставшиеся_к_выпуску_minor'].count,
        trivial: incomingData['наведенные_оставшиеся_к_выпуску_trivial'].count
    };
    let systemDefects = {
        blocker: incomingData['наведенные_оставшиеся_в_системе_blocker'].count,
        critical: incomingData['наведенные_оставшиеся_в_системе_critical'].count,
        major: incomingData['наведенные_оставшиеся_в_системе_major'].count,
        minor: incomingData['наведенные_оставшиеся_в_системе_minor'].count,
        trivial: incomingData['наведенные_оставшиеся_в_системе_trivial'].count
    };
    return {
        versionQuality: getQuality(versionDefects),
        versionDefects: versionDefects,
        versionDefectsUrl: incomingData['наведенные_оставшиеся_к_выпуску'].url,
        systemQuality: getQuality(systemDefects),
        systemDefects: systemDefects,
        systemDefectsUrl: incomingData['наведенные_оставшиеся_в_системе'].url,
    }
}

function getActualAndFixed(incomingData) {
    return {
        "ААА": incomingData['ААА_актуальных_дефектов_в_системе'],
        "ААА-1": incomingData['ААА-1_актуальных_дефектов_в_системе_blocker'],
        "ААА-2": incomingData['ААА-2_актуальных_дефектов_в_системе_critical'],
        "ААА-3": incomingData['ААА-3_актуальных_дефектов_в_системе_major'],
        "БББ": incomingData['БББ_наведенных_дефектов_в_системе'],
        "БББ-1": incomingData['БББ-1_наведенных_дефектов_в_системе_blocker'],
        "БББ-2": incomingData['БББ-2_наведенных_дефектов_в_системе_critical'],
        "БББ-3": incomingData['БББ-3_наведенных_дефектов_в_системе_major'],
        "ВВВ": incomingData['ВВВ_актуальных_дефектов_для_версии'],
        "ВВВ-1": incomingData['ВВВ-1_актуальных_дефектов_для_версии_blocker'],
        "ВВВ-2": incomingData['ВВВ-2_актуальных_дефектов_для_версии_critical'],
        "ВВВ-3": incomingData['ВВВ-3_актуальных_дефектов_для_версии_major'],
        "ГГГ": incomingData['ГГГ_наведенных_дефектов_для_версии'],
        "ГГГ-1": incomingData['ГГГ-1_наведенных_дефектов_для_версии_blocker'],
        "ГГГ-2": incomingData['ГГГ-2_наведенных_дефектов_для_версии_critical'],
        "ГГГ-3": incomingData['ГГГ-3_наведенных_дефектов_для_версии_major'],
        "ДДД": incomingData['ДДД_исправлено_ненаведенных_дефектов'],
        "ДДД-1": incomingData['ДДД-1_исправлено_ненаведенных_дефектов_blocker'],
        "ДДД-2": incomingData['ДДД-2_исправлено_ненаведенных_дефектов_critical'],
        "ДДД-3": incomingData['ДДД-3_исправлено_ненаведенных_дефектов_major']
    }
}

function getNeedToFix(incomingData) {
    return {
        url: incomingData['detailed_актуальные_дефекты_для_версии'].url,
        issues: incomingData['detailed_актуальные_дефекты_для_версии'].issues.map(function(issue) {
            return {
                key: issue.key,
                url: issue.self,
                subject: issue.fields.summary,
                priority: {
                    iconUrl: issue.fields.priority.iconUrl,
                    name: issue.fields.priority.name
                },
                affectedVersions: issue.fields.versions,
                status: {
                    iconUrl: issue.fields.status.iconUrl,
                    name: issue.fields.status.name
                },
                inductivity: issue.fields.customfield_16424 ? issue.fields.customfield_16424.value : ""
            }
        })
    };
}

function getFeatures(incomingData) {
    return incomingData['Тестовое покрытие'].issues.map(function(issue) {
        let issueDefects = {
            blocker: incomingData[issue.key + '_ЕЕЕ_актуальные_дефекты_blocker'].count,
            critical: incomingData[issue.key + '_ЖЖЖ_актуальные_дефекты_critical'].count,
            major: incomingData[issue.key + '_ЗЗЗ_актуальные_дефекты_major'].count,
            minor: 0,
            trivial: 0
        };
        return {
            key: issue.key,
            url: issue.self,
            subject: issue.fields.subject,
            quality: getQuality(issueDefects),
            'ИИИ': {
                count: incomingData[issue.key + '_ИИИ_уточнения'].count,
                issues: incomingData[issue.key + '_ИИИ_уточнения'].issues
            },
            'ЕЕЕ': {
                count: incomingData[issue.key + '_ЕЕЕ_актуальные_дефекты_blocker'].count,
                issues: incomingData[issue.key + '_ЕЕЕ_актуальные_дефекты_blocker'].issues,
            },
            'ЖЖЖ': {
                count: incomingData[issue.key + '_ЖЖЖ_актуальные_дефекты_critical'].count,
                issues: incomingData[issue.key + '_ЖЖЖ_актуальные_дефекты_critical'].issues
            },
            'ЗЗЗ': {
                count: incomingData[issue.key + '_ЗЗЗ_актуальные_дефекты_major'].count,
                issues: incomingData[issue.key + '_ЗЗЗ_актуальные_дефекты_major'].issues
            }
        }
    });
}

function getLowQualityFeatures () {
    return result.features.filter(function(item) {
        return item.quality <=2;
    });
}

function generateResponse(res, incomingData) {
    //res.setHeader('Content-Type', 'application/json');
    //res.send(JSON.stringify(result));

    //result.testCoverage = getAdditionalTestCoverage(incomingData);
    result.qualityAsessment = getQualityAsessment(incomingData);
    result.actualAndFixedDefects = getActualAndFixed(incomingData);
    result.needToFix = getNeedToFix(incomingData);
    result.features = getFeatures(incomingData);
    result.lowQualityFeatures = getLowQualityFeatures();


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
        version: '11.0.11'
    };
    /*
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

    //pug.renderFile('./views/chart.pug', result, createChart);

    */
    response = res;
    response.render('reportVersion', {result: result});
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