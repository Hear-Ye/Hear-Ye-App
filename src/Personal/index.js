/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {ContributionGraph} from 'react-native-chart-kit';
import {Navigation} from 'react-native-navigation';

import {Colors, Theme} from '../utils';
import {SummaryItem} from '../Dashboard/Summary/card';
import ActivityIndicatorText from '../Dashboard/components/ActivityIndicatorText';
import {PressableOpacity} from '../components/PressableOpacity';

/**
 * @typedef {Object} GetContributionListObject
 * @property {string} date date in 2000-01-31 format
 * @property {number} count the number of votes made today
 */

/**
 * Gets contributions
 * @param startDate {string} 2000-01-31 format
 * @param endDate {string} 2000-01-31 format
 * @returns {Promise<Array<GetContributionListObject>>}
 */
async function getContributions(startDate, endDate) {
  try {
    const response = await request(
      `users/contribution/?start=${new Date(
        `${startDate}T00:00`,
      ).toISOString()}&end=${new Date(`${endDate}T00:00`).toISOString()}`,
      'GET',
    );
    return await response.json();
  } catch (e) {
    return [];
  }
}

/**
 * @typedef {Object} MinimalTopicInfo
 * @property {number} id topic ID
 * @property {number} vote user vote
 * @property {string} title the topic title
 * @property {string} created the IS08601 formatted date and time created
 */

/**
 * Gets contributions for specific day
 * @param date {string} 2000-01-31 format
 * @returns {Promise<Array<MinimalTopicInfo>>}
 */
async function getDayContributionDetail(date) {
  try {
    const response = await request(
      `users/contribution/day-detail/?date=${toIsoString(new Date(date))}`,
      'GET',
    );
    return await response.json();
  } catch (e) {
    return [];
  }
}

function mapValue(x, in_min, in_max, out_min, out_max) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

class NewContributionGraph extends ContributionGraph {
  getClassNameForIndex(index: number) {
    if (this.state.valueCache[index]) {
      if (this.state.valueCache[index].value) {
        const count = this.state.valueCache[index].value[this.props.accessor];

        if (count) {
          const opacity = mapValue(
            count,
            this.state.maxValue === this.state.minValue
              ? 0
              : this.state.minValue,
            isNaN(this.state.maxValue) ? 1 : this.state.maxValue,
            0.15 + 0.05, // + 0.05 to make smaller values a bit more visible
            1,
          );
          return this.props.chartConfig.color(opacity);
        }
      }
    }

    return this.props.chartConfig.color(0.15);
  }
}

function convertUTCDateToLocalDate(date) {
  const newDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60 * 1000,
  );

  const offset = date.getTimezoneOffset() / 60;
  const hours = date.getHours();

  newDate.setHours(hours - offset);

  return newDate;
}

function toIsoString(date) {
  let tzo = -date.getTimezoneOffset(),
    dif = tzo >= 0 ? '+' : '-',
    pad = function (num) {
      const norm = Math.floor(Math.abs(num));
      return (norm < 10 ? '0' : '') + norm;
    };

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    dif +
    pad(tzo / 60) +
    ':' +
    pad(tzo % 60)
  );
}

/**
 * Gets the 2000-01-31 format from a Date object
 * @param yourDate {Date}
 * @returns {string}
 */
function toDateString(yourDate) {
  const offset = yourDate.getTimezoneOffset();
  yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
  return yourDate.toISOString().split('T')[0];
}

