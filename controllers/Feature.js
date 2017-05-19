function Feature(id) {
	this._id = id;
}

Feature.prototype.getId = function() {
	return this._id;
};

module.exports = Feature;