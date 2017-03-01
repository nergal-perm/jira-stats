var page = require('webpage').create();
var webpageURLWithChart  = 'http://localhost:3100/chart.html';
var outputImageFileName = './public/images/chart.png';
var delay = 3000; 

console.log('Started PhantomJS');
page.open(webpageURLWithChart, function () {
	console.log('found webpage');
	window.setTimeout(function () {
		console.log('loaded webpage');
		page.render(outputImageFileName);
		console.log('created chart, exiting');
		phantom.exit();
	}, delay);
});