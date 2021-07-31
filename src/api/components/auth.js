/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';
import * as Keychain from 'react-native-keychain';
import {Navigation} from 'react-native-navigation';

import url from './url';
import {loginNavigationRoot, Storage} from '../../utils';

const ACCESS_TOKEN_KEY = 'access-token',
  TOKEN_SERVICE = 'us.hearye.voting';

/**
 * Gets the specified token value
 * @param token_type {('access'|'refresh'|'velnota_access'|'velnota_refresh')}
 */
const getToken = async token_type => {
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
const setToken = async (token_type, token_value) => {
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
    const response = await fetch(`${url}users/v1/token/refresh/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: await getToken('refresh'),
      }),
    });
    if (!response.ok) {
      return false;
    }
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
const Authenticate = async (force_obtain_both = false) => {
  const _refreshed = await RefreshToken();
  if (!_refreshed || force_obtain_both) {
    try {
      const response = await fetch(`${url}users/v1/token/obtain/`, {
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
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      await setToken('access', data.access_token);
      await setToken('refresh', data.refresh_token);
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
const userStillNeeds = data => {
  if (typeof data === 'boolean') {
    return data;
  }
  const needToDo = [];
  if (data.hasOwnProperty('district') && !data.district) {
    needToDo.push(1);
  }
  return needToDo;
};

const Logout = async () => {
  await Storage.delete(ACCESS_TOKEN_KEY);
  await Keychain.resetGenericPassword({service: TOKEN_SERVICE});
  await Navigation.setRoot(loginNavigationRoot);
};

export {Authenticate, Logout, getToken, setToken, userStillNeeds};
