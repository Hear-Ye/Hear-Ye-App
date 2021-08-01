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
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

/**
 * Activity indicator with text to the right
 * @param indicatorProps {Object} ActivityIndicator Props
 * @param textProps {Object} Text Props
 * @param text {string} the actual text
 * @returns {JSX.Element}
 */
export default ({indicatorProps, textProps, text}) => {
  return (
    <View style={styles.alignTogether}>
      <ActivityIndicator style={styles.marginHorizontal} {...indicatorProps} />
      <Text
        style={[styles.marginHorizontal, styles.defaultFont]}
        {...textProps}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  alignTogether: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  marginHorizontal: {marginHorizontal: 5},
  defaultFont: {fontSize: 22},
});
