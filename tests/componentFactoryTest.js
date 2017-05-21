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
        let kvpComp = cf.getKvpComponent('test_component');

        expect(kvpComp instanceof AbstractComponent).to.true;

        // Проверяем наличие свойств абстрактного класса
        expect("renderComponent" in kvpComp && !kvpComp.hasOwnProperty("renderComponent")).to.true;
        // Метод render() у каждого компонента должен быть объявлен у прототипа
        expect("render" in kvpComp && kvpComp.hasOwnProperty("render")).to.true;

        // Проверяем корректное создание свойства children
        expect(kvpComp.hasOwnProperty("children")).to.true;
        expect(Array.isArray(kvpComp.children)).to.true;
        expect(kvpComp.children.length).to.equal(0);

        expect(kvpComp.render()).to.equal('test_component');
    });

    it('should return LinkComponent with correct properties', function() {
        "use strict";
        let link = {
            url: 'http://yandex.ru',
            text: 'Yandex.ru'
        };
        let linkComp = cf.getLinkComponent(link);
        expect(linkComp.render()).to.equal('<a href="http://yandex.ru">Yandex.ru</a>');
    });

    it('should return TableRowComponent tree', function() {
        "use strict";
        let trc = cf.getTableRowComponent();
        expect(trc.render()).to.equal('<tr class="dense-information"><td class="dense-header"></td><td class="dense-data"></td></tr>');
    });

    it('should create components with independent children', function() {
        "use strict";
        let compA = cf.getLinkComponent({url:'', text:''});
        let compB = cf.getKvpComponent('placeholder');
        let childA = cf.getTableRowComponent();
        let childB = cf.getTableRowComponent();

        expect(childA).not.equals(childB);
        compA.addChild(childA);
        expect(compA.children.length).to.equal(1);
        expect(compB.children.length).to.equal(0);

        compB.addChild(childB);
        expect(compA.children.length).to.equal(1);
        expect(compB.children.length).to.equal(1);

        expect(compA.children).not.equals(compB.children);
    });

    it('should render all children and itself', function() {
        let kvpParent = cf.getKvpComponent('parent_component');
        kvpParent.addChild(cf.getKvpComponent('child_component_1'));
        kvpParent.addChild(cf.getKvpComponent('child_component_2'));
        kvpParent.addChild(cf.getKvpComponent('child_component_3'));
        expect(kvpParent.children.length).to.equal(3);
        expect(kvpParent.renderComponent()).to.equal('parent_component\nchild_component_1\nchild_component_2\nchild_component_3');
    });
});