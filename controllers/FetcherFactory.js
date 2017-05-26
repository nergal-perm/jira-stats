"use strict";

const AbstractFetcher = require('./AbstractFetcher.js');

let FetcherFactory = function() { };

FetcherFactory.prototype.getSimpleIssueFetcher = function(fetcherName, replacementMap) {
	let newFetcher = new AbstractFetcher(fetcherName, replacementMap);

	newFetcher.process = function(data, tempResult) {
		tempResult.push(data);
	};

	return newFetcher;
};

module.exports = FetcherFactory;