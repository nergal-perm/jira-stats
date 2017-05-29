"use strict";

const AbstractFetcher = require('./AbstractFetcher.js');

let FetcherFactory = function() { };

FetcherFactory.prototype.getIssueDataFetcher = function(fetcherName, replacementMap) {
	let newFetcher = new AbstractFetcher(fetcherName, replacementMap);

	newFetcher.process = function(data, temp) {
	    if (Array.isArray(data)) {
		    data.forEach(function(item) {
		        temp.push(item);
            })
		} else {
            temp.push(data);
		}
	};

	return newFetcher;
};

FetcherFactory.prototype.getIssueCountFetcher = function(fetcherName, replacementMap) {
    let newFetcher = new AbstractFetcher(fetcherName, replacementMap);

    newFetcher.process = function(data, temp) {
    	temp.push(data[0]);
    };

    return newFetcher;
};

module.exports = FetcherFactory;