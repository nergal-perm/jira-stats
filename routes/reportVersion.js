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
let done = false;

router.get('/data', function(req, res) {
    res.render('inputVersion', { defaults: {
        projectName: 'ГИС ЖКХ',
        date: getTodaysDate(),
    },
        submitAddress: 'report-version'});
});

router.post('/', function(req, res, next) {
    result.input = req.body;
    result.input.testCoverage = getInitialTestCoverage(req);
    let dateArr = req.body.dateTestEnd.split('-');
    result.input.dateTestEnd = dateArr[2] + '.' + dateArr[1] + '.' + dateArr[0];
    let options = {
        dataType: ["Version"],
        dataValue: [req.body.version]
    };

    response = res;
    fetcher.getData(options, response, generateResponse);
    res.redirect('../report-version/processing');
});

router.get('/processing', function(req, res, next) {
    if (done) {
        res.redirect('../report-version/done')
    } else {
        res.render('processing', {status: fetcher.getStatus()});
    }
});

router.get('/done', function(req, res, next) {
    res.render('reportVersion', {result: result, title: "Отчет по версии/ХФ"});
});

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
        blocker: incomingData['оставшиеся_в_системе_blocker'].count,
        critical: incomingData['оставшиеся_в_системе_critical'].count,
        major: incomingData['оставшиеся_в_системе_major'].count,
        minor: incomingData['оставшиеся_в_системе_minor'].count,
        trivial: incomingData['оставшиеся_в_системе_trivial'].count
    };
    return {
        versionQuality: getQuality(versionDefects, true),
        versionDefects: versionDefects,
        versionDefectsUrl: incomingData['наведенные_оставшиеся_к_выпуску'].url,
        systemQuality: getQuality(systemDefects, false),
        systemDefects: systemDefects,
        systemDefectsUrl: incomingData['оставшиеся_в_системе'].url,
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
                url: 'https://jira.lanit.ru/browse/' + issue.key,
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
    let tempResult = incomingData['Тестовое покрытие'].issues.map(function(issue) {
        let issueDefects = {
            blocker: incomingData[issue.key + '_ЕЕЕ_актуальные_дефекты_blocker'].count,
            critical: incomingData[issue.key + '_ЖЖЖ_актуальные_дефекты_critical'].count,
            major: incomingData[issue.key + '_ЗЗЗ_актуальные_дефекты_major'].count,
            minor: 0,
            trivial: 0
        };
        return {
            key: issue.key,
            url: 'https://jira.lanit.ru/browse/' + issue.key,
            subject: issue.fields.summary,
            quality: getQuality(issueDefects, false),
            'ИИИ': {
                count: incomingData[issue.key + '_ИИИ_уточнения'].count,
                issues: incomingData[issue.key + '_ИИИ_уточнения'].issues,
                url: incomingData[issue.key + '_ИИИ_уточнения'].url
            },
            'ЕЕЕ': {
                count: incomingData[issue.key + '_ЕЕЕ_актуальные_дефекты_blocker'].count,
                issues: incomingData[issue.key + '_ЕЕЕ_актуальные_дефекты_blocker'].issues,
                url: incomingData[issue.key + '_ЕЕЕ_актуальные_дефекты_blocker'].url
            },
            'ЖЖЖ': {
                count: incomingData[issue.key + '_ЖЖЖ_актуальные_дефекты_critical'].count,
                issues: incomingData[issue.key + '_ЖЖЖ_актуальные_дефекты_critical'].issues,
                url: incomingData[issue.key + '_ЖЖЖ_актуальные_дефекты_critical'].url
            },
            'ЗЗЗ': {
                count: incomingData[issue.key + '_ЗЗЗ_актуальные_дефекты_major'].count,
                issues: incomingData[issue.key + '_ЗЗЗ_актуальные_дефекты_major'].issues,
                url: incomingData[issue.key + '_ЗЗЗ_актуальные_дефекты_major'].url
            },
            status: {
                iconUrl: issue.fields.status.iconUrl,
                name: issue.fields.status.name
            }
        }
    });
    return tempResult.sort(byQuality);
}

function getLowQualityFeatures () {
    return result.features.filter(function(item) {
        return item.quality <=2;
    });
}

function getFixedDefects(incomingData) {
    return {
        url: incomingData['detailed_исправленные_дефекты'].url,
        issues: incomingData['detailed_исправленные_дефекты'].issues.map(function(issue) {
            return {
                key: issue.key,
                url: 'https://jira.lanit.ru/browse/' + issue.key,
                subject: issue.fields.summary,
                journal: issue.fields.customfield_14120,
                priority: {
                    iconUrl: issue.fields.priority.iconUrl,
                    name: issue.fields.priority.name
                }
            };
        })
    }
}

function byQuality(a, b) {
    if (a.quality.level && b.quality.level) {
        return b.quality.level - a.quality.level;
    } else {
        return 0;
    }
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
    result.fixedDefects = getFixedDefects(incomingData);
    result.input.featuresUrl = incomingData['Тестовое покрытие'].url;

    done = true;
}

function getQuality(defects, areInduced) {
    let blockerDescription = getDefectsDescription(defects.blocker, 'Blocker', areInduced);
    let criticalDescription = getDefectsDescription(defects.critical, 'Critical', areInduced);
    let majorDescription = getDefectsDescription(defects.major, 'Major', areInduced);
    if (defects.blocker > 0) {
        return {
            level: 1,
            text: 'НИЗКОЕ',
            spanStyle: 'quality-low',
            description: blockerDescription
        };
    } else if (defects.critical > 2) {
        return {
            level: 2,
            text: 'НИЖЕ СРЕДНЕГО',
            spanStyle: 'quality-low',
            description: criticalDescription
        };
    } else if (defects.critical <= 2 && defects.critical > 0) {
        return {
            level: 3,
            text: 'СРЕДНЕЕ',
            spanStyle: 'quality-medium',
            description: criticalDescription
        };
    } else if (defects.major <= 2 && defects.major > 0) {
        return {
            level: 4,
            text: 'ВЫШЕ СРЕДНЕГО',
            spanStyle: 'quality-high',
            description: majorDescription
        };
    } else {
        return {
            level: 5,
            text: 'ВЫСОКОЕ',
            spanStyle: 'quality-high',
            description: ''
        };
    }
}

function getDefectsDescription(number, defectLevel, areInduced) {
    let defectHelperArray = areInduced ?
        ['наведенный дефект', 'наведенных дефекта', 'наведенных дефектов'] :
        ['дефект', 'дефекта', 'дефектов']
    return number + ' ' + declOfNumber(number, defectHelperArray) + ' уровня ' + defectLevel;
}

// https://gist.github.com/realmyst/1262561
function declOfNumber(n, titles) {
    return titles[(n%10===1 && n%100!==11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)];
}

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

module.exports = router;