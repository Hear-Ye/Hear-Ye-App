/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Navigation} from 'react-native-navigation';

import ActivityIndicatorText from '../components/ActivityIndicatorText';
import {AnimatedCircularProgress} from '../../components/CircularProgress';
import {RepresentativeImage} from '../components/RepresentativeImage';
import {Colors, Theme, useFetch} from '../../utils';
import {SummaryItem} from '../Summary/card';

/**
 * @typedef {Object} RepresentativeInfo
 * @property {number} id server id for representative
 * @property {string} name representative name
 * @property {string} bioguide bioguide ID
 * @property {string} state representative' state
 * @property {(string|null)} district representative's district if one exists
 * @property {string} party the display name for the representative's party
 */

async function getTopics(next) {
  try {
    const response = await request(next, 'GET');
    const data = await response.json();
    return {
      next: data.next,
      data: data.results.map(({id, ...rest}) => {
        rest.type = -1;
        if (rest.hasOwnProperty('vote')) {
          rest.user_vote = rest.vote;
          rest.type = 0;
        }
        return {
          key: id,
          data: rest,
        };
      }),
    };
  } catch (e) {
    return {
      next: null,
      data: [],
    };
  }
}

class ImmutableSummaryItem extends SummaryItem {
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  setUserVote = false;
}

/**
 * Details and analytics of representative's votes
 * @param repID {number} the representative's ID
 * @param componentId {string} the componentId from React Native Navigation
 * @param rep_info {(null|RepresentativeInfo)} optional passing representative
 * info if it has already been gotten.
 * @returns {JSX.Element}
 */
