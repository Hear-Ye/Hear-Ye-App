/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

import {Colors} from '../index';

const loginNavigationRoot = {
  root: {
    stack: {
      children: [
        {
          component: {
            name: 'LandingScreen',
            options: {
              topBar: {
                visible: false,
                drawBehind: true,
                animate: false,
                height: 0,
              },
            },
          },
        },
      ],
    },
  },
};

const dashboardNavigationRoot = {
  root: {
    bottomTabs: {
      children: [
        {
          stack: {
            id: 'DashboardStack',
            children: [
              {
                component: {
                  name: 'Dashboard',
                  options: {
                    topBar: {
                      visible: false,
                      drawBehind: true,
                      animate: false,
                      height: 0,
                    },
                    backButton: {
                      title: 'Dashboard',
                      displayMode: 'minimal',
                    },
                  },
                },
              },
            ],
            options: {
              bottomTab: {
                text: 'Home',
                icon: require('../images/home/home.png'),
                iconColor: {dark: Colors.white, light: Colors.dark},
                textColor: {dark: Colors.white, light: Colors.dark},
                selectedIconColor: Colors.cupertinoBlue,
                selectedTextColor: Colors.cupertinoBlue,
                testID: 'HOME_TAB_BAR_BUTTON',
              },
            },
          },
        },
        {
          stack: {
            id: 'PersonalDetailStack',
            children: [
              {
                component: {
                  name: 'PersonalDetailScreen',
                  options: {
                    topBar: {
                      visible: false,
                      drawBehind: true,
                      animate: false,
                      height: 0,
                    },
                    backButton: {
                      title: 'Me',
                      displayMode: 'minimal',
                    },
                  },
                },
              },
            ],
            options: {
              bottomTab: {
                text: 'Me',
                icon: require('../images/person/person.png'),
                iconColor: {dark: Colors.white, light: Colors.dark},
                textColor: {dark: Colors.white, light: Colors.dark},
                selectedIconColor: Colors.cupertinoBlue,
                selectedTextColor: Colors.cupertinoBlue,
                testID: 'PERSONAL_TAB_BAR_BUTTON',
              },
            },
          },
        },
      ],
    },
  },
};

export {loginNavigationRoot, dashboardNavigationRoot};
