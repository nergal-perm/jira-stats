/**
 * Created by ETerekhov on 22.05.2017.
 */
const chai = require('chai');
const expect = chai.expect;
const AbstractFetcher = require('../controllers/AbstractFetcher.js');

describe('AbstractFetcher', function() {
    "use strict";
    it('should be properly initialized', function() {
        let f = new AbstractFetcher('sampleFetcher');
        expect(f.name).to.equal('sampleFetcher');
        expect(f.host).to.equal('http://localhost:3000');
        expect(f.queries.length).to.equal(1);
    });
});