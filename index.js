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
import SelectDistrict from './src/Landing/SelectDistrict';
import {loginNavigationRoot, dashboardNavigationRoot} from './src/utils';
import Dashboard from './src/Dashboard';
import {SummaryScreen} from './src/Dashboard/Summary';
import RepresentativeScreen from './src/Dashboard/Representative';
import {Authenticate, userStillNeeds} from './src/api/components/auth';
import PersonalDetailScreen from './src/Personal';
import SettingsScreen from './src/Personal/Settings';

for (const [_component_id, _component] of [
  ['LandingScreen', LandingScreen],
  ['Dashboard', Dashboard],
  ['SummaryScreen', SummaryScreen],
  ['SELECT_DISTRICT_MODAL', SelectDistrict],
  ['RepresentativeScreen', RepresentativeScreen],
  ['PersonalDetailScreen', PersonalDetailScreen],
  ['SettingsScreen', SettingsScreen],
]) {
  Navigation.registerComponent(_component_id, () => _component);
}

Navigation.events().registerAppLaunchedListener(async () => {
  const data = await Authenticate(true);
  await Navigation.setRoot(
    data ? dashboardNavigationRoot : loginNavigationRoot,
  );
  const stillNeeds = userStillNeeds(data);
  if (typeof stillNeeds === 'boolean') {
    return;
  }
  if (stillNeeds.includes(1)) {
    await Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'SELECT_DISTRICT_MODAL',
              options: {
                topBar: {
                  title: {
                    text: 'Select your current district',
                  },
                },
                hardwareBackButton: {
                  dismissModalOnPress: false,
                },
                modal: {
                  swipeToDismiss: false,
                },
              },
            },
          },
        ],
      },
    });
  }
});
