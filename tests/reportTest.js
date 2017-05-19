var chai = require('chai');
var expect = chai.expect;
var Report = require('../controllers/Report');
var Feature = require('../controllers/Feature');

describe('Report', function() {
	it('can be created with certain type', function() {
		report = new Report(new Feature('HCS-41115'));
		expect(report.getType() instanceof Feature).to.equal(true);
	});
});