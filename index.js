/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';
import {Navigation} from 'react-native-navigation';

import './src/globals.js';
import {LandingScreen} from './src/Landing';
import {loginNavigationRoot, dashboardNavigationRoot} from './src/utils';
import Dashboard from './src/Dashboard';
import {AnalyticsScreen, SummaryScreen} from './src/Dashboard/Summary';
import {Authenticate} from './src/api/components/auth';

for (const [_component_id, _component] of [
  ['LandingScreen', LandingScreen],
  ['Dashboard', Dashboard],
  ['AnalyticsScreen', AnalyticsScreen],
  ['SummaryScreen', SummaryScreen],
]) {
  Navigation.registerComponent(_component_id, () => _component);
}

Navigation.events().registerAppLaunchedListener(async () => {
  Navigation.setRoot(
    (await Authenticate()) ? dashboardNavigationRoot : loginNavigationRoot,
  );
});
