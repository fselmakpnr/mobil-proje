import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const [stats, setStats] = useState({
    todayFocus: 0,
    totalFocus: 0,
    totalDistractions: 0
  });
  const [chartData, setChartData] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  
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
      const pData = Object.keys(categoryCounts).map((key, index) => ({
        name: key,
        population: categoryCounts[key],
        color: pieColors[index % pieColors.length],
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
      }));
      setPieData(pData);

    
      if (sessions.length > 0) {
        setChartData({
          labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
          datasets: [{ data: [20, 45, 28, 80, 99, 43, 50] }] 
        });
      }

      setLoading(false);

    } catch (e) {
      console.error(e);
    }
  };

  
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>İstatistikler</Text>

      {/* İstatistik Kartları */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#8CAC94' }]}>
          <Text style={styles.statValue}>{stats.todayFocus} dk</Text>
          <Text style={styles.statLabel}>Bugün</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F5E8A6' }]}>
          <Text style={[styles.statValue, { color: '#555' }]}>{stats.totalFocus} dk</Text>
          <Text style={[styles.statLabel, { color: '#555' }]}>Toplam</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#BC6C6C' }]}>
          <Text style={styles.statValue}>{stats.totalDistractions}</Text>
          <Text style={styles.statLabel}>Dikkat K.</Text>
        </View>
      </View>

      <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
      {pieData.length > 0 ? (
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      ) : (
        <Text style={styles.noDataText}>Henüz veri yok. Bir seans tamamlayın!</Text>
      )}

      <Text style={styles.chartTitle}>Haftalık Odaklanma</Text>
      <BarChart
        data={chartData || {
          labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
          datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
        }}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix="dk"
        chartConfig={chartConfig}
        verticalLabelRotation={0}
        style={{ borderRadius: 16 }}
      />
      
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(140, 172, 148, ${opacity})`, 
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2, 
  barPercentage: 0.5,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF3E0', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#555', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { width: '30%', padding: 15, borderRadius: 10, alignItems: 'center', elevation: 3 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  statLabel: { fontSize: 12, color: '#f0f0f0' },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#555', marginTop: 10, marginBottom: 10 },
  noDataText: { textAlign: 'center', color: '#999', marginVertical: 20, fontStyle: 'italic' }
});