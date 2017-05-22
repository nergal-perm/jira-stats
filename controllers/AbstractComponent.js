/**
 * Created by ETerekhov on 19.05.2017.
 */
let AbstractComponent = function() {
    this.children = [];
};

AbstractComponent.prototype.renderComponent = function() {
    this.renderedChildren = this.children.map(function(item) {
       return item.renderComponent();
    });
    // Фейковая реализация
    return this.render();
};

AbstractComponent.prototype.addChild = function(child) {
    "use strict";
    this.children.push(child);
};

module.exports = AbstractComponent;