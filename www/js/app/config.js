define(['jquery'], function($) {
    var configJson = {};
    var configSessionKey = 'snowball-config';
    var configSessionValue = window.sessionStorage.getItem(configSessionKey);

    if (configSessionValue) {
        configJson = JSON.parse(configSessionValue);
    } else {
        // everytime require(config) from config.xml, it takes 0.017 second, a bit slow.
        // also export the config into session storage for speed up access
        // config parameters
        $.ajax({
            type: 'GET',
            url: 'config.xml',
            async: false,
            success: function(data) {
                var xmlDoc = $.parseXML(data);
                var $xml = $(xmlDoc);
                $xml.find('mobay').each(function(index) {
                    var v = {};
                    $.each(this.attributes, function(i, attrib) {
                        switch (attrib.name) {
                            case 'name':
                                v['name'] = attrib.value;
                                break;
                            case 'value':
                                v['value'] = attrib.value;
                                break;
                            default:
                                break;
                        }
                    });
                    configJson[v.name] = v.value;
                });
            },
            error: function(xhr, statusCode, errorThrown) {
                console.error(errorThrown);
            }
        });
        window.sessionStorage.setItem(configSessionKey, JSON.stringify(configJson));
    }

    return configJson;
})