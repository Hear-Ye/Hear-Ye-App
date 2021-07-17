/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const utilHandler = async (key, handler) => {
  try {
    let value = await AsyncStorage.getItem(key);
    if (value === null) {
      return value;
    }
    return handler(value);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default {
  /**
   * Sets an ambiguous value using a string key
   * @param key {boolean}
   * @param value {string|boolean|number|Object}
   * @return {Promise<void>}
   */
  async set(key, value) {
    switch (typeof value) {
      case 'string':
        await AsyncStorage.setItem(key, value);
        break;
      case 'boolean':
        await AsyncStorage.setItem(key, value ? '1' : '0');
        break;
      case 'number':
        await AsyncStorage.setItem(key, value.toString());
        break;
      case 'object':
        await AsyncStorage.setItem(key, JSON.stringify(value));
        break;
      default:
        break;
    }
  },
  /**
   * Deletes item
   * @param key {string}
   * @return {Promise<void>}
   */
  async delete(key) {
    return await AsyncStorage.removeItem(key);
  },
  /**
   * Gets a string value using key
   * @param key {string}
   * @return {Promise<null|string>}
   */
  async getString(key) {
    return await AsyncStorage.getItem(key);
  },
  /**
   * Gets a boolean value using key, null if value not found
   * @param key {string}
   * @return {Promise<null|boolean>}
   */
  async getBoolean(key) {
    return await utilHandler(key, v => v === '1');
  },
  /**
   * Gets a boolean value using key, null if value not found
   * @param key {string}
   * @param radix {number}
   * @return {Promise<null|number>}
   */
  async getNumber(key, radix = 10) {
    return await utilHandler(key, v => parseInt(v, radix));
  },
  /**
   * Gets a boolean value using key, null if value not found
   * @param key {string}
   * @return {Promise<null|Object>}
   */
  async getObject(key) {
    return await utilHandler(key, v => JSON.parse(v));
  },
};
