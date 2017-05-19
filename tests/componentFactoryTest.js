/**
 * Created by ETerekhov on 19.05.2017.
 */
const chai = require('chai');
const expect = chai.expect;
const ComponentFactory = require('../controllers/ComponentFactory.js');
const AbstractComponent = require('../controllers/AbstractComponent.js');

const cf = new ComponentFactory();
describe('ComponentFactory', function() {
    it('should return KvpComponent with placeholder', function () {
        var kvpComp = cf.getKvpComponent('test_component');

        expect(kvpComp instanceof AbstractComponent).to.true;

        // Проверяем наличие свойств абстрактного класса
        expect("renderComponent" in kvpComp && !kvpComp.hasOwnProperty("renderComponent")).to.true;
        expect("render" in kvpComp && !kvpComp.hasOwnProperty("render")).to.true;

        // Проверяем корректное создание свойства children
        expect(kvpComp.hasOwnProperty("children")).to.true;
        expect(Array.isArray(kvpComp.children)).to.true;
        expect(kvpComp.children.length).to.equal(0);

        expect(kvpComp.render()).to.equal('test_component');
    });

    it('should render all children and itself', function() {
        var kvpParent = cf.getKvpComponent('parent_component');
        kvpParent.addChild(cf.getKvpComponent('child_component_1'));
        kvpParent.addChild(cf.getKvpComponent('child_component_2'));
        kvpParent.addChild(cf.getKvpComponent('child_component_3'));
        expect(kvpParent.children.length).to.equal(3);
        expect(kvpParent.renderComponent()).to.equal('parent_component\nchild_component_1\nchild_component_2\nchild_component_3');
    });
});