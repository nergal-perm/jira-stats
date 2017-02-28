var express = require('express');
var router = express.Router();

/* GET input from. */
router.get('/', function(req, res, next) {
  res.render('input', { title: 'Express' });
});

module.exports = router;
