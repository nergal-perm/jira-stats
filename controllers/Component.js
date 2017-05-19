/**
 * Created by ETerekhov on 19.05.2017.
 */
'use strict';

function Component(template, children) {
    this._template = template;
    this._children = children;
}

Component.prototype.getChildren = function() {
    return this._children;
};
Component.prototype.renderComponent = function() {

};
Component.prototype.getTemplate = function() {
    return this._template;
};

module.exports = Component;