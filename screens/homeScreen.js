import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Vibration, ScrollView, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function HomeScreen() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [isActive, setIsActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Ders Çalışma');
  const [distractionCount, setDistractionCount] = useState(0); 
  const [modalVisible, setModalVisible] = useState(false); 
  
  const appState = useRef(AppState.currentState);
  const categories = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"];

  
  const saveSession = async () => {
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
      console.log("Seans kaydedildi:", newSession);
    } catch (e) {
      console.error("Kaydetme hatası", e);
    }
  };

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
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
      Vibration.vibrate(); 
      saveSession(); 
      setModalVisible(true); 
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleStartStop = () => setIsActive(!isActive);

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    setDistractionCount(0);
  };

  const adjustTime = (minutes) => {
    if (!isActive) {
      const newTime = timeLeft + (minutes * 60);
      if (newTime > 0) setTimeLeft(newTime);
    }
  };

  const addDistraction = () => {
    if (isActive) setDistractionCount(distractionCount + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
        <Text style={styles.sectionTitle}>Kategori Seçin</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.categoryBadge, selectedCategory === cat && styles.categorySelected]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextSelected]}>
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
        <View style={styles.timerShape}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.statusText}>{isActive ? "Odaklanılıyor..." : "Hazır"}</Text>
        </View>
        {!isActive && (
          <TouchableOpacity onPress={() => adjustTime(5)} style={styles.adjustBtn}>
            <Text style={styles.adjustText}>+5dk</Text>
          </TouchableOpacity>
        )}
      </View>

      {(isActive || distractionCount > 0) && (
         <TouchableOpacity style={styles.distractionBtn} onPress={addDistraction}>
            <Text style={styles.distractionBtnText}>⚠️ Dikkat Kaybı: {distractionCount}</Text>
         </TouchableOpacity>
      )}

      <View style={styles.controlsContainer}>
        {!isActive ? (
           <TouchableOpacity style={[styles.button, styles.btnStart]} onPress={handleStartStop}>
             <Text style={styles.btnText}>BAŞLAT</Text>
           </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.btnStop]} onPress={handleStartStop}>
            <Text style={styles.btnText}>DURAKLAT</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.button, styles.btnReset]} onPress={handleReset}>
          <Text style={[styles.btnText, {color: '#555'}]}>SIFIRLA</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>🎉 Seans Tamamlandı!</Text>
            <Text style={styles.modalText}>Kategori: {selectedCategory}</Text>
            <Text style={styles.modalText}>Süre: 25 Dakika</Text>
            <Text style={styles.modalText}>Dikkat Dağılması: {distractionCount} kez</Text>
            <TouchableOpacity 
              style={[styles.button, styles.btnStart, {marginTop: 20}]} 
              onPress={() => {
                setModalVisible(false);
                handleReset();
              }}
            >
              <Text style={styles.btnText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF3E0', alignItems: 'center', justifyContent: 'space-evenly', padding: 20 },
  categoryContainer: { height: 100, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 10 },
  scrollContainer: { flexDirection: 'row' },
  categoryBadge: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#E0E0E0', borderRadius: 20, marginHorizontal: 5 },
  categorySelected: { backgroundColor: '#8CAC94' },
  categoryText: { color: '#555' },
  categoryTextSelected: { color: '#fff', fontWeight: 'bold' },
  timerContainer: { flexDirection: 'row', alignItems: 'center' },
  timerShape: { width: 220, height: 220, backgroundColor: '#8CAC94', borderRadius: 110, alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 5 },
  timerText: { fontSize: 50, fontWeight: 'bold', color: '#FFF' },
  statusText: { fontSize: 16, color: '#F0F0F0', marginTop: 5 },
  adjustBtn: { padding: 10 },
  adjustText: { fontSize: 16, fontWeight: 'bold', color: '#8CAC94' },
  controlsContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
  button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10, minWidth: 120, alignItems: 'center' },
  btnStart: { backgroundColor: '#8CAC94' },
  btnStop: { backgroundColor: '#BC6C6C' },
  btnReset: { backgroundColor: '#F5E8A6' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  distractionBtn: { marginTop: -20, padding: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 5 },
  distractionBtnText: { color: '#555', fontSize: 14 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: 300, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#8CAC94' },
  modalText: { fontSize: 16, marginBottom: 10, color: '#333' }
});