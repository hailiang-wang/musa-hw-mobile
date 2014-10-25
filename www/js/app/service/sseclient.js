define(function(require, exports, module) {
	var config = require('app/config');
	var mapController = require('app/service/map');

	function _start() {
		console.log('listen sse stream : http://{0}/sse/out/activity'.f(config.ssehost));
		var source = new EventSource('http://{0}/sse/out/activity'.f(config.ssehost));
		source.addEventListener('message', function(e) {
			console.log(e);
			mapController.surveyor.trigger('paint', JSON.parse(e.data));
		}, false);
	}

	exports.start = _start;

});