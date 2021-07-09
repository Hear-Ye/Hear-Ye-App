/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';
import React from 'react';
import {SafeAreaView, useColorScheme} from 'react-native';

import {Colors} from './utils';

/**
 * Constructs the (user-logged-in) Dashboard screen
 * @return {JSX.Element}
 */
const Dashboard = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return <SafeAreaView style={backgroundStyle} />;
};

export default Dashboard;
