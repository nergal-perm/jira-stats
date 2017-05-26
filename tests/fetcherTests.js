/**
 * Created by ETerekhov on 22.05.2017.
 */
const chai = require('chai');
const expect = chai.expect;
const FetcherFactory = require('../controllers/FetcherFactory.js');

const ff = new FetcherFactory();
describe('Fetchers', function() {
    describe('IssueDataFetcher', function() {
        "use strict";
        it('should be properly initialized', function() {
            let f = ff.getIssueDataFetcher('sampleFetcher', []);
            expect(f.name).to.equal('sampleFetcher');
            expect(f.host).to.equal('http://localhost:3000');
            expect(f.queries.length).to.equal(1);
        });

        it('should preprocess query, fetch & return some data', function(done) {
            let f = ff.getIssueDataFetcher('sampleFetcher', [{key: '%Issue%', value: 'HCSINT-30889'}]);
            f.fetchData(function(err, issues) {
                if(err) {done(err);}
                expect(issues[0].id).to.equal('649122');
                expect(issues[0].key).to.equal('HCSINT-30889');
                done();
            });
        });
    });
});