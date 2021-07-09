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
          },
        },
      ],
    },
  },
};

const dashboardNavigationRoot = {
  root: {
    stack: {
      children: [
        {
          component: {
            name: 'Dashboard',
          },
        },
      ],
    },
  },
};

export {loginNavigationRoot, dashboardNavigationRoot};
