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
  Dimensions,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {PieChart} from 'react-native-chart-kit';
import {Navigation} from 'react-native-navigation';

import {RepresentativeImage} from '../../components/RepresentativeImage';
import {Colors, Theme} from '../../../utils';
import {PressableOpacity} from '../../../components/PressableOpacity';

/**
 * @typedef {RepresentativeInfo} RepresentativeWithVoteInfo
 * @property {number} vote representative' vote
 * @property {string} vote_name the display name for the vote
 */

/**
 * Creates a container having the representative image and info side-by-side
 * @param topic {TopicInfo}
 * @param info {RepresentativeWithVoteInfo}
 * @param componentId {string} component ID from the original screen
 * @returns {JSX.Element}
 */
const RepresentativeInfoContainer = ({topic, info, componentId}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = {
    color: isDarkMode ? Colors.white : Colors.black,
  };

  // Congressman prefix
  const personPrefix = typeof info.district === 'number' ? 'Rep.' : 'Sen.';

  // Calculate whether voted with district
  const districtMajorityVote = Object.keys(topic.total_district_votes)
    .reduce((a, b) =>
      topic.total_district_votes[a] > topic.total_district_votes[b] ? a : b,
    )
    .split('_');
  const repVotedWithDistrict =
    districtMajorityVote[districtMajorityVote.length - 1] ===
    info.vote.toString();

  return (
    <View style={styles.rowContainer}>
      <View style={styles.column}>
        <RepresentativeImage info={info} />
      </View>
      <View style={[styles.column, styles.rowColumn]}>
        <View style={styles.longTextContainer}>
          <Text style={[textColor, styles.longText]}>
            {`${personPrefix} ${info.name}`}
          </Text>
        </View>
        <View style={styles.longTextContainer}>
          <Text style={[textColor, styles.longText]}>
            {info.state +
              (info.district === null ? '' : `-${info.district}`) +
              ` (${info.party})`}
          </Text>
        </View>
        <View style={styles.longTextContainer}>
          <Text
            style={[
              textColor,
              styles.longText,
            ]}>{`Voted: ${info.vote_name}`}</Text>
        </View>
        <View style={styles.longTextContainer}>
          <Text
            style={[
              textColor,
              styles.longText,
            ]}>{`Did the ${personPrefix} vote with the district? ${
            repVotedWithDistrict ? '✅' : '❌'
          }`}</Text>
        </View>
        <PressableOpacity
          onPress={async () => {
            await Navigation.push(componentId, {
              component: {
                name: 'RepresentativeScreen',
                options: {
                  topBar: {
                    title: {
                      text: info.name,
                    },
                    backButton: {
                      title: 'Summary',
                      // since title of topic may be long
                      displayMode: 'minimal',
                    },
                  },
                },
                passProps: {
                  rep_info: info,
                  repID: info.id,
                },
              },
            });
          }}
          style={[
            Theme.DEFAULT_BUTTON_STYLE,
            {backgroundColor: Colors.cupertinoBlue},
          ]}>
          <Text
            style={{
              color: Colors.white,
            }}>{`View More Details about the ${personPrefix} >`}</Text>
        </PressableOpacity>
      </View>
    </View>
  );
};

/**
 * Constructs a pie chart
 * @param votes {Object}
 */
const ConstructVotePieChart = ({votes}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = {color: isDarkMode ? Colors.white : Colors.black};
  const chartConfig = {
    backgroundGradientFrom: '#1E2923',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#08130D',
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  const data = [];
  for (const [key, vote_count] of Object.entries(votes)) {
    let actualVoteType = key.split('_');
    actualVoteType = actualVoteType[actualVoteType.length - 1];
    let keyName = 'Present';
    let legendFontColor = Colors.dark;
    switch (actualVoteType) {
      case '0':
        keyName = 'Nay';
        legendFontColor = Colors.red;
        break;
      case '1':
        keyName = 'Yea';
        legendFontColor = Colors.approve;
        break;
      case '2':
        keyName = 'Not Voting';
        legendFontColor = Colors.darker;
        break;
    }
    data.push({
      name: keyName,
      votes: vote_count,
      color: legendFontColor,
      legendFontColor: textColor.color,
      legendFontSize: 15,
    });
  }
  return (
    <View
      style={[
        styles.chartCard,
        {borderColor: isDarkMode ? Colors.dark : Colors.light},
      ]}>
      <Text style={[styles.centerText, textColor]}>
        {Object.keys(votes).length && Object.keys(votes)[0].includes('district')
          ? "Your District's Total Votes"
          : "Our Nation's Total Votes"}
      </Text>
      <PieChart
        data={data}
        height={220}
        chartConfig={chartConfig}
        width={Dimensions.get('window').width}
        absolute
        backgroundColor="transparent"
        accessor="votes"
        avoidFalseZero={true}
      />
    </View>
  );
};

/**
 * Returns the analytics views necessary for a specific topic ID
 * @param layoutCB {function} callback for getting height in scroll view
 * @param topic {TopicInfo} topic information
 * @param summary_data {Object} more data from the summary
 * @param summary_data.representatives {Array<RepresentativeInfo>}
 * @param componentId {string} component ID from the original screen
 * @returns {JSX.Element}
 */
export default ({layoutCB, topic, summary_data, componentId}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = {
    color: isDarkMode ? Colors.white : Colors.black,
  };

  return (
    <View onLayout={layoutCB}>
      <Text style={[styles.h1, textColor, styles.centerText]}>
        Your Representative + Senators
      </Text>
      {summary_data.representatives ? (
        summary_data.representatives.map((info, key) => (
          <RepresentativeInfoContainer
            topic={topic}
            info={info}
            key={key}
            componentId={componentId}
          />
        ))
      ) : (
        <ActivityIndicator size="large" style={Theme.VERTICAL_PADDING} />
      )}
      <Text style={[styles.h1, textColor, styles.centerText]}>Votes</Text>
      <ConstructVotePieChart votes={topic.total_votes} />
      <ConstructVotePieChart votes={topic.total_district_votes} />
    </View>
  );
};

const styles = StyleSheet.create({
  h1: {fontSize: 22, marginTop: 5},
  centerText: {textAlign: 'center'},
  rowColumn: {flexDirection: 'column'},
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    flexShrink: 1,
    marginVertical: 5,
  },
  column: {marginHorizontal: 5},
  longTextContainer: {flexDirection: 'row', flexShrink: 1},
  longText: {flex: 1, flexWrap: 'wrap'},
  chartCard: {
    justifyContent: 'center',
    margin: 5,
    padding: 5,
    borderRadius: 10,
    borderWidth: 2,
  },
});
