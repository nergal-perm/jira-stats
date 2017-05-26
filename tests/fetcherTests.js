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
            let f = ff.getIssueDataFetcher('oneIssueFetcher', []);
            expect(f.name).to.equal('oneIssueFetcher');
            expect(f.host).to.equal('http://localhost:3000');
            expect(f.queries.length).to.equal(1);
        });

        it('should preprocess query, fetch & return full data for one issue with one query', function(done) {
            let f = ff.getIssueDataFetcher('oneIssueFetcher', [{key: 'Issue', value: 'HCSINT-30889'}]);
            f.fetchData(function(err, issues) {
                if(err) {done(err);}
                expect(issues.length).to.equals(1);
                expect(issues[0].id).to.equal('649122');
                expect(issues[0].key).to.equal('HCSINT-30889');
                done();
            });
        });

        it('should preprocess query, fetch & return full data for several issues with one query', function(done) {
            let f = ff.getIssueDataFetcher('manyIssuesFetcher', [{key: 'Priority', value: 'Major'}]);
            f.fetchData(function(err, issues) {
                if (err) { done(err); }
                expect(issues.length).to.equal(3);
                done();
            })
        });
    });

    describe('IssueCountFetcher', function() {
        "use strict";
        it('should be properly initialized', function() {
            let f = ff.getIssueCountFetcher('oneQueryFetcher', []);
            expect(f.name).to.equal('oneQueryFetcher');
            expect(f.host).to.equal('http://localhost:3000');
            expect(f.queries.length).to.equal(1);

            let f1 = ff.getIssueCountFetcher('manyQueriesFetcher', []);
            expect(f1.name).to.equal('manyQueriesFetcher');
            expect(f1.host).to.equal('http://localhost:3000');
            expect(f1.queries.length).to.equal(3);
        });

        it('should preprocess query, fetch & return issues count using any number of queries', function(done) {
            let f = ff.getIssueCountFetcher('manyQueriesFetcher', [{key: 'Project', value: 'ГИС ЖКХ'}]);
            f.fetchData(function(err, issues) {
               let count = issues.reduce(function(cur,prev) {
                   return cur + prev;
               });
               expect(count).to.equal(9);
               done();
            });
        })
    });
});