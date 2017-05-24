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

    it('should return some data after calling its fetchData method', function(done) {
        let f = new AbstractFetcher('sampleFetcher');
        f.fetchData(function(err, data) {
            if(err) {done(err);}
            expect(data[0].name).to.equal('Название большой доработки');
            done();
        });
    });
});