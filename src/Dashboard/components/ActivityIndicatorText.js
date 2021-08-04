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
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

/**
 * Activity indicator with text to the right
 * @param indicatorProps {Object} ActivityIndicator Props
 * @param textProps {Object} Text Props
 * @param text {string} the actual text
 * @returns {JSX.Element}
 */
export default ({indicatorProps, textProps, text}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = {color: isDarkMode ? 'white' : 'black'};
  return (
    <View style={[styles.alignTogether, textColor]}>
      <ActivityIndicator style={styles.marginHorizontal} {...indicatorProps} />
      <Text
        style={[styles.marginHorizontal, styles.defaultFont, textColor]}
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
