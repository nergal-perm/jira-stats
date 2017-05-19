/**
 * Created by ETerekhov on 19.05.2017.
 */
var AbstractComponent = function() {

};

AbstractComponent.prototype.renderComponent = function() {
    var renderedChildren = this.children.map(function(item) {
       return item.renderComponent();
    });
    return [].concat(this.render()).concat(renderedChildren).join('\n').trim();
};

AbstractComponent.prototype.render = function() {
    // Пока это фейковая реализация
    return this.placeholder;
};

module.exports = AbstractComponent;