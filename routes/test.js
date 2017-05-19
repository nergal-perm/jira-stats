/**
 * Created by ETerekhov on 19.05.2017.
 */
const express = require('express');
const router = express.Router();
const pug = require('pug');

router.get('/', function(req, res, next) {
    // Собрать дерево компонентов
    // Вызвать метод render() или что-то вроде того, на корневом компоненте
    // Передать результат выполнения в res.render
    res.render('test', {componentsTree: tree.getRendered()} );
});

module.exports = router;