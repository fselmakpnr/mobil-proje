import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/themeContext';

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const { theme } = useTheme(); 
  const colors = theme.colors;
  const styles = getStyles(colors);

  const [stats, setStats] = useState({
    todayFocus: 0,
    totalFocus: 0,
    totalDistractions: 0
  });

  const [chartData, setChartData] = useState({
    labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
  });

  const [distractionChartData, setDistractionChartData] = useState({
    labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
  });

  const [pieData, setPieData] = useState([]);

  const loadData = async () => {
    try {
      const json = await AsyncStorage.getItem('sessions');
      const sessions = json ? JSON.parse(json) : [];

      
      const todayStr = new Date().toISOString().split('T')[0];
      
      let todayFocus = 0;
      let totalFocus = 0;
      let totalDistractions = 0;
      const categoryCounts = {}; 

      sessions.forEach(session => {
        totalFocus += session.duration;
        totalDistractions += session.distractions;

        if (session.date === todayStr) {
          todayFocus += session.duration;
        }

        if (categoryCounts[session.category]) {
          categoryCounts[session.category] += session.duration;
        } else {
          categoryCounts[session.category] = session.duration;
        }
      });

      setStats({ todayFocus, totalFocus, totalDistractions });

     
      const pieColors = ['#FF6F61', '#FF9800', '#4CAF50', '#2979FF', '#9C27B0'];
      
      
      const legendColor = theme.dark ? "#FFFFFF" : "#000000"; 

      const pData = Object.keys(categoryCounts).map((key, index) => ({
        name: key,
        population: categoryCounts[key],
        color: pieColors[index % pieColors.length],
        legendFontColor: legendColor,
        legendFontSize: 13            
      }));
      setPieData(pData);

      
      const last7DaysLabels = [];
      const last7DaysDuration = [];
      const last7DaysDistractions = [];
      
      const dayNamesTR = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        const dateString = d.toISOString().split('T')[0];
        const dayName = dayNamesTR[d.getDay()];
        
        last7DaysLabels.push(dayName);

        const daysSessions = sessions.filter(s => s.date === dateString);

        const durationTotal = daysSessions.reduce((sum, curr) => sum + curr.duration, 0);
        last7DaysDuration.push(durationTotal);

        const distractionTotal = daysSessions.reduce((sum, curr) => sum + curr.distractions, 0);
        last7DaysDistractions.push(distractionTotal);
      }

      setChartData({
        labels: last7DaysLabels,
        datasets: [{ data: last7DaysDuration }]
      });

      setDistractionChartData({
        labels: last7DaysLabels,
        datasets: [{ data: last7DaysDistractions }]
      });

    } catch (e) {
      console.error("Veri yükleme hatası:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [theme.dark]) 
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>İstatistikler</Text>

      
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.statValue}>{stats.todayFocus} dk</Text>
          <Text style={styles.statLabel}>Bugün</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.reset }]}>
          <Text style={[styles.statValue, { color: '#555' }]}>{stats.totalFocus} dk</Text>
          <Text style={[styles.statLabel, { color: '#555' }]}>Toplam</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.stop }]}> 
          <Text style={styles.statValue}>{stats.totalDistractions}</Text>
          <Text style={styles.statLabel}>Dikkat D.</Text>
        </View>
      </View>

      
      <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
      {pieData.length > 0 ? (
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig(colors)}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      ) : (
        <Text style={styles.noDataText}>Henüz veri yok. Bir seans tamamlayın!</Text>
      )}

     
      <Text style={styles.chartTitle}>Haftalık Odaklanma (Dk)</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={chartConfig(colors)}
        verticalLabelRotation={0}
        fromZero={true}
        showValuesOnTopOfBars={true}
        style={{ borderRadius: 16 }}
      />

      
      <Text style={styles.chartTitle}>Haftalık Dikkat Dağınıklığı</Text>
      <LineChart
        data={distractionChartData}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          ...chartConfig(colors),
          color: (opacity = 1) => colors.stop ? colors.stop : `rgba(255, 99, 71, ${opacity})`,
          labelColor: (opacity = 1) => colors.text,
        }}
        bezier
        fromZero={true}
        style={{ borderRadius: 16, marginTop: 10 }}
      />
      
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const chartConfig = (colors) => ({
  backgroundGradientFrom: colors.card,
  backgroundGradientTo: colors.card,
  color: (opacity = 1) => `rgba(140, 172, 148, ${opacity})`,
  
  labelColor: (opacity = 1) => colors.text, 
  strokeWidth: 2, 
  barPercentage: 0.5,
  decimalPlaces: 0,
});

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { width: '30%', padding: 15, borderRadius: 10, alignItems: 'center', elevation: 3 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  statLabel: { fontSize: 12, color: '#f0f0f0' },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginTop: 20, marginBottom: 10 },
  noDataText: { textAlign: 'center', color: colors.subText || '#999', marginVertical: 20, fontStyle: 'italic' }
});