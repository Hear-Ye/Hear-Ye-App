/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';
import React, {Component, useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, useColorScheme, View} from 'react-native';
import {Navigation} from 'react-native-navigation';

import {Colors} from '../utils';
import SummaryCard from './Summary/card';
import {PressableOpacity} from '../components/PressableOpacity';

async function getTopics(next) {
  try {
    const response = await request(next, 'GET', {});
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

function useTopics() {
  const [page, setPage] = useState('content/topic/');
  const [shouldFetch, setShouldFetch] = useState(true);
  const [topics, setTopics] = useState([]);
  const fetchMore = useCallback(() => setShouldFetch(true), []);

  useEffect(() => {
    // prevent fetching for other state changes
    if (!shouldFetch || !page) {
      return;
    }

    const fetch = async () => {
      const newData = await getTopics(page);
      setShouldFetch(false);
      setTopics(oldData => [...oldData, ...newData.data]);
      setPage(newData.next);
    };

    fetch();
  }, [page, shouldFetch]);

  return [topics, fetchMore];
}

function GreetingText() {
  /**
   * Combines the random greetings with a time specific greetings array
   * @param timeArray {Array<String>}
   */
  function getRandomEl(timeArray) {
    const combined = timeArray.concat(['Welcome back!']);
    return combined[Math.floor(Math.random() * combined.length)];
  }

  const [hourState, setHourState] = useState(0);
  const [greeting, setGreeting] = useState('');

  const now = new Date();
  const curHr = now.getHours();
  if (curHr < 5 || (now.getMinutes() >= 30 && curHr === 23)) {
    if (hourState !== 1) {
      setHourState(1);
      setGreeting(getRandomEl(['Exciting news for tonight']));
    }
  } else if (curHr < 12) {
    if (hourState !== 2) {
      setHourState(2);
      setGreeting(getRandomEl(['Morning!', 'Top of the morning!']));
    }
  } else if (curHr < 18) {
    if (hourState !== 3) {
      setHourState(3);
      setGreeting(getRandomEl(['Good afternoon!', 'Afternoon mate']));
    }
  } else {
    if (hourState !== 4) {
      setHourState(4);
      setGreeting(getRandomEl(['Good evening!']));
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

class SummaryItem extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const {key, topic, componentId} = this.props;
    return (
      <PressableOpacity
        onPress={() => {
          if (topic.user_vote === null) {
            Navigation.push(componentId, {
              component: {
                name: 'SummaryScreen',
                options: {
                  topBar: {
                    title: {
                      text: topic.title,
                    },
                  },
                },
                passProps: {
                  component_id: componentId,
                  topic_id: key,
                  topic_title: topic.title,
                },
              },
            });
          } else {
            Navigation.push(componentId, {
              component: {
                name: 'AnalyticsScreen',
                options: {
                  topBar: {
                    title: {
                      text: topic.title,
                    },
                  },
                },
                passProps: {
                  component_id: componentId,
                  topic_id: key,
                  topic: topic,
                },
              },
            });
          }
        }}>
        <SummaryCard topic={topic} />
      </PressableOpacity>
    );
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

  const [data, fetchMore] = useTopics();
  const renderItem = ({item}) => {
    const topic = item.data;
    switch (topic.type) {
      case 0:
        return (
          <SummaryItem
            key={item.id}
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
