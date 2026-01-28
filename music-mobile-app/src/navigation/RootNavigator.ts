import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { SplashScreen } from '../screens/Splash/SplashScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="AuthStack" component={AuthNavigator} />
      <Stack.Screen name="AppStack" component={AppNavigator} />
    </Stack.Navigator>
  </NavigationContainer>
);
