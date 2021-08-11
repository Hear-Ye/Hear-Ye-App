/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, useColorScheme, View} from 'react-native';
import RNBootSplash from 'react-native-bootsplash';

import {Colors, useFetch} from '../utils';
import {SummaryItem} from './Summary/card';

function GreetingText() {
  /**
   * Combines the random greetings with a time specific greetings array
   * @param timeArray {Array<String>}
   */
  function getRandomEl(timeArray) {
    const combined = timeArray.concat([
      'Welcome back!',
      'Good to see you!',
      "How's it going?",
      "You're back!",
      'Nice seeing you again!',
    ]);
    return combined[Math.floor(Math.random() * combined.length)];
  }

  const [hourState, setHourState] = useState(0);
  const [greeting, setGreeting] = useState('');

  const now = new Date();
  const curHr = now.getHours();
  if (curHr < 5 || (now.getMinutes() >= 30 && curHr === 23)) {
    if (hourState !== 1) {
      setHourState(1);
      setGreeting(
        getRandomEl([
          'Ready to call it a day?',
          'Pulling an all nighter!',
          'Not sleepy yet?',
          'Still up?',
          'Good night... erm soon',
          'Here for a bedtime story?', // Purposeful duplicate
          'Nighty-Night!',
        ]),
      );
    }
  } else if (curHr < 12) {
    if (hourState !== 2) {
      setHourState(2);
      setGreeting(
        getRandomEl([
          'Morning!',
          'Top of the morning!',
          'Rise and shine!',
          'Starting your day off right!',
          'Buenos dias!',
        ]),
      );
    }
  } else if (curHr < 18) {
    if (hourState !== 3) {
      setHourState(3);
      setGreeting(
        getRandomEl([
          'Good afternoon!',
          'Afternoon mate',
          "G'day",
          'Good day!',
          'Grab a snack!',
          'Hope that tea tastes good!',
        ]),
      );
    }
  } else {
    if (hourState !== 4) {
      setHourState(4);
      setGreeting(
        getRandomEl([
          'Good evening!',
          'One last peek for you',
          'Exciting news for tonight!',
          'Here for a bedtime story?', // Purposeful duplicate
        ]),
      );
    }
  }

  return (
    <Text
      style={[
        styles.greetings,
        {color: useColorScheme() === 'dark' ? Colors.light : Colors.black},
      ]}>
      {greeting} ☕
    </Text>
  );
}

async function getTopics(next) {
  try {
    const response = await request(next, 'GET');
    const data = await response.json();
    return {
      next: data.next,
      data: data.results.map(({id, ...rest}) => ({
        key: id,
        data: rest,
      })),
    };
  } catch (e) {
    return {
      next: null,
      data: [],
    };
  }
}

/**
 * Constructs the (user-logged-in) Dashboard screen
 * @return {JSX.Element}
 */
const DashboardScreen = props => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.light,
  };

  useEffect(() => {
    RNBootSplash.hide();
  }, []);

  const [data, fetchMore] = useFetch('content/topic/', getTopics);
  const renderItem = ({item}) => {
    const topic = item.data;
    switch (topic.type) {
      case 0:
        return (
          <SummaryItem
            topic_id={item.key}
            topic={topic}
            componentId={props.componentId}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    <View style={backgroundStyle}>
      <FlatList
        ListHeaderComponent={<GreetingText />}
        data={data}
        renderItem={renderItem}
        onEndReachedThreshold={3}
        onEndReached={fetchMore}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  greetings: {
    marginTop: 30,
    marginLeft: 30,
    marginBottom: 20,
    fontSize: 25,
    fontWeight: '600',
  },
});

export default DashboardScreen;
