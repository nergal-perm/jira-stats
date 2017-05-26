"use strict";

const AbstractFetcher = require('./AbstractFetcher.js');

let FetcherFactory = function() { };

FetcherFactory.prototype.getSimpleIssueFetcher = function(fetcherName, type, replacementMap) {
	let newFetcher = new AbstractFetcher(fetcherName, type, replacementMap);

	newFetcher.process = function(data, tempResult) {
		tempResult.push(data);
	};

	return newFetcher;
};

module.exports = FetcherFactory;