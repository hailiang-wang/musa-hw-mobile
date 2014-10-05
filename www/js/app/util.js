define(function(require, exports, module) {
    /* format string value with arguments */
    String.prototype.format = String.prototype.f = function() {
        var s = this,
            i = arguments.length;

        while (i--) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
        }
        return s;
    };

    /* if a string ends with a given suffix */
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    /* if a string starts with a given prefix */
    String.prototype.startsWith = function (str){
        return this.indexOf(str) == 0;
    };

    var config = require('app/config');

    /**
    * @function check Network Connections, only support ETHERNET,WIFI, CELL 3|4 G
    */
    function _getNetwork(){
        var defer = Q.defer();
        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';

        // https://github.com/apache/cordova-plugin-network-information/blob/master/doc/index.md
        // iOS Quirks to support iPhone 5S, 
        // iOS does not have specific info like WIFI, 3G ... just cellular or not
        if(device.platform == 'iOS'){
            if($.inArray(navigator.connection.type, 
                         [Connection.CELL,Connection.WIFI]) !== -1){
                defer.resolve(navigator.connection.type);
            }else{
                defer.reject("unknown");
            }
        }else if (device.platform == 'Android'){
            // check for android
            var androidServeNetwork = [Connection.WIFI,
                                Connection.CELL_3G,
                                Connection.CELL_4G];
            if($.inArray(navigator.connection.type, androidServeNetwork) !== -1){
                defer.resolve(navigator.connection.type);
            }else{
                defer.reject("unknown");
            }
        }else{
            defer.reject({error: "unsupported platform"});
        }
        return defer.promise;
    }

    function _getDate(dateString){
        if(!dateString){
            var curr = new Date();
            var yyyy = curr.getFullYear();
            var mm = curr.getMonth()+1; //January is 0!
            var dd = curr.getDate();
            var hh = curr.getHours();
            var min = curr.getMinutes();
            var sec = curr.getSeconds();

            if(mm<10){
                mm='0'+mm
            } 
            if(dd<10){
                dd='0'+dd
            } 
            if(hh<10){
                hh ='0'+hh
            } 
            if(min<10){
                min='0'+min
            } 
            if(sec<10){
                sec='0'+sec
            } 
            return yyyy+'/'+ mm + '/' + dd + ' ' + min + ':' + sec;
        }else{
            var date = new Date(dateString);
            var yyyy = date.getFullYear();
            var mm = date.getMonth()+1; //January is 0!
            var dd = date.getDate();
            var hh = date.getHours();
            var min = date.getMinutes();

            if(mm<10){
                mm='0'+mm
            } 
            if(dd<10){
                dd='0'+dd
            } 
            if(hh<10){
                hh ='0'+hh
            } 
            if(min<10){
                min='0'+min
            } 
            return '{0}/{1}/{2} {3}:{4}'.f(yyyy, mm, dd, hh, min);
        }
    }

    function _getNotification(){
        var deferred = $.Deferred();
        $.ajax({
            type: 'get',
            url: 'http://{0}/user/notifications'.f(config.host),
            headers: {accept: 'application/json'},
            success: function(data){
                deferred.resolve(data);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                deferred.reject({status:3, error: errorThrown});
            }
        });
        return deferred.promise();
    }

    function _trimByPixel(str, width) {
        var spn = $('<span style="visibility:hidden"></span>').text(str).appendTo('body');
        var txt = str;
        if(spn.width() > width){
            while (spn.width() > width) { txt = txt.slice(0, -1); spn.text(txt + "..."); }
            txt = txt + '...'
        }
        spn.remove();
        return txt;
    }

    function _getHomeSwiperPage(){
        if($('#map').is(':visible')){
            return 1;
        }else if($('#people').is(':visible')){
            return 2;
        }else {
            return 0;
        }
    }

    return { 
        getDate : _getDate,
        getNetwork : _getNetwork,
        getNotification : _getNotification,
        trimByPixel: _trimByPixel,
        getHomeSwiperPage: _getHomeSwiperPage
    };
})
