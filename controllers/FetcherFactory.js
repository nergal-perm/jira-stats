"use strict";

const AbstractFetcher = require('./AbstractFetcher.js');

let FetcherFactory = function() { };

FetcherFactory.prototype.getSimpleFetcher = function(fetcherName) {
	let newFetcher = new AbstractFetcher(fetcherName);

	newFetcher.process = function(data, tempResult) {
		data.forEach(function(item) {
			if (item.id == 1) {
				item.customField = 'Добавили при обработке';
			}
			tempResult.push(item);
		});
	};

	return newFetcher;
};

module.exports = FetcherFactory;