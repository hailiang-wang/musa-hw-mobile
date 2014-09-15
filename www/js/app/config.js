define({
    host: "hwcafe.mybluemix.net",
    path: '/mobile/auth/linkedin',
    pushAppId : 'a87432fd-2d2e-43d4-91c9-0832af4d4aec',
    pushAppRoute: 'hwcafe.mybluemix.net',
    pushAppSecret : '049180170bdc55b6428f65f96f80518b37296000',
    debug: true,
    weinre: 'http://192.168.9.232:9088/target/target-script-min.js#musa',
    myPremise:'HelloWorldCafe',
    premises : {
    	HelloWorldCafe: {
    		mapbox: {
                id:'hain.ja31ci75',
                accessToken:'pk.eyJ1IjoiaGFpbiIsImEiOiJFQUVqelIwIn0.397XBIShpknPNDl6e95mow'
            },
            /* 
             * the polygon coords must be in correct order!
             * WS, WN, NE, SE
             * https://github.com/Samurais/Geolib
             */
            polygon : [
                {latitude: 40.044733, longitude: 116.295072},
                {latitude: 40.044871, longitude: 116.295027},
                {latitude: 40.044912, longitude: 116.295292},
                {latitude: 40.044774, longitude: 116.295338}
            ],
            circle: {
                center: {latitude: 40.04359197610995, longitude: 116.2894301339035},
                radius : 50        
            }
        },
        CheKuCafe : {
            mapbox:{
    			id:'hain.ja31ci75',
    			accessToken:'pk.eyJ1IjoiaGFpbiIsImEiOiJFQUVqelIwIn0.397XBIShpknPNDl6e95mow'
            },
            polygon:[
                // a big rectangle, the length is almost four hunderand meters  
                {latitude: 39.981, longitude: 116.290},
                {latitude: 39.983, longitude: 116.290},
                {latitude: 39.983, longitude: 116.310},
                {latitude: 39.981, longitude: 116.310}
            ]
        }
    } 
});