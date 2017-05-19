/**
 * Created by ETerekhov on 19.05.2017.
 */
const chai = require('chai');
const expect = chai.expect;
const KvpComponent = require('../controllers/KeyValueComponent');

describe('KvpComponent', function() {
    it('should be created with template & children if any', function() {
        var comp = new KvpComponent();
        expect(comp.getChildren() === undefined);
    });

    /* jshint expr:true */
    it('should have render methods', function() {
        var comp = new KvpComponent();
        expect('renderComponent' in comp).true;
        expect('render' in comp).true;
    });

    it('should compile predefined template with string kvp', function() {
        var comp = new KvpComponent('table-row-1', {type: 'string', key: 'Название параметра', value:'Значение параметра'});
        expect(comp.renderComponent().key).to.equal('table-row-1');
        expect(comp.renderComponent().value).to.equal('<td class="dense-header">Название параметра</td><td class="dense-data">Значение параметра</td>');
    });

    it('should compile predefined template with link kvp', function() {
        var comp = new KvpComponent('table-row-2', {type: 'link', key: 'Название параметра', value:'Значение параметра', href: 'http://ya.ru'});
        expect(comp.renderComponent().key).to.equal('table-row-2');
        expect(comp.renderComponent().value).to.equal('<td class="dense-header">Название параметра</td><td class="dense-data"><a href="http://ya.ru">Значение параметра</a></td>');
    });
});
