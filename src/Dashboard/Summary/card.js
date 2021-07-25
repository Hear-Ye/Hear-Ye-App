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
import {Image, StyleSheet, Text, useColorScheme, View} from 'react-native';

import {Card} from '../../components/Card';
import {Colors} from '../../utils';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 20,
    width: '85%',
  },
  invert: {
    transform: [{scaleX: -0.5}, {scaleY: -0.5}],
  },
});

/**
 * Creates a Card for Summary topic types
 * @param topic {Object}
 * @param topic.user_vote {(Number|null)} User vote as a number
 * @param topic.title {String} Summary title
 * @param topic.created {String} ISO-8601 string with ending Z to parse as UTC
 * @return {JSX.Element}
 */
export default ({topic}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const cardStyle = {backgroundColor: isDarkMode ? Colors.black : Colors.white};
  const additionalTitleStyle = {
    color: isDarkMode ? Colors.white : Colors.black,
  };
  const subTitleStyle = {
    marginTop: 12,
    textAlign: 'right',
    color: isDarkMode ? Colors.lighter : Colors.dark,
  };
  let multiplier = 1;
  const voteStyle = {
    width: '15%',
    height: 40,
  };
  switch (topic.user_vote) {
    case 0:
      voteStyle.tintColor = Colors.red;
      multiplier = -1;
      break;
    case 1:
      voteStyle.tintColor = Colors.approve;
      break;
  }
  if (typeof topic.user_vote !== 'number') {
    additionalTitleStyle.width = '100%';
  }
  voteStyle.transform = [
    {scaleX: 0.5 * multiplier},
    {scaleY: 0.5 * multiplier},
  ];
  // https://fonts.google.com/icons?icon.query=approve 20dp, 3x version
  return (
    <Card cardStyle={cardStyle}>
      <View style={styles.container}>
        <Text style={[styles.title, additionalTitleStyle]}>{topic.title}</Text>
        {topic.user_vote !== null && (
          <Image style={voteStyle} source={require('../thumbsup.png')} />
        )}
      </View>
      <Text style={subTitleStyle}>
        {new Date(topic.created).toLocaleString()}
      </Text>
    </Card>
  );
};
