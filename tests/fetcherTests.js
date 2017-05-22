/**
 * Created by ETerekhov on 22.05.2017.
 */
const chai = require('chai');
const expect = chai.expect;
const AbstractFetcher = require('../controllers/AbstractFetcher.js');

describe('AbstractFetcher', function() {
    "use strict";
    it('should be properly initialized', function() {
        let f = new AbstractFetcher('sample');
        expect(f.name).to.equals('sample');
    });
});