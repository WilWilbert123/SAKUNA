import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppProvider } from './frontend/src/context/AppContext';

import HomeScreen from './frontend/src/screens/HomeScreen';
import NewsScreen from './frontend/src/screens/NewsScreen';
import ReportsScreen from './frontend/src/screens/ReportsScreen';
import NotificationScreen from './frontend/src/screens/NotificationScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: 'gray',
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="News" component={NewsScreen} />
          <Tab.Screen name="Reports" component={ReportsScreen} />
          <Tab.Screen name="Notification" component={NotificationScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
