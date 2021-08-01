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
import {Image, StyleSheet} from 'react-native';
import Config from 'react-native-config';

import {Colors} from '../../utils';

// TODO Use https://github.com/DylanVann/react-native-fast-image once we can
//  see that the rounded image issue is resolved for Android.

/**
 * Returns an image with a border to represent their vote
 *
 * imageStyle should provide width + height + borderRadius (default is provided)
 *
 * @param info {(RepresentativeInfo|RepresentativeWithVoteInfo)}
 * @param imageStyle {Object} additional styles for the image
 * @param imageProps additional props to pass to the image
 * @constructor
 */
export const RepresentativeImage = ({info, imageStyle, imageProps}) => {
  // Using the original file is 1. way too big an unnecessary and 2. there's
  // one representative that has a png, so I'ma assume the 450x550 is always jpg
  const url = `${Config.REP_IMAGE_CDN_URL}${info.bioguide}.jpg`;
  const voteBorderStyle = {};
  if (info.hasOwnProperty('vote')) {
    voteBorderStyle.borderWidth = 4;
    switch (info.vote) {
      case 0:
        voteBorderStyle.borderColor = Colors.red;
        break;
      case 1:
        voteBorderStyle.borderColor = Colors.approve;
        break;
      default:
        // Nothing really to show
        voteBorderStyle.borderColor = Colors.dark;
        voteBorderStyle.borderWidth = 8;
    }
  }
  return (
    <Image
      style={[styles.image, voteBorderStyle, imageStyle]}
      source={{uri: url}}
      resizeMode="cover"
      {...imageProps}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    overflow: 'hidden',
    width: 150,
    height: 150,
    borderRadius: 75, // not sure if half is the rule of thumb
  },
});
