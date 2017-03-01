var express = require('express');
var router = express.Router();

/* GET input from. */
router.get('/', function(req, res, next) {
  res.render('input', { defaults: {
  	projectName: 'ГИС ЖКХ',
  	date: getTodaysDate(),
  	additionalInfo: 'Доработка переведена на валидацию. Продолжаем валидировать дефекты после их исправления. Так же дополнительное тестирование будет произведено в рамках регрессионного тестирования всех подсистем.'
  } });
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

module.exports = router;
