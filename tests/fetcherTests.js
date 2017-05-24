/**
 * Created by ETerekhov on 22.05.2017.
 */
const chai = require('chai');
const expect = chai.expect;
const FetcherFactory = require('../controllers/FetcherFactory.js');

const ff = new FetcherFactory();
describe('AbstractFetcher', function() {
    "use strict";
    it('should be properly initialized', function() {
        let f = ff.getSimpleFetcher('sampleFetcher');
        expect(f.name).to.equal('sampleFetcher');
        expect(f.host).to.equal('http://localhost:3000');
        expect(f.queries.length).to.equal(1);
    });

    it('should fetch, process & return some data', function(done) {
        let f = ff.getSimpleFetcher('sampleFetcher');
        f.fetchData(function(err, data) {
            if(err) {done(err);}
            expect(data[0].name).to.equal('Название большой доработки');
            expect(data[0].customField).to.equal('Добавили при обработке');
            expect(data[1].name).to.equal('Название новой версии');
            done();
        });
    });
});