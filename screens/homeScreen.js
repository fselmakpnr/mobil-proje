import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Vibration, ScrollView, AppState, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Svg, { Circle } from 'react-native-svg'; 


import { useTheme } from '../context/themeContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


const TOTAL_DURATION = 25 * 60; 
const RADIUS = 100; 
const STROKE_WIDTH = 15; 
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; 

export default function HomeScreen() {
  const { theme } = useTheme();
  const colors = theme.colors; 
  const styles = getStyles(colors);

  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION); 
  const [isActive, setIsActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Ders Çalışma');
  const [distractionCount, setDistractionCount] = useState(0); 
  const [modalVisible, setModalVisible] = useState(false); 
  
  const appState = useRef(AppState.currentState);
  const categories = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"];

  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') Alert.alert('İzin Gerekli', 'Bildirim izni vermelisiniz.');
    }
    requestPermissions();
  }, []);

  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: { title: "🚀 Odaklanma Başladı!", body: `Hedef: ${selectedCategory}.`, sound: true },
      trigger: null,
    });
  };

  const saveSession = useCallback(async () => {
    try {
      const today = new Date();
      const newSession = {
        id: Date.now().toString(),
        date: today.toISOString().split('T')[0],
        category: selectedCategory,
        duration: 25, 
        distractions: distractionCount,
        timestamp: today.getTime()
      };
      const existingData = await AsyncStorage.getItem('sessions');
      const sessions = existingData ? JSON.parse(existingData) : [];
      sessions.push(newSession);
      await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
    } catch (e) { console.error(e); }
  }, [selectedCategory, distractionCount]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/) && isActive) {
        setIsActive(false);
        setDistractionCount(prev => prev + 1);
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isActive]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => { setTimeLeft((p) => p - 1); }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
      Vibration.vibrate(); 
      saveSession(); 
      setModalVisible(true); 
      Notifications.scheduleNotificationAsync({ content: { title: "🎉 Süre Doldu!", body: "Mola vakti!" }, trigger: null });
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, saveSession]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleStartStop = () => {
    if (!isActive) sendNotification();
    setIsActive(!isActive);
  };

  const handleReset = () => { setIsActive(false); setTimeLeft(TOTAL_DURATION); setDistractionCount(0); };
  
 
  const adjustTime = (m) => { 
    if (!isActive) {
      const newTime = timeLeft + (m * 60);
      if (newTime > 0) setTimeLeft(newTime);
    } 
  };
  
  const addDistraction = () => { if (isActive) setDistractionCount(distractionCount + 1); };

  
  const progress = timeLeft / TOTAL_DURATION;
  
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.container}>
      
      <View style={styles.categoryContainer}>
        <Text style={styles.sectionTitle}>Kategori Seçin</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[
                styles.categoryBadge, 
                selectedCategory === cat && styles.categorySelected
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryText, 
                selectedCategory === cat && styles.categoryTextSelected
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      
      <View style={styles.timerContainer}>
        {!isActive && (
          <TouchableOpacity onPress={() => adjustTime(-5)} style={styles.adjustBtn}>
            <Text style={styles.adjustText}>-5dk</Text>
          </TouchableOpacity>
        )}
        
        
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            
            <Svg width={(RADIUS * 2) + STROKE_WIDTH} height={(RADIUS * 2) + STROKE_WIDTH} style={{ transform: [{ rotate: '-90deg' }] }}>
              
                <Circle
                    cx={RADIUS + (STROKE_WIDTH/2)}
                    cy={RADIUS + (STROKE_WIDTH/2)}
                    r={RADIUS}
                    stroke={colors.card} 
                    strokeWidth={STROKE_WIDTH}
                    fill="transparent"
                />
               
                <Circle
                    cx={RADIUS + (STROKE_WIDTH/2)}
                    cy={RADIUS + (STROKE_WIDTH/2)}
                    r={RADIUS}
                    stroke={colors.primary} 
                    strokeWidth={STROKE_WIDTH}
                    fill="transparent"
                    strokeDasharray={CIRCUMFERENCE} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round" 
                />
            </Svg>

            
            <View style={styles.timerTextContainer}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                <Text style={styles.statusText}>{isActive ? "Odaklanılıyor..." : "Hazır"}</Text>
            </View>
        </View>

        {!isActive && (
          <TouchableOpacity onPress={() => adjustTime(5)} style={styles.adjustBtn}>
            <Text style={styles.adjustText}>+5dk</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* --------------------------- */}

      {(isActive || distractionCount > 0) && (
         <TouchableOpacity style={styles.distractionBtn} onPress={addDistraction}>
            <Text style={styles.distractionBtnText}>⚠️ Dikkat Kaybı: {distractionCount}</Text>
         </TouchableOpacity>
      )}

      <View style={styles.controlsContainer}>
        {!isActive ? (
           <TouchableOpacity style={styles.btnStart} onPress={handleStartStop}>
             <Text style={styles.btnText}>BAŞLAT</Text>
           </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btnStop} onPress={handleStartStop}>
            <Text style={styles.btnText}>DURAKLAT</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.btnReset} onPress={handleReset}>
          <Text style={[styles.btnText, {color: '#555'}]}>SIFIRLA</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>🎉 Seans Tamamlandı!</Text>
            <Text style={styles.modalText}>Kategori: {selectedCategory}</Text>
            <Text style={styles.modalText}>Dikkat Dağılması: {distractionCount} kez</Text>
            <TouchableOpacity 
              style={[styles.btnStart, {marginTop: 20, minWidth: 100}]} 
              onPress={() => { setModalVisible(false); handleReset(); }}
            >
              <Text style={styles.btnText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly', padding: 20, backgroundColor: colors.background },
  categoryContainer: { height: 100, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: colors.text },
  scrollContainer: { flexDirection: 'row' },
  categoryBadge: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginHorizontal: 5, backgroundColor: colors.card },
  categorySelected: { backgroundColor: colors.primary },
  categoryText: { fontSize: 14, color: colors.text },
  categoryTextSelected: { color: '#fff', fontWeight: 'bold' },
  
  
  timerContainer: { flexDirection: 'row', alignItems: 'center' },
 
  timerTextContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  timerText: { fontSize: 42, fontWeight: 'bold', color: colors.text }, 
  statusText: { fontSize: 14, color: colors.subText || '#888', marginTop: 5 },
  
  adjustBtn: { padding: 10 },
  adjustText: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  controlsContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
  btnStart: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10, minWidth: 120, alignItems: 'center', backgroundColor: colors.primary },
  btnStop: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10, minWidth: 120, alignItems: 'center', backgroundColor: colors.stop },
  btnReset: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10, minWidth: 120, alignItems: 'center', backgroundColor: colors.reset },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  distractionBtn: { marginTop: -20, padding: 8, borderRadius: 5, backgroundColor: colors.card },
  distractionBtnText: { fontSize: 14, color: colors.text },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: 300, borderRadius: 20, padding: 35, alignItems: 'center', elevation: 5, borderWidth: 1, backgroundColor: colors.background, borderColor: colors.card },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: colors.primary },
  modalText: { fontSize: 16, marginBottom: 10, color: colors.text }
});