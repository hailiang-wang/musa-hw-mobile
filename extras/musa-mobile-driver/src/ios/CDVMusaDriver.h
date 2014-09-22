//
//
//

#import <Cordova/CDVPlugin.h>

@interface CDVMusaDriver : CDVPlugin

- (void) setCookieByDomain: (CDVInvokedUrlCommand *)command;
- (void) removeCookieByDomain: (CDVInvokedUrlCommand *)command;

@end
