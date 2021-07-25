/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

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
                  },
                },
              },
            ],
            options: {
              bottomTab: {
                text: 'Home',
                // icon: require('../images/home.png'),
                testID: 'HOME_TAB_BAR_BUTTON',
              },
            },
          },
        },
      ],
    },
  },
};

export {loginNavigationRoot, dashboardNavigationRoot};
