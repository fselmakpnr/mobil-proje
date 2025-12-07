import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons'; 


import HomeScreen from './screens/homeScreen';
import ReportScreen from './screens/reportScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
        
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Zamanlayıcı') {
           
              iconName = focused ? 'timer' : 'timer-outline';
            } else if (route.name === 'Raporlar') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            }

            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          
          tabBarActiveTintColor: '#8CAC94', 
          tabBarInactiveTintColor: 'gray',  
          tabBarStyle: { 
            backgroundColor: '#FAF3E0', 
            borderTopWidth: 0,
            height: 60, 
            paddingBottom: 10 
          },
          headerStyle: { backgroundColor: '#FAF3E0' },
          headerTintColor: '#555',
        })}
      >
        <Tab.Screen name="Zamanlayıcı" component={HomeScreen} />
        <Tab.Screen name="Raporlar" component={ReportScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}