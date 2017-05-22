/**
 * Created by ETerekhov on 19.05.2017.
 */
"use strict";
const pug = require('pug');


const AbstractComponent = require('./AbstractComponent');

let ComponentFactory = function() {

};

ComponentFactory.prototype.getReportComponent = function() {
    let newComp = new AbstractComponent('report');
    newComp.render = function() {
        return pug.compileFile('./views/report.pug')({
            sections: this.renderedChildren
        });
    };
    return newComp;
};

ComponentFactory.prototype.getSectionComponent = function(title) {
    let newComp = new AbstractComponent('section');
    newComp.render = function() {
        let compiledFunction = pug.compileFile('./views/section.pug');
        return compiledFunction({
            renderedChildren: this.renderedChildren,
            order: this.order,
            title: title
        });
    };
    return newComp;
};

ComponentFactory.prototype.getSectionRowComponent = function() {
    let newComp = new AbstractComponent('sectionRow');
    newComp.render = function() {
        return pug.compileFile('./views/sectionRow.pug')({
            indicators: this.renderedChildren
        });
    };
    return newComp;
};

ComponentFactory.prototype.getIndicatorNameComponent = function() {
    let newComp = new AbstractComponent('indicatorName');
    newComp.render = function() {
        return pug.compileFile('./views/indicatorName.pug')({
            values: this.renderedChildren
        });
    };
    return newComp;
};

ComponentFactory.prototype.getIndicatorValueComponent = function() {
    let newComp = new AbstractComponent('indicatorValue');
    newComp.render = function() {
        return pug.compileFile('./views/indicatorValue.pug')({
            values: this.renderedChildren
        });
    };
    return newComp;
};

ComponentFactory.prototype.getTextComponent = function(options) {
    let newComp = new AbstractComponent('text');
    newComp.render = function() {
        switch (options.style) {
            case 'plain': {
                return pug.compile('| #{text}\nbr')(options);
            }
            case 'bold': {
                return pug.compile('b= text')(options);
            }
            case 'heading': {
                return pug.compile('p: b= text')(options);
            }
            case 'multi': {
                return pug.compile('- var k = text.length-1;\np\n  each t, index in text\n    = t\n    if index<k\n      br')(options);
            }
        }
        return '';
    };
    return newComp;

};

ComponentFactory.prototype.getLinkComponent = function(link) {
    let newComp = new AbstractComponent('link');
    newComp.render = function() {
        return pug.compile('a(href=url)= text')(link);
    };
    return newComp;
};

module.exports = ComponentFactory;