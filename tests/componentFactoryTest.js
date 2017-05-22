/**
 * Created by ETerekhov on 19.05.2017.
 */
const chai = require('chai');
const expect = chai.expect;
const ComponentFactory = require('../controllers/ComponentFactory.js');
const AbstractComponent = require('../controllers/AbstractComponent.js');

const cf = new ComponentFactory();
describe('ReportComponents and generic components', function() {
    "use strict";
    it('should create component from AbstractComponent', function () {
        let genericComponent = cf.getReportComponent();

        expect(genericComponent instanceof AbstractComponent).to.true;

        // Проверяем наличие свойств абстрактного класса
        expect("renderComponent" in genericComponent && !genericComponent.hasOwnProperty("renderComponent")).to.true;
        // Метод render() у каждого компонента должен быть объявлен у прототипа
        expect("render" in genericComponent && genericComponent.hasOwnProperty("render")).to.true;

        // Проверяем корректное создание свойства children
        expect(genericComponent.hasOwnProperty("children")).to.true;
        expect(Array.isArray(genericComponent.children)).to.true;
        expect(genericComponent.children.length).to.equal(0);
    });

    it('should create ReportComponent which accepts only SectionComponents as its children', function() {
        "use strict";
        let reportComponent = cf.getReportComponent();
        reportComponent.addChild(cf.getSectionComponent('Some title'));
        expect(reportComponent.children.length).to.equal(1);
        reportComponent.addChild(cf.getSectionRowComponent());
        expect(reportComponent.children.length).to.equal(1);
        reportComponent.addChild(cf.getSectionComponent('Next section'));
        expect(reportComponent.children.length).to.equal(2);
    });
});

describe('SectionComponents', function() {
    "use strict";
    it('should create SectionComponent tree', function() {
        "use strict";
        let sectionComponent = cf.getSectionComponent('Общая информация о тестировании доработки');
        let sectionRowComponent = cf.getSectionRowComponent();
        sectionRowComponent.addChild(cf.getIndicatorNameComponent());
        sectionRowComponent.addChild(cf.getIndicatorValueComponent());
        sectionComponent.addChild(sectionRowComponent);
        expect(sectionComponent.renderComponent()).to.equals(
            '<table class="report-table"><tbody><tr class="section-header-row">' +
            '<td class="section-header-cell version" colSpan="2">' +
            '<span><img src="/images/headerBullet.png" alt="bullet" style="height:12px; width:16px;"/></span>' +
            '&nbsp;Общая информация о тестировании доработки</td></tr>' +
            '<tr class="dense-information"><td class="dense-header"></td><td class="dense-data"></td></tr></tbody></table>'
        );
    });

    it('SectionComponent should add only TableRowComponents as its children', function() {
        "use strict";
        let sectionComponent = cf.getSectionComponent('Some title');
        expect(sectionComponent.children.length).to.equal(0);
        sectionComponent.addChild(cf.getSectionRowComponent());
        expect(sectionComponent.children.length).to.equal(1);
        sectionComponent.addChild(cf.getLinkComponent());
        expect(sectionComponent.children.length).to.equal(1);
        sectionComponent.addChild(cf.getSectionRowComponent('Another section'));
        expect(sectionComponent.children.length).to.equal(2);
    });

    it('should create components with independent children', function() {
        "use strict";
        let compA = cf.getSectionComponent('Some text');
        let compB = cf.getSectionComponent('Another text');
        let childA = cf.getSectionRowComponent();
        let childB = cf.getSectionRowComponent();

        expect(childA).not.equals(childB);
        compA.addChild(childA);
        expect(compA.children.length).to.equal(1);
        expect(compB.children.length).to.equal(0);

        compB.addChild(childB);
        expect(compA.children.length).to.equal(1);
        expect(compB.children.length).to.equal(1);

        expect(compA.children).not.equals(compB.children);
    });
});

describe('SectionRowComponents', function() {
    "use strict";
    it('should return SectionRowComponent tree which accepts only Name/Value components as its children', function() {
        "use strict";
        let trc = cf.getSectionRowComponent();
        trc.addChild(cf.getIndicatorNameComponent());
        expect(trc.children.length).to.equal(1);
        trc.addChild(cf.getIndicatorNameComponent());
        expect(trc.children.length).to.equal(1);
        trc.addChild(cf.getIndicatorValueComponent());
        expect(trc.children.length).to.equal(2);
        trc.addChild(cf.getIndicatorValueComponent());
        expect(trc.children.length).to.equal(2);
        trc.addChild(cf.getIndicatorNameComponent());
        expect(trc.children.length).to.equal(3);
        trc.addChild(cf.getIndicatorNameComponent());
        expect(trc.children.length).to.equal(3);
        trc.addChild(cf.getIndicatorValueComponent());

        expect(trc.renderComponent()).to.equal('<tr class="dense-information">' +
            '<td class="dense-header"></td><td class="dense-data"></td>' +
            '<td class="dense-header"></td><td class="dense-data"></td>' +
            '</tr>');
    });

});

describe('DataComponents', function() {
    "use strict";
    it('should create and render simple text component with different styles', function() {
        let textComponent = cf.getTextComponent({style: 'plain', text: "Hello, world"});
        expect(textComponent.renderComponent()).to.equal('<p>Hello, world</p>');
        let boldComponent = cf.getTextComponent({style: 'bold', text: "This is bold"});
        expect(boldComponent.renderComponent()).to.equal('<p><b>This is bold</b></p>');
        let multiLineComponent = cf.getTextComponent({style: 'multi', text: ['Первая строка многострочного текста', 'Вторая строка многострочного текста']});
        expect(multiLineComponent.renderComponent()).to.equal('<p>Первая строка многострочного текста<br/>Вторая строка многострочного текста</p>');
    });
});

describe('LinkComponents', function() {
    "use strict";
    it('should return LinkComponent with correct properties', function() {
        "use strict";
        let link = {
            url: 'http://yandex.ru',
            text: 'Yandex.ru'
        };
        let linkComp = cf.getLinkComponent(link);
        expect(linkComp.render()).to.equal('<a href="http://yandex.ru">Yandex.ru</a>');
    });
});