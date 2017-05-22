/**
 * Created by ETerekhov on 19.05.2017.
 */
let AbstractComponent = function(type) {
    this.order = 1;
    this.type = type;
    this.children = [];
};

AbstractComponent.prototype.renderComponent = function() {
    this.renderedChildren = this.children.map(function(item) {
       return item.renderComponent();
    });
    return this.render();
};

AbstractComponent.prototype.addChild = function(child) {
    "use strict";
    switch(this.type) {
        case 'report': {
            if(child.type === 'section') { pushNewChild(this, child); }
            break;
        }
        case 'section': {
            if(child.type === 'sectionRow') { pushNewChild(this, child);  }
            break;
        }
        case 'sectionRow': {
            let childCountIsEven = (this.children.length % 2 === 0);
            if(childCountIsEven && child.type === 'indicatorName') {
                pushNewChild(this, child);
            } else if (!childCountIsEven && child.type === 'indicatorValue') {
                pushNewChild(this, child);
            }
            break;
        }
        default: {
            pushNewChild(this, child);
            return this;
        }
    }
    return this;
};

function pushNewChild(parent, child) {
    "use strict";
    child.order = parent.children.length + 1;
    parent.children.push(child);
}

module.exports = AbstractComponent;