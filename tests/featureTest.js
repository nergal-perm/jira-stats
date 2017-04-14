var chai = require('chai');
var expect = chai.expect;
var Feature = require('../controllers/Feature');

describe('Feature', function() {
	it('can be created with feature ID', function () {
		var feature = new Feature('HCS-41115');
		expect(feature.getId()).to.equal('HCS-41115');

		feature = new Feature("HCS-99999");
		expect(feature.getId()).to.equal('HCS-99999');		
	});
});