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
    report.addChild(cf.getSectionComponent("Первая секция отчета"));
    report.addChild(cf.getSectionComponent("Вторая секция отчета"));
    // Вызвать метод render() или что-то вроде того, на корневом компоненте
    // Передать результат выполнения в res.render
    res.send(report.renderComponent());
});

module.exports = router;