#import <React/RCTBridgeDelegate.h>
#import "RNAppAuthAuthorizationFlowManager.h"
#import <UIKit/UIKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, RNAppAuthAuthorizationFlowManager>

@property(nonatomic, weak)id<RNAppAuthAuthorizationFlowManagerDelegate>authorizationFlowManagerDelegate;
@property (nonatomic, strong) UIWindow *window;

@end
