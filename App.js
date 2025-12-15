import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './context/themeContext';
import HomeScreen from './screens/homeScreen';
import ReportScreen from './screens/reportScreen';

const Tab = createBottomTabNavigator();

function AppNavigation() {
  const { theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets(); 

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            const iconSize = 30;

            if (route.name === 'Zamanlayıcı') {
              iconName = focused ? 'timer' : 'timer-outline';
            } else if (route.name === 'Raporlar') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            }

            return <Ionicons name={iconName} size={iconSize} color={color} />;
          },

          tabBarActiveTintColor: theme.colors.tint,
          tabBarInactiveTintColor: 'gray',

          tabBarStyle: {
            backgroundColor: theme.colors.tabBar,
            borderTopWidth: 0,

            
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 8,

            elevation: 10,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 10,
          },

          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginBottom: 4,
          },

          headerStyle: {
            backgroundColor: theme.colors.background,
            shadowColor: 'transparent',
          },
          headerTintColor: theme.colors.text,

          headerRight: () => (
            <TouchableOpacity
              onPress={toggleTheme}
              style={{ marginRight: 15, padding: 5 }}
            >
              <Ionicons
                name={theme.dark ? 'sunny' : 'moon'}
                size={26}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          ),
        })}
      >
        <Tab.Screen name="Zamanlayıcı" component={HomeScreen} />
        <Tab.Screen name="Raporlar" component={ReportScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
   
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigation />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
