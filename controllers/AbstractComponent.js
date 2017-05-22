/**
 * Created by ETerekhov on 19.05.2017.
 */
'use strict';
const async = require('async');

let AbstractComponent = function(type) {
    this.order = 1;
    this.type = type;
    this.children = [];
    this.fetcher = undefined;
};

AbstractComponent.prototype.render = function() {
    let _this = this;
    let result = undefined;
    async.parallel([
        function(callback) {
            if (_this.fetcher) {
                _this.fetcher.fetchData(callback);
            } else {
                callback(null, {});
            }
        },
        function(callback) {
            let renderedChildren = _this.children.map(function(item) {
                return item.render();
            });
            callback(null, renderedChildren);
        }
    ],
    function(err, results) {
        if(err) throw err;
        result = _this.renderComponent(results);
    });
    return result;
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

function pushNewChild(parent, child) {
    child.order = parent.children.length + 1;
    parent.children.push(child);
}

module.exports = AbstractComponent;