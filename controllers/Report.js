function Report(reportType) {
	this._reportType = reportType;
}

Report.prototype.getType = function() {
	return this._reportType;
};

module.exports = Report;