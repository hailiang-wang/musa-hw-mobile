define(function(require, exports, module) {

	function _start(){
		var source	= new EventSource('http://hwcafe.mybluemix.net/sse/out/activity');
		source.addEventListener('message', function(e) {
			console.log(e);
		}, false);
	}

	exports.start = _start;
	
});