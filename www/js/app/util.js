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

    return { 
        getDate : function(){
            var curr = new Date();
            var dd = curr.getDate();
            var mm = curr.getMonth()+1; //January is 0!
            var min = curr.getMinutes();
            var sec = curr.getSeconds();

            var yyyy = curr.getFullYear();
            if(dd<10){
                dd='0'+dd
            } 
            if(mm<10){
                mm='0'+mm
            } 
            if(min<10){
                min='0'+min
            } 
            if(sec<10){
                sec='0'+sec
            } 
            return yyyy+'/'+ mm + '/' + dd + ' ' + min + ':' + sec;
        }
    };
})
