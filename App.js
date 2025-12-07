import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Oluşturduğumuz diğer dosyaları buraya çağırıyoruz
import homeScreen from './screen/homeScreen';
import reportScreen from './screen/reportScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          // Tasarım renklerine uygun navigasyon çubuğu ayarları
          tabBarStyle: { backgroundColor: '#FAF3E0', borderTopWidth: 0 }, 
          headerStyle: { backgroundColor: '#FAF3E0' },
          headerTintColor: '#555',
          tabBarActiveTintColor: '#8CAC94', // Seçili sekme yeşil
          tabBarInactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="Zamanlayıcı" component={homeScreen} />
        <Tab.Screen name="Raporlar" component={reportScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}