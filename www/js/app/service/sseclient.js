define(function(require, exports, module) {
	var config = require('app/config');

	function _start(){
		console.log('listen sse stream : http://{0}/sse/out/activity'.f(config.host));
		var source	= new EventSource('http://{0}/sse/out/activity'.f(config.host));
		source.addEventListener('message', function(e) {
			console.log(e);
		}, false);
	}

	exports.start = _start;
	
});