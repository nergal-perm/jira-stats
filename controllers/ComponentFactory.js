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


ComponentFactory.prototype.getLinkComponent = function(link) {
    let newComp = new AbstractComponent('link');
    newComp.compiledFunction = pug.compile('a(href=url)= text');
    newComp.render = function() {
        return this.compiledFunction(link);
    };
    return newComp;
};


ComponentFactory.prototype.getIndicatorNameComponent = function() {
    let newComp = new AbstractComponent('indicatorName');
    newComp.render = function() {
        return '<td class="dense-header"></td>';
    };
    return newComp;
};

ComponentFactory.prototype.getIndicatorValueComponent = function() {
    let newComp = new AbstractComponent('indicatorValue');
    newComp.render = function() {
        return '<td class="dense-data"></td>';
    };
    return newComp;
};

module.exports = ComponentFactory;