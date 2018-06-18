import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';

const HomeStack = createStackNavigator({
  Home: HomeScreen,
});
const isIOS = Platform.OS === 'ios';

HomeStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        isIOS
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

const LinksStack = createStackNavigator({
  Links: LinksScreen,
});

LinksStack.navigationOptions = {
  tabBarLabel: 'Links',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={isIOS ? `ios-link${focused ? '' : '-outline'}` : 'md-link'}
    />
  ),
};

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
});

SettingsStack.navigationOptions = {
  tabBarLabel: 'Camera',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={`ios-camera${focused ? '' : '-outline'}`}
    />
  ),
};

export default createBottomTabNavigator({
  HomeStack,
  LinksStack,
  SettingsStack,
});
