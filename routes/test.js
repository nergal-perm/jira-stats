/**
 * Created by ETerekhov on 19.05.2017.
 */
'use strict';

const express = require('express');
const router = express.Router();
const pug = require('pug');

const ComponentFactory = require('../controllers/ComponentFactory.js');
let cf = new ComponentFactory();

router.get('/', function(req, res) {
    // Собрать дерево компонентов
    let report = cf.getReportComponent();
    report.addChild(fillFirstSection());
    report.addChild(cf.getSectionComponent("Вторая секция отчета"));
    // Вызвать метод render() или что-то вроде того, на корневом компоненте
    // Передать результат выполнения в res.render
    res.send(report.renderComponent());
});

function fillFirstSection() {
    let firstSection = cf.getSectionComponent("Первая секция отчета");
    let sr1 = cf.getSectionRowComponent();
    let srn = cf.getIndicatorNameComponent()
        .addChild(cf.getTextComponent({style: 'bold', text: 'Наименование параметра'}));
    let srv = cf.getIndicatorValueComponent()
        .addChild(cf.getTextComponent({style: 'multi', text: ['Довольно длинная строка со значением параметра','А вообще текст разбит на несколько строк']}))
        .addChild(cf.getTextComponent({style: 'plain', text: 'А это следующий абзац'}))
        .addChild(cf.getTextComponent({style: 'bold', text: 'Текст тоже может быть жирным, если это заголовок :)'}));


    sr1.addChild(srn).addChild(srv);

    firstSection.addChild(sr1);

    return firstSection;
}

module.exports = router;