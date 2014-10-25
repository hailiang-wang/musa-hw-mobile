/**
 * Handle network autoconnections
 */
define(function(require, exports, module) {
	var util = require('app/util');
	var config = require('app/config');
	var map = require('app/service/map');
	var netwatch = {};
	_.extend(netwatch, Backbone.Events);

	var netNoty;

	netwatch.on('online2offline', function() {
		// turn on network unavailable warnning
		netNoty = noty({
			text: '无网络服务.',
			layout: 'center',
			timeout: 2000,
			type: 'information'
		});
	});

	netwatch.on('offline2online', function() {
		// turn off network unavailable warnning
		if (netNoty) {
			netNoty.close();
			netNoty = null;
		}
		// recreate map
		map.createMap();
	});

	// start agent
	function _start() {
		var hasNetwork;
		setInterval(function() {
			util.getNetwork().then(function(networkType) {
				if (typeof(hasNetwork) == 'undefined') {
					hasNetwork = true;
				} else if (!hasNetwork) {
					netwatch.trigger('offline2online');
					hasNetwork = true;
				}
			}, function(err) {
				if (typeof(hasNetwork) == 'undefined') {
					hasNetwork = false;
				} else if (hasNetwork) {
					netwatch.trigger('online2offline');
					hasNetwork = false;
				}
			});
		}, 3000);
	}

	return {
		start: _start
	}
})