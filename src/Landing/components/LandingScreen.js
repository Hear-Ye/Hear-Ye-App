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
import {ImageBackground, StyleSheet, Text, useColorScheme} from 'react-native';

import {Colors} from '../../utils';

const LandingScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <ImageBackground
      accessibilityRole="image"
      // this image came from https://www.pexels.com/photo/woman-in-black-shirt-holding-yellow-and-black-no-smoking-sign-2372440/
      source={require('./stop-talking.jpg')}
      style={[
        styles.background,
        {
          backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
        },
      ]}
      imageStyle={styles.image}>
      <Text
        style={[
          styles.text,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        Hear Ye,
        {'\n'}
        Hear Ye!
      </Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    paddingBottom: 40,
    paddingTop: 96,
    paddingHorizontal: 32,
  },
  image: {
    opacity: 0.2,
    overflow: 'visible',
    resizeMode: 'cover',
    marginLeft: -128,
    marginBottom: -192,
  },
  text: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default LandingScreen;
