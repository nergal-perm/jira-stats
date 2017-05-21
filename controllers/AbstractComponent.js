/**
 * Created by ETerekhov on 19.05.2017.
 */
let AbstractComponent = function() {
    this.children = [];
};

AbstractComponent.prototype.renderComponent = function() {
    let renderedChildren = this.children.map(function(item) {
       return item.renderComponent();
    });
    return [].concat(this.render()).concat(renderedChildren).join('\n').trim();
};

AbstractComponent.prototype.addChild = function(child) {
    "use strict";
    this.children.push(child);
};

module.exports = AbstractComponent;