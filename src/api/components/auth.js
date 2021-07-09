/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';
import {MMKV} from 'react-native-mmkv';
import * as Keychain from 'react-native-keychain';
import {Navigation} from 'react-native-navigation';

import url from './url';
import {loginNavigationRoot} from '../../utils';

const ACCESS_TOKEN_KEY = 'access-token',
  TOKEN_SERVICE = 'us.hearye.voting';

/**
 * Gets the specified token value
 * @param token_type {('access'|'refresh'|'velnota_access'|'velnota_refresh')}
 */
const getToken = async token_type => {
  switch (token_type) {
    case 'access':
      return MMKV.getString(ACCESS_TOKEN_KEY);
    case 'refresh':
    case 'velnota_access':
    case 'velnota_refresh':
      return (
        await Keychain.getGenericPassword({
          service: TOKEN_SERVICE,
        })
      )[token_type];
    default:
      throw Error('Invalid token type');
  }
};

/**
 * Sets the specified token value
 * @param token_type {('access'|'refresh'|'velnota_access'|'velnota_refresh')}
 * @param token_value {String}
 */
async function setToken(token_type, token_value) {
  switch (token_type) {
    case 'access':
      MMKV.set(ACCESS_TOKEN_KEY, token_value);
      break;
    case 'refresh':
    case 'velnota_access':
    case 'velnota_refresh':
      await Keychain.setGenericPassword(token_type, token_value, {
        service: TOKEN_SERVICE,
      });
      break;
  }
}

/**
 * Refreshes the access token
 * @return {Promise<boolean>} whether the refresh was successful
 */
const RefreshToken = async () => {
  try {
    const response = await fetch(`${url}users/api/v1/token/refresh/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: await getToken('refresh'),
      }),
    });
    await setToken('refresh', (await response.json()).refresh);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Obtains both access and refresh tokens
 * @return {Promise<boolean>} whether the obtaining of tokens was successful
 * @constructor
 */
const Authenticate = async () => {
  const _refreshed = await RefreshToken();
  if (!_refreshed) {
    try {
      const response = await fetch(`${url}users/api/v1/token/obtain/`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: await getToken('velnota_access'),
          refresh_token: await getToken('velnota_refresh'),
        }),
      });
      if (response.statusCode > 299) {
        console.error(response.statusMessage);
        return false;
      }
      const data = await response.json();
      await setToken('access', data.access);
      await setToken('refresh', data.refresh);
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  return true;
};

const Logout = async () => {
  MMKV.delete(ACCESS_TOKEN_KEY);
  await Keychain.resetGenericPassword({service: TOKEN_SERVICE});
  await Navigation.setRoot(loginNavigationRoot);
};

export {Authenticate, Logout, getToken};
