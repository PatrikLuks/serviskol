import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import RewardsScreen from './screens/RewardsScreen';
import ProfileScreen from './screens/ProfileScreen';
import TwoFAScreen from './screens/TwoFAScreen';
import TwoFASettingsScreen from './screens/TwoFASettingsScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import Analytics from 'expo-analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

const analytics = new Analytics('UA-XXXXXXXXX-X'); // TODO: nahraďte vlastním UA/GA4 ID

const Stack = createNativeStackNavigator();

// Přidat podmínku pro opt-out
function sendEvent(event, params) {
  AsyncStorage.getItem('analyticsOptOut').then(optOut => {
    if (optOut !== 'true') analytics.event(event, params);
  });
}

Sentry.init({
  dsn: 'https://VAŠE_SENTRY_DSN', // TODO: nahraďte vlastním DSN
  enableInExpoDevelopment: true,
  debug: true,
});

export default function App() {
  React.useEffect(() => {
    analytics.hit('AppLoaded');
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="Rewards" component={RewardsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="TwoFA" component={TwoFAScreen} />
        <Stack.Screen name="TwoFASettings" component={TwoFASettingsScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
