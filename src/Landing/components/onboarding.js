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
import Onboarding from 'react-native-onboarding-swiper';
import {Navigation} from 'react-native-navigation';

const OnboardingScreen = ({componentId}) => {
  async function onDone() {
    await Navigation.dismissModal(componentId);
  }

  return (
    <Onboarding
      onDone={onDone}
      onSkip={onDone}
      containerStyles={styles.onboardingContainer}
      pages={[
        {
          backgroundColor: '#fff',
          image: (
            <Image
              style={styles.imageStyle}
              resizeMode="contain"
              source={require('./Dashboard.png')}
            />
          ),
          title: 'Latest Political News',
          subtitle:
            'Giving you the major and unknown perspectives of politics. No one side is perfect, so we should understand both.',
          imageContainerStyles: styles.imageContainerStyle,
        },
        {
          backgroundColor: '#fff',
          image: (
            <Image
              style={[styles.imageStyle, styles.cutInHalfImage]}
              resizeMode="contain"
              source={require('./VotingAndSummary.png')}
            />
          ),
          title: 'Vote on Congressional Bills and View the Analytics',
          subtitle:
            'Read our short summaries with dropdown menus that contain way more info (sources included). You can vote on bills like your representatives and check out some analytics.',
          imageContainerStyles: styles.imageContainerStyle,
        },
        {
          backgroundColor: '#fff',
          image: (
            <Image
              style={styles.imageStyle}
              resizeMode="contain"
              source={require('./DarkModeAndSummaryAnalytics.png')}
            />
          ),
          title: 'National and District Analytics',
          subtitle:
            'Afterwards, you can see how your representatives and neighbors in your district voted to help you decide who to vote for next election',
          imageContainerStyles: styles.imageContainerStyle,
        },
        {
          backgroundColor: '#fff',
          image: (
            <Image
              style={styles.imageStyle}
              resizeMode="contain"
              source={require('./RepAnalytics.png')}
            />
          ),
          title: 'Details on Representatives',
          subtitle:
            "View the analytics and past votes of your representative's voting habits",
          imageContainerStyles: styles.imageContainerStyle,
        },
        {
          backgroundColor: '#fff',
          image: (
            <Image
              style={styles.imageStyle}
              resizeMode="contain"
              source={require('./PersonalDetails.png')}
            />
          ),
          title: 'Your Contributions to Society',
          subtitle:
            'View your voting habits over time with more personal analytics coming soon! Dark mode fully supported.',
          imageContainerStyles: styles.imageContainerStyle,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  onboardingContainer: {marginTop: -60},
  imageContainerStyle: {},
  imageStyle: {
    height: 350,
  },
  cutInHalfImage: {
    height: 250,
  },
});

export default OnboardingScreen;
