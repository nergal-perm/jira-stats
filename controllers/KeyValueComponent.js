/**
 * Created by ETerekhov on 19.05.2017.
 */
'use strict';
const pug = require('pug');


function KeyValueComponent(placeholder, kvp, children) {
    this._template = './views/keyValue.pug';
    this._placeholder = placeholder;
    this._kvp = kvp;
    this._children = children;
}

KeyValueComponent.prototype.getChildren = function() {
    return this._children;
};

KeyValueComponent.prototype.renderComponent = function() {
    if (this._children && this._children.length > 0) {
        this._children.each(function(item, index, array) {
            array[index] = item.renderComponent();
        });
    }
    return this.render();
};

KeyValueComponent.prototype.render = function() {
    var compiledFunction = pug.compileFile(this._template, null);
    return {
        key: this._placeholder,
        value: compiledFunction({kvp: this._kvp})
    };
};

module.exports = KeyValueComponent;