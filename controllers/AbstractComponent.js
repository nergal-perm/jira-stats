/**
 * Created by ETerekhov on 19.05.2017.
 */
'use strict';

let AbstractComponent = function(type) {
    this.order = 1;
    this.type = type;
    this.children = [];
    this.fetcher = undefined;
};

AbstractComponent.prototype.renderComponent = function() {
    this.renderedChildren = this.children.map(function(item) {
       return item.renderComponent();
    });
    return this.fetcher ? this.fetchAndRender(this.render) : this.render();
};

AbstractComponent.prototype.addChild = function(child) {
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
            let childCount = this.children.length;
            if(childCount === 0 && child.type === 'indicatorName') {
                pushNewChild(this, child);
            } else if (childCount === 1 && child.type === 'indicatorValue') {
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

AbstractComponent.prototype.addFetcher = function(fetcher) {
    this.fetcher = fetcher;
};

AbstractComponent.prototype.fetchAndRender = function(renderCallback) {
    this.fetcher.fetchData(renderCallback);
};

function pushNewChild(parent, child) {
    child.order = parent.children.length + 1;
    parent.children.push(child);
}

module.exports = AbstractComponent;