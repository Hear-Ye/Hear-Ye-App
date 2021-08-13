/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';
import React, {Component} from 'react';
import {Image, StyleSheet, Text, useColorScheme, View} from 'react-native';
import {Navigation} from 'react-native-navigation';

import {Card} from '../../components/Card';
import {Colors} from '../../utils';
import {PressableOpacity} from '../../components/PressableOpacity';

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
  summaryBorder: {
    borderColor: Colors.ourPurple,
    borderWidth: 1,
  },
});

/**
 * Calculates percent for total votes
 * @param data {Object.<string, number>}
 */
function getPercentVote(data) {
  let sum = Object.values(data).reduce((a, b) => a + b, 0);
  if (sum < 1) {
    sum = 1;
  }
  const keys = Object.keys(data);
  keys.sort();
  return parseFloat((data[keys[0]] / sum) * 100).toFixed(2) + '%';
}

/**
 * Creates a Card for Summary topic types
 * @param topic {Object}
 * @param topic.title {String} Summary title
 * @param topic.created {String} ISO-8601 string with ending Z to parse as UTC
 * @param topic.did_congressmen_vote {boolean} whether a Congressman voted here
 * @param topic.total_district_votes {TopicInfo.total_district_votes}
 * @param topic.total_votes {TopicInfo.total_votes}
 * @param user_vote {number} user vote (passed as state from previous component)
 * @return {JSX.Element}
 */
const SummaryCard = ({topic, user_vote}) => {
  const isDarkMode = useColorScheme() === 'dark';
  let cardStyle = {backgroundColor: isDarkMode ? Colors.black : Colors.white};
  if (topic.did_congressmen_vote) {
    cardStyle = {...cardStyle, ...styles.summaryBorder};
  }
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
  switch (user_vote) {
    case 0:
      voteStyle.tintColor = Colors.red;
      multiplier = -1;
      break;
    case 1:
      voteStyle.tintColor = Colors.approve;
      break;
  }
  if (typeof user_vote !== 'number') {
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
        {user_vote !== null && (
          <Image style={voteStyle} source={require('../thumbsup.png')} />
        )}
      </View>
      <Text style={subTitleStyle}>
        {new Date(topic.created).toLocaleString()}
      </Text>
      {user_vote !== null && typeof topic.total_votes === 'object' && (
        <>
          <Text style={subTitleStyle}>
            {`Total National Votes in Favor: ${getPercentVote(
              topic.total_votes,
            )}`}
          </Text>
          <Text style={subTitleStyle}>
            {`Total District Votes in Favor: ${getPercentVote(
              topic.total_district_votes,
            )}`}
          </Text>
        </>
      )}
    </Card>
  );
};

export class SummaryItem extends Component {
  constructor(props) {
    super(props);
    const {topic_id, topic} = this.props;
    this.state = {topic: topic, user_vote: topic.user_vote, topic_id: topic_id};
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.user_vote !== nextState.user_vote;
  }

  setUserVote = user_vote => {
    this.setState({user_vote: user_vote});
  };

  render() {
    const {topic_id, topic, componentId, backButtonTitle} = this.props;
    return (
      <PressableOpacity
        onPress={() => {
          Navigation.push(componentId, {
            component: {
              name: 'SummaryScreen',
              options: {
                topBar: {
                  title: {
                    text: topic.title,
                  },
                  backButton: {
                    title: backButtonTitle ? backButtonTitle : 'Dashboard',
                    displayMode: 'minimal',
                  },
                },
              },
              passProps: {
                topic_id: topic_id,
                topic: topic,
                voteCb: this.setUserVote,
              },
            },
          });
        }}>
        <SummaryCard topic={topic} user_vote={this.state.user_vote} />
      </PressableOpacity>
    );
  }
}
