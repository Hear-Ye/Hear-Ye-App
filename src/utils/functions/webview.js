/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';
import {Linking} from 'react-native';

/**
 * Global function for react-native-webview on-link press handling
 * @param navState {Object}
 * @param navState.url {(String|null)}
 * @param navState.title {(String|null)}
 * @param navState.loading {(Boolean|null)}
 * @param navState.canGoBack {(Boolean|null)}
 * @param navState.canGoForward {(Boolean|null)}
 */
function handleWebViewStateChange(navState) {
  const {url} = navState;
  if (!url) {
    return;
  }
  if (url.indexOf('https://') === 0 || url.indexOf('http://') === 0) {
    Linking.openURL(url);
  }
}

export {handleWebViewStateChange};
