import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';


import { ThemeProvider, useTheme } from './context/themeContext'; // küçük 't' ile
import HomeScreen from './screens/homeScreen';   // 'screens' klasörü (çoğul)
import ReportScreen from './screens/reportScreen'; // 'screens' klasörü (çoğul)

const Tab = createBottomTabNavigator();

function AppNavigation() {
  const { theme, toggleTheme } = useTheme(); 

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Zamanlayıcı') iconName = focused ? 'timer' : 'timer-outline';
            else if (route.name === 'Raporlar') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.tint,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { 
            backgroundColor: theme.colors.tabBar, 
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 10
          },
          headerStyle: { backgroundColor: theme.colors.background, shadowColor: 'transparent' }, 
          headerTintColor: theme.colors.text, 
          headerRight: () => (
            <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
              <Ionicons 
                name={theme.dark ? "sunny" : "moon"} 
                size={24} 
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
    <ThemeProvider>
      <AppNavigation />
    </ThemeProvider>
  );
}