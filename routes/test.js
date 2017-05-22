/**
 * Created by ETerekhov on 19.05.2017.
 */
'use strict';

const express = require('express');
const router = express.Router();
const pug = require('pug');

const ComponentFactory = require('../controllers/ComponentFactory.js');
let cf = new ComponentFactory();

router.post('/', function(req, res) {
    // Собрать дерево компонентов
    let report = cf.getReportComponent();
    report.addChild(fillFirstSection(req.body));
    report.addChild(cf.getSectionComponent("Вторая секция отчета"));
    // Вызвать метод render() или что-то вроде того, на корневом компоненте
    // Передать результат выполнения в res.render
    res.send(report.renderComponent());
});

router.get('/', function(req, res) {
    res.render('input', { defaults: {
        projectName: 'ГИС ЖКХ',
        date: getTodaysDate(),
        testCoverage: 'Тестирование доработки включало в себя следующие активности:\r\n1. Тестирование доработки;\r\n2. Валидация заведенных дефектов.',
        additionalInfo: 'Доработка переведена на валидацию. Продолжаем валидировать дефекты после их исправления. Так же дополнительное тестирование будет произведено в рамках регрессионного тестирования всех подсистем.'
    },
    submitAddress: 'test'});
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

function fillFirstSection(inputData) {
    inputData.testCoverage = inputData.testCoverage.split('\n').map(function(item) {
        return item;
    });
    inputData.additionalInfo = inputData.additionalInfo.split('\n').map(function(item) {
        return item;
    });
    let firstSection = cf.getSectionComponent("Общая информация о тестировании доработки");

    // Наименование проекта
    firstSection
        .addChild(cf.getSectionRowComponent()
            .addChild(cf.getIndicatorNameComponent()
                .addChild(cf.getTextComponent({style: 'bold', text: 'Название проекта'})))
            .addChild(cf.getIndicatorValueComponent()
                .addChild(cf.getTextComponent({style: 'plain', text: inputData.projectName}))));
    // Название доработки
    firstSection
        .addChild(cf.getSectionRowComponent()
            .addChild(cf.getIndicatorNameComponent()
                .addChild(cf.getTextComponent({style: 'bold', text: 'Название доработки'})))
            .addChild(cf.getIndicatorValueComponent()
                .addChild(cf.getTextComponent({style: 'plain', text: inputData.featureName}))));
    // Ссылка на доработку
    let url = 'https://jira.lanit.ru/browse/' + inputData.featureID;
    firstSection
        .addChild(cf.getSectionRowComponent()
            .addChild(cf.getIndicatorNameComponent()
                .addChild(cf.getTextComponent({style: 'bold', text: 'Ссылка на доработку'})))
            .addChild(cf.getIndicatorValueComponent()
                .addChild(cf.getLinkComponent({url: url, text: url}))));

    return firstSection;
}

module.exports = router;