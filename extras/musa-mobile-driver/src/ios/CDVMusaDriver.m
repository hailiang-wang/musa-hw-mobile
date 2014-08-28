//
//
//

#import "CDVMusaDriver.h"

@implementation CDVMusaDriver

- (void) setCookieByDomain: (CDVInvokedUrlCommand *)command
{
    NSLog(@"invoke setCookieByDomain");
    CDVPluginResult * result = nil;
    // set cookie storage
    NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage
                                          sharedHTTPCookieStorage];
    [cookieStorage setCookieAcceptPolicy:NSHTTPCookieAcceptPolicyAlways];

    NSString *appUrl = [command.arguments objectAtIndex:0];
    NSString *appCookie = [command.arguments objectAtIndex:1];
    // check appUrl and appCookie are not nil
    if ([appUrl isEqual: [NSNull null]] ){
        NSLog(@"fail setting cookie, the appUrl value is nil.");
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }else if ([appCookie isEqual: [NSNull null]]) {
        NSLog(@"fail setting cookie, the cookie value is nil.");
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }else{
        NSLog([NSString stringWithFormat:@"set cookie - %@ for appUrl %@", appCookie, appUrl]);
        // init cookie container
        NSMutableDictionary *cookieDict = [NSMutableDictionary dictionary];
        // get domain
        NSURL *url = [NSURL URLWithString:[appUrl stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
        NSString *domain = [url host];
            NSRange range = [appCookie rangeOfString:@"musa.cafe.sid="];
            if (range.location != NSNotFound){
                // this cookie is not expected, valid cookie must start with musa.cafe.sid
                NSString *cookieValue = [appCookie substringFromIndex:(range.location + range.length)];
                // set cookie
                [cookieDict setObject:@"musa.cafe.sid" forKey:NSHTTPCookieName];
                [cookieDict setObject:cookieValue forKey:NSHTTPCookieValue];
                [cookieDict setObject:domain forKey:NSHTTPCookieDomain];
                [cookieDict setObject:@"/" forKey:NSHTTPCookiePath];
                [cookieDict setObject:@"0" forKey:NSHTTPCookieVersion];
                NSHTTPCookie *cookie = [NSHTTPCookie cookieWithProperties:cookieDict];
                [cookieStorage setCookie:cookie];
                NSLog(@"end cookie setting.");
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"succeed"];
            }else{
                NSLog(@"fail setting cookie: invalid appCookie value.");
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
            }
    }
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}
@end