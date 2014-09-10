/**
* Handle network autoconnections
*/
define(function(require, exports, module) {
	var util = require('app/util');
	var config = require('app/config');
	var mapNoty;
	var netwatch = {};
	_.extend(netwatch, Backbone.Events);

	netwatch.on('online2offline', function(){
		mapNoty = noty({text: '无网络服务.',
							layout: 'center',
							timeout: 2000,
							type: 'information'});
	});

	netwatch.on('offline2online', function(){
		mapNoty.close();
		mapNoty = null;
	});

	// start agent
	function _start(){
		var hasNetwork;
		setInterval(function(){
			util.getNetwork().then(function(networkType){
				if(typeof(hasNetwork) == 'undefined'){
					hasNetwork = true;
				}else if(!hasNetwork){
					netwatch.trigger('offline2online');
					hasNetwork = true;
				}
			}, function(err){
				if(typeof(hasNetwork) == 'undefined'){
					hasNetwork = false;
				}else if(hasNetwork){
					netwatch.trigger('online2offline');
					hasNetwork = false;
				}
			});
		},3000);
	}

	return {
		start: _start
	}
})