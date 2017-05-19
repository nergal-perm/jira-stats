/**
 * Created by ETerekhov on 19.05.2017.
 */
const AbstractComponent = require('./AbstractComponent');

var ComponentFactory = function() {

};

ComponentFactory.prototype.getKvpComponent = function(placeholder) {
    var newComp = new AbstractComponent();
    newComp.placeholder = placeholder;
    newComp.children = [];
    newComp.addChild = function(child) {
        this.children.push(child);
    };
    return newComp;
};


module.exports = ComponentFactory;