export default ({componentId}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    height: '100%',
    backgroundColor: isDarkMode ? Colors.darker : Colors.light,
  };
  const textColor = {
    color: isDarkMode ? Colors.white : Colors.black,
  };
  const chartConfig = {
    backgroundColor: Colors.lightPurple,
    backgroundGradientFrom: Colors.lightPurple,
    backgroundGradientTo: Colors.ourPurple,
    color: (opacity = 0) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  /**
   * @typedef {Object} PersonalDetails
   * @property {string} joined date joined in IS8601 format
   */
  const [personalDetails, setPersonalDetails] = useState(null);
  const [contributionsEndDate, setContributionsEndDate] = useState(
    toDateString(new Date()),
  );
  const [contributionData, setContributionData] = useState(null);
  const [listData, setListData] = useState([]);

  useEffect(() => {
    async function getPersonalDetails() {
      try {
        const response = await request('users/personal/', 'GET');
        const data = await response.json();
        setPersonalDetails(data);
      } catch (e) {}
    }

    async function getLatestContributions() {
      try {
        const today = new Date();
        const start = new Date();
        start.setDate(today.getDate() - 30);
        const data = await getContributions(
          toDateString(start),
          toDateString(today),
        );
        const newData = {};
        for (const x of data) {
          const givenDate = toDateString(
            convertUTCDateToLocalDate(new Date(x)),
          );
          if (givenDate in newData) {
            newData[givenDate] += 1;
          } else {
            newData[givenDate] = 1;
          }
        }
        const finalData = [];
        for (const [givenDate, count] of Object.entries(newData)) {
          finalData.push({date: givenDate, count: count});
        }
        setContributionData(finalData);
      } catch (e) {
        console.error(e);
      }
    }

    async function run() {
      await Promise.all(getPersonalDetails(), getLatestContributions());
    }
    run();
  }, []);

  const [isFetchingSummaries, setIsFetchingSummaries] = useState(false);
  const [showingDate, setShowingDate] = useState('None (select a square)');

  const getDayPress = ({date, count}) => {
    let fullDate = date;
    if (typeof date === 'string') {
      fullDate = new Date(`${date}T00:00`);
    }
    setShowingDate(fullDate.toDateString());
    setIsFetchingSummaries(true);
    if (count) {
      getDayContributionDetail(date)
        .then(data => {
          setListData(data);
        })
        .finally(() => {
          setIsFetchingSummaries(false);
        });
    } else {
      setIsFetchingSummaries(false);
      setListData([]);
    }
  };

  const renderItem = ({item}) => {
    return (
      <SummaryItem topic_id={item.id} topic={item} componentId={componentId} />
    );
  };

  // TODO In the next 3 months, you need to add buttons mentioning each
  //  season (91-92 days per). (Can also be a slider too maybe... just need a
  //  method of deselection.

  async function settingsPress() {
    await Navigation.push(componentId, {
      component: {
        name: 'SettingsScreen',
        options: {
          topBar: {
            title: {
              text: 'Settings',
            },
            backButton: {
              title: 'Me',
            },
          },
        },
      },
    });
  }

  return (
    <View style={backgroundStyle}>
      <FlatList
        style={styles.background}
        ListHeaderComponent={
          <>
            <PressableOpacity
              hitSlop={10}
              style={[styles.center, styles.settingsCenter]}
              onPress={settingsPress}>
              <Image
                style={[
                  styles.settingsSize,
                  {tintColor: isDarkMode ? Colors.white : Colors.black},
                ]}
                source={require('./Settings/images/settings/settings.png')}
              />
            </PressableOpacity>
            {personalDetails === null ? (
              <ActivityIndicatorText text="Loading Profile..." />
            ) : (
              <>
                <Text style={[styles.h1, styles.centerText, textColor]}>
                  {personalDetails.name}
                </Text>
                <Text style={[styles.h1, styles.centerText, textColor]}>
                  {`Joined: ${new Date(
                    personalDetails.joined,
                  ).toLocaleString()}`}
                </Text>
              </>
            )}
            {contributionData === null ? (
              <ActivityIndicatorText text="Loading Votes..." />
            ) : (
              <>
                <Text
                  style={[
                    Theme.LARGE_VERTICAL_PADDING,
                    styles.centerText,
                    textColor,
                    styles.h1,
                  ]}>
                  Your Votes
                </Text>
                <NewContributionGraph
                  style={Theme.VERTICAL_PADDING}
                  values={contributionData}
                  width={
                    Dimensions.get('window').width -
                    styles.background.margin * 2
                  }
                  numDays={92}
                  horizontal={true}
                  height={250}
                  squareSize={20}
                  showMonthLabels={true}
                  chartConfig={chartConfig}
                  endDate={contributionsEndDate}
                  onDayPress={getDayPress}
                />
                {isFetchingSummaries ? (
                  <ActivityIndicator
                    style={[textColor, Theme.VERTICAL_PADDING]}
                    size="large"
                  />
                ) : (
                  <Text
                    style={[
                      textColor,
                      Theme.VERTICAL_PADDING,
                      styles.centerText,
                      styles.h1,
                    ]}>
                    {'Showing: ' + showingDate}
                  </Text>
                )}
              </>
            )}
          </>
        }
        data={listData}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 20,
  },
  settingsSize: {
    width: 25,
    height: 25,
  },
  center: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsCenter: {
    top: 10,
    right: 10,
    zIndex: 3,
    elevation: 3,
  },
  background: {
    margin: 8,
    marginBottom: 0,
  },
  centerText: {
    textAlign: 'center',
  },
});
