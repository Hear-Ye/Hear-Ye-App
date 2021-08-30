/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';
import {Alert} from 'react-native';
import * as Keychain from 'react-native-keychain';
import {Navigation} from 'react-native-navigation';
import Config from 'react-native-config';
import {revoke} from 'react-native-app-auth';

import {loginNavigationRoot, Storage} from '../../utils';

const ACCESS_TOKEN_KEY = 'access-token',
  TOKEN_SERVICE = 'us.hearye.voting';
export const SETTINGS_KEY_PREFIX = 'user-settings-',
  CURRENT_USER_ID_KEY = 'current-user-id';

/**
 * Gets the specified token value
 * @param token_type {('access'|'refresh'|'velnota_access'|'velnota_refresh')}
 */
export const getToken = async token_type => {
  switch (token_type) {
    case 'access':
      return await Storage.getString(ACCESS_TOKEN_KEY);
    case 'refresh':
    case 'velnota_access':
    case 'velnota_refresh':
      return (
        await Keychain.getGenericPassword({
          service: TOKEN_SERVICE + token_type,
        })
      ).password;
    default:
      throw Error('Invalid token type');
  }
};

/**
 * Sets the specified token value
 * @param token_type {('access'|'refresh'|'velnota_access'|'velnota_refresh')}
 * @param token_value {String}
 */
export const setToken = async (token_type, token_value) => {
  switch (token_type) {
    case 'access':
      await Storage.set(ACCESS_TOKEN_KEY, token_value);
      break;
    case 'refresh':
    case 'velnota_access':
    case 'velnota_refresh':
      await Keychain.setGenericPassword(token_type, token_value, {
        service: TOKEN_SERVICE + token_type,
      });
      break;
  }
};

/**
 * Refreshes the access token
 * @return {Promise<boolean>} whether the refresh was successful
 */
const RefreshToken = async () => {
  try {
    const response = await request('users/v1/token/refresh/', 'POST', {
      body: {refresh: await getToken('refresh')},
      authenticated: false,
    });
    await setToken('refresh', (await response.json()).refresh);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Obtains both access and refresh tokens
 * @return {Promise<boolean|Object>} whether obtaining the auth tokens was
 * successful. If no data, then returns a boolean. If there is data, it returns
 * an Object.
 */
export const Authenticate = async (force_obtain_both = false) => {
  const _refreshed = await RefreshToken();
  if (!_refreshed || force_obtain_both) {
    try {
      const response = await request('users/v1/token/obtain/', 'POST', {
        authenticated: false,
        body: {
          access_token: await getToken('velnota_access'),
          refresh_token: await getToken('velnota_refresh'),
        },
      });
      const data = await response.json();
      await setToken('access', data.access_token);
      await setToken('refresh', data.refresh_token);
      if (!(await Storage.getObject(SETTINGS_KEY_PREFIX + data.id))) {
        await Storage.set(SETTINGS_KEY_PREFIX + data.id, {});
      }
      await Storage.set(CURRENT_USER_ID_KEY, data.id);
      return data;
    } catch (e) {
      return false;
    }
  }
  return true;
};

/**
 * Verification method to check if current authenticated user needs to do
 * any additional tasks (such as agreeing to new terms of service).
 * @param data {(Object|boolean)} returned data from `Authenticate` call above
 * @returns {(Array<number>|boolean)} Returns an array of integers that
 * represent tasks that the current user needs to perform as a method
 * of collecting or performing tasks.
 *
 * Returns a boolean if param data is also type boolean.
 *
 * 1: Needs to set their district
 */
export const userStillNeeds = data => {
  if (typeof data === 'boolean') {
    return data;
  }
  const needToDo = [];
  if (data.hasOwnProperty('district') && !data.district) {
    needToDo.push(1);
  }
  return needToDo;
};

export const Logout = async () => {
  try {
    await revoke(socialConfigs.velnota, {
      tokenToRevoke: await getToken('velnota_refresh'),
      includeBasicAuth: false,
      sendClientId: true,
    });
    await Storage.delete(ACCESS_TOKEN_KEY);
    await Keychain.resetGenericPassword({service: TOKEN_SERVICE});
    await Navigation.setRoot(loginNavigationRoot);
    return true;
  } catch (e) {
    Alert.alert(
      "Uh oh, something happened. Try again later (check if you're " +
        'using the latest version of the app).',
    );
    return false;
  }
};

export const DeleteLoggedInAccount = async () => {
  const accessToken = await getToken('access');
  if (await Logout()) {
    try {
      await request('users/delete-account/', 'POST', {
        headers: {Authorization: `Bearer ${accessToken}`},
        authenticated: false,
      });
    } catch (e) {
      Alert.alert('Uh oh, something wrong happened. Try again.');
      console.error(e);
    }
  }
};

export const velnotaUrl = Config.VELNOTA_ISSUER_URL;
export const socialConfigs = {
  velnota: {
    issuer: velnotaUrl,
    clientId: Config.VELNOTA_CLIENT_ID,
    redirectUrl: 'us.hearye.auth://velnota/login/callback/',
    usePKCE: true,
    scopes: ['openid'],
    serviceConfiguration: {
      authorizationEndpoint: `${velnotaUrl}/oauth/v1/authorize/`,
      tokenEndpoint: `${velnotaUrl}/oauth/v1/token/`,
      revocationEndpoint: `${velnotaUrl}/oauth/v1/revoke_token/`,
    },
  },
};
