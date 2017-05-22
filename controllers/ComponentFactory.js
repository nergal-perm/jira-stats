/**
 * Created by ETerekhov on 19.05.2017.
 */
"use strict";
const pug = require('pug');


const AbstractComponent = require('./AbstractComponent');

let ComponentFactory = function() {

};

ComponentFactory.prototype.getKvpComponent = function(placeholder) {
    let newComp = new AbstractComponent();
    newComp.placeholder = placeholder;
    newComp.render = function() {
        return this.placeholder;
    };
    return newComp;
};

ComponentFactory.prototype.getLinkComponent = function(link) {
    let newComp = new AbstractComponent();
    newComp.compiledFunction = pug.compile('a(href=url)= text');
    newComp.render = function() {
        return this.compiledFunction(link);
    };
    return newComp;
};

ComponentFactory.prototype.getTableRowComponent = function() {
    let newComp = new AbstractComponent();
    newComp.render = function() {
        return pug.compileFile('./views/tableRow.pug')();
    };
    return newComp;
};

ComponentFactory.prototype.getSectionComponent = function(order, title, style) {
    let newComp = new AbstractComponent();
    newComp.render = function() {
        let compiledFunction = pug.compileFile('./views/section.pug');
        return compiledFunction({
            renderedChildren: this.renderedChildren,
            order: order,
            title: title,
            style: style
        });
    };
    return newComp;
};

module.exports = ComponentFactory;