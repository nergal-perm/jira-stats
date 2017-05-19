/**
 * Created by ETerekhov on 19.05.2017.
 */
const chai = require('chai');
const expect = chai.expect;
const Component = require('../controllers/Component');

describe('Component', function() {
    it('should be created with template & children if any', function() {
        var comp = new Component('testComponent');
        expect(comp.getChildren() == undefined);
        expect(comp.getTemplate() == 'testComponent');
    });
});