export default ({repID, componentId, rep_info}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = {color: isDarkMode ? Colors.white : Colors.black};
  const backgroundStyle = {
    height: '100%',
    backgroundColor: isDarkMode ? Colors.darker : Colors.light,
  };
  /**
   * @type {[RepresentativeInfo, Function]}
   */
  const [repData, setRepData] = useState(rep_info);
  /**
   * @typedef {Object} RepresentativeAnalytics
   * @property {Object} analytics
   * @property {Array<number>} analytics.num_times_voted_with_rep num voted with
   * on index 0 and num voted against on index 1, not counting Congressional
   * vote Present or Not Voting.
   * @property {number} analytics.percent_times_district_voted_in_majority_siding_with_rep
   * percent as a decimal
   * @property {number} analytics.freq_rep_votes_with_party percent as a decimal
   * @property {number} analytics.freq_rep_votes_with_party_not_district percent as a
   * decimal
   */
  /**
   * @type {[RepresentativeAnalytics, Function]}
   */
  const [repAnalytics, setRepAnalytics] = useState(null);
  const [repPrefix, setRepPrefix] = useState('Rep.');

  const votedWithRepRef = useRef();
  const freqVotedWithRepRef = useRef();
  const freqWithPartyRef = useRef();
  const freqWithPartyNotDistrictRef = useRef();

  useEffect(() => {
    if (typeof repData === 'object') {
      setRepPrefix(typeof repData.district === 'number' ? 'Rep.' : 'Sen.');
    }
  }, [repData]);

  useEffect(() => {
    // Fetching details from the API
    async function getDetails() {
      const shouldCallBoth = typeof rep_info !== 'object';

      async function popView() {
        // TODO Add toast or alert saying couldn't find representative
        await Navigation.pop(componentId);
      }

      // Running both API calls at the same time. The analytics endpoint takes
      // time to run for the first person who visits.
      async function fetchRep() {
        try {
          const response = await request(
            `voting/representative/${repID}/details/`,
            'GET',
          );
          setRepData(await response.json());
        } catch (e) {
          await popView();
        }
      }

      async function fetchRepAnalytics() {
        try {
          const response = await request(
            `voting/representative/${repID}/details/?include_analytics=true`,
            'GET',
          );
          const data = await response.json();
          setRepAnalytics(data);
        } catch (e) {
          if (!shouldCallBoth) {
            // don't double the pop
            await popView();
          }
        }
      }
      const necessary = [fetchRepAnalytics()];
      if (shouldCallBoth) {
        necessary.push(fetchRep());
      }
      await Promise.all(necessary);
    }
    getDetails();
  }, [repID, componentId, rep_info]);

  function getTotalNumTimesVotedWithRep() {
    return (
      repAnalytics.analytics.num_times_voted_with_rep[0] +
      repAnalytics.analytics.num_times_voted_with_rep[1]
    );
  }

  useEffect(() => {
    // Does the analytics animations for the progress circles
    if (votedWithRepRef.current) {
      votedWithRepRef.current.animate(
        (repAnalytics.analytics.num_times_voted_with_rep[0] /
          (repAnalytics.analytics.num_times_voted_with_rep[0] +
            repAnalytics.analytics.num_times_voted_with_rep[1])) *
          100,
        1000,
        Easing.cubic,
      );
      freqVotedWithRepRef.current.animate(
        repAnalytics.analytics
          .percent_times_district_voted_in_majority_siding_with_rep,
        1000,
        Easing.cubic,
      );
      freqVotedWithRepRef.current.animate(
        repAnalytics.analytics.freq_rep_votes_with_party,
        1000,
        Easing.cubic,
      );
      freqVotedWithRepRef.current.animate(
        repAnalytics.analytics.freq_rep_votes_with_party_not_district,
        1000,
        Easing.cubic,
      );
    }
  }, [repAnalytics]);

  let repImageStyle = {};
  if (!repData.party?.startsWith('I')) {
    repImageStyle = {
      borderWidth: 4,
      borderColor: repData.party.startsWith('R')
        ? Colors.red
        : Colors.cupertinoBlue,
    };
  }

  const [data, fetchMore] = useFetch(
    `voting/representative/${repID}/`,
    getTopics,
  );

  const renderItem = ({item}) => {
    const topic = item.data;
    switch (topic.type) {
      case 0:
        return (
          <ImmutableSummaryItem
            backButtonTitle="Rep."
            topic_id={item.key}
            topic={Object.assign({}, topic, {user_vote: null})}
            componentId={componentId}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    <View style={backgroundStyle}>
      <FlatList
        ListHeaderComponent={
          <>
            {!repData ? (
              <ActivityIndicator size="large" />
            ) : (
              <View style={styles.center}>
                <RepresentativeImage
                  info={repData}
                  imageStyle={[Theme.VERTICAL_PADDING, repImageStyle]}
                />
                <Text
                  style={[
                    Theme.VERTICAL_PADDING,
                    textColor,
                    styles.textStyle,
                  ]}>{`${repPrefix} ${repData.name}`}</Text>
                <Text
                  style={[Theme.VERTICAL_PADDING, textColor, styles.textStyle]}>
                  {repData.state +
                    (repData.district === null ? '' : `-${repData.district}`) +
                    ` (${repData.party})`}
                </Text>
              </View>
            )}
            {repAnalytics === null || typeof repData !== 'object' ? (
              <ActivityIndicatorText
                indicatorProps={{size: 'large'}}
                text="Loading analytics..."
              />
            ) : (
              <>
                <View
                  style={[
                    styles.rowContainer,
                    Theme.VERTICAL_PADDING,
                    styles.column,
                  ]}>
                  <View style={[styles.center, styles.mr]}>
                    <Text
                      style={[
                        textColor,
                        Theme.VERTICAL_PADDING,
                        styles.textStyle,
                      ]}>
                      {`Number of times you voted with the ${repPrefix}`}
                    </Text>
                  </View>
                  <View style={[styles.center, styles.ml]}>
                    <Text
                      style={[
                        textColor,
                        Theme.VERTICAL_PADDING,
                        styles.textStyle,
                      ]}>
                      {`Frequency Your District voted in majority siding with the ${repPrefix}`}
                    </Text>
                  </View>
                </View>
                <View style={[styles.rowContainer, Theme.VERTICAL_PADDING]}>
                  <View style={[styles.center, styles.column]}>
                    <AnimatedCircularProgress
                      ref={votedWithRepRef}
                      fill={0}
                      size={120}
                      width={15}
                      tintColor={
                        repData.party.startsWith('D')
                          ? Colors.cupertinoBlue
                          : Colors.red
                      }
                      backgroundColor={isDarkMode ? Colors.light : Colors.dark}>
                      {fill => (
                        <Text>{`${Math.round(fill)}% (${Math.round(
                          (fill / 100) * getTotalNumTimesVotedWithRep(),
                        )} / ${getTotalNumTimesVotedWithRep()})`}</Text>
                      )}
                    </AnimatedCircularProgress>
                  </View>
                  <View style={[styles.center, styles.column]}>
                    <AnimatedCircularProgress
                      ref={freqVotedWithRepRef}
                      fill={0}
                      size={120}
                      width={15}
                      tintColor={
                        repData.party.startsWith('D')
                          ? Colors.cupertinoBlue
                          : Colors.red
                      }
                      backgroundColor={isDarkMode ? Colors.light : Colors.dark}>
                      {fill => <Text>{`${Math.round(fill)}%`}</Text>}
                    </AnimatedCircularProgress>
                  </View>
                </View>
                <View
                  style={[
                    styles.rowContainer,
                    Theme.VERTICAL_PADDING,
                    styles.column,
                  ]}>
                  <View style={[styles.center, styles.mr]}>
                    <Text
                      style={[
                        textColor,
                        Theme.VERTICAL_PADDING,
                        styles.textStyle,
                      ]}>
                      {`Frequency ${repPrefix} votes with their party ${repAnalytics.party.charAt(
                        0,
                      )}`}
                    </Text>
                  </View>
                  <View style={[styles.center, styles.ml]}>
                    <Text
                      style={[
                        textColor,
                        Theme.VERTICAL_PADDING,
                        styles.textStyle,
                      ]}>
                      {`Frequency ${repPrefix} votes with their party (${repAnalytics.party.charAt(
                        0,
                      )}) and not with your district's majority`}
                    </Text>
                  </View>
                </View>
                <View style={[styles.rowContainer, Theme.VERTICAL_PADDING]}>
                  <View style={[styles.center, styles.column]}>
                    <AnimatedCircularProgress
                      ref={freqWithPartyRef}
                      fill={0}
                      size={120}
                      width={15}
                      tintColor={
                        repData.party.startsWith('D')
                          ? Colors.cupertinoBlue
                          : Colors.red
                      }
                      backgroundColor={isDarkMode ? Colors.light : Colors.dark}>
                      {fill => <Text>{`${Math.round(fill)}%`}</Text>}
                    </AnimatedCircularProgress>
                  </View>
                  <View style={[styles.center, styles.column]}>
                    <AnimatedCircularProgress
                      ref={freqWithPartyNotDistrictRef}
                      fill={0}
                      size={120}
                      width={15}
                      tintColor={
                        repData.party.startsWith('D')
                          ? Colors.cupertinoBlue
                          : Colors.red
                      }
                      backgroundColor={isDarkMode ? Colors.light : Colors.dark}>
                      {fill => <Text>{`${Math.round(fill)}%`}</Text>}
                    </AnimatedCircularProgress>
                  </View>
                </View>
              </>
            )}
            <Text style={[Theme.VERTICAL_PADDING, styles.textStyle]}>
              Here's a list of how your representative is voting
            </Text>
          </>
        }
        data={data}
        renderItem={renderItem}
        onEndReachedThreshold={3}
        onEndReached={fetchMore}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {justifyContent: 'center', alignItems: 'center'},
  ml: {marginLeft: 10},
  mr: {marginRight: 10},
  column: {width: '50%'},
  rowContainer: {flexDirection: 'row', marginHorizontal: 8},
  textStyle: {fontSize: 16, fontWeight: '600', textAlign: 'center'},
});
