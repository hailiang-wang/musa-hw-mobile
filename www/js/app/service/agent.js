/**
* Handle network autoconnections
*/
define(function(require, exports, module) {
	var util = require('app/util');
	var config = require('app/config');
	var mapNoty;

	// start agent
	function _start(){
		console.log('AGENT IS STARTED.')
		setInterval(function(){
			util.getNetwork().then(function(networkType){
				// show the warnning 
				if(mapNoty){
					mapNoty.close();
					mapNoty = null;
				}
			}, function(err){
				if(!mapNoty){
					mapNoty = noty({text: '无网络服务.',
									layout: 'center',
									timeout: 2000,
									type: 'information'});
				}
			});
		},5000);
	}

	return {
		start: _start
	}
})