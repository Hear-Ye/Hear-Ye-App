/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import Config from 'react-native-config';

function getLocalUrl() {
  const url = Config.LOCAL_API_URL
    ? Config.LOCAL_API_URL
    : 'http://localhost:8001';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export default `${__DEV__ ? getLocalUrl() : 'https://hearye.us'}/api/`;
