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

    NSString *appUrls = [command.arguments objectAtIndex:0];
    NSString *appCookie = [command.arguments objectAtIndex:1];

    // check appUrl and appCookie are not nil
    if ([appUrls isEqual: [NSNull null]] ){
        NSLog(@"fail setting cookie, the appUrls value is nil.");
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }else if ([appCookie isEqual: [NSNull null]]) {
        NSLog(@"fail setting cookie, the cookie value is nil.");
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }else{
        NSArray *items = [appUrls componentsSeparatedByString:@","];
        for (id appUrl in items) {
            NSLog(@"set cookie for %@", appUrl);
            // init cookie container
            NSMutableDictionary *cookieDict = [NSMutableDictionary dictionary];
            // get domain
            NSURL *url = [NSURL URLWithString:[appUrl stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
            NSString *domain = [url host];
            // this cookie is not expected, valid cookie must start with musa.cafe.sid
            [cookieDict setObject:@"musa.cafe.sid" forKey:NSHTTPCookieName];
            [cookieDict setObject:appCookie forKey:NSHTTPCookieValue];
            [cookieDict setObject:domain forKey:NSHTTPCookieDomain];
            [cookieDict setObject:@"/" forKey:NSHTTPCookiePath];
            [cookieDict setObject:@"0" forKey:NSHTTPCookieVersion];
            NSHTTPCookie *cookie = [NSHTTPCookie cookieWithProperties:cookieDict];
            [cookieStorage setCookie:cookie];
        }

        NSLog(@"end cookie setting.");

        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"succeed"];
    }
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) removeCookieByDomain: (CDVInvokedUrlCommand *)command
{
    NSLog(@"invoke removeCookieByDomain");
    CDVPluginResult * result = nil;
    NSString *appUrls = [command.arguments objectAtIndex:0];
    if ([appUrls isEqual: [NSNull null]] ){
        NSLog(@"fail removing cookie, the appUrls value is nil.");
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }else{
        NSArray *items = [appUrls componentsSeparatedByString:@","];
        for (id appUrl in items) {
            NSLog(@"remove cookie for %@", appUrl);
            NSURL *url = [NSURL URLWithString:[appUrl stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
            NSString *domain = [url host];
            NSHTTPCookieStorage * sharedCookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
            NSArray * cookies = [sharedCookieStorage cookies];
            for (NSHTTPCookie * cookie in cookies){
                if ([cookie.domain rangeOfString:domain].location != NSNotFound){
                    NSLog(@"delete cookie of domain %@", domain);
                    [sharedCookieStorage deleteCookie:cookie];
                }
            }
        }
        NSLog(@"cooke is removed for logout event.");
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"succeed"];
    }
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

@end
