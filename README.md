# ODAKTAKİP

Bu proje bir odaklanma ve zaman takip mobil uygulamasıdır.  
Kullanıcıların belirli bir süre boyunca odaklanmasını, dikkat dağınıklıklarını kaydetmesini ve çalışma istatistiklerini görüntülemesini amaçlar.

Uygulama React Native (Expo) kullanılarak geliştirilmiştir.

## Projenin Amacı
- Kullanıcının odaklanarak çalışmasını teşvik etmek
- Çalışma süresini ve dikkat dağınıklığını kayıt altına almak
- Günlük ve haftalık istatistikleri grafiklerle göstermek
- Açık / koyu tema desteği sunmak

##  Özellikler
- Ayarlanabilir odaklanma zamanlayıcısı
- Kategori seçimi (Ders Çalışma, Kodlama, Proje, Kitap Okuma)
- Dikkat dağınıklığı sayacı
- Günlük ve haftalık raporlar
- Açık / Koyu tema desteği
- Verilerin cihazda saklanması (AsyncStorage)

## Kullanılan Teknolojiler
- React Native
- Expo
- React Navigation
- AsyncStorage
- react-native-svg
- react-native-chart-kit


##  Kurulum ve Çalıştırma

1. Projeyi bilgisayarınıza klonlayın:
```bash
https://github.com/fselmakpnr/mobil-proje
2. Proje klasörüne girin: 
cd odakTakip
3. Gerekli paketleri yükleyin:
npm install
4. Uygulamayı çalıştırın:
npx expo start

Zamanlayıcı (HomeScreen): Odak süresi başlatma, durdurma ve sıfırlama
Raporlar (ReportScreen): Günlük ve haftalık grafikler ve kategori dağılımı

ODAKTAKIP
│
├── assets
├── context
│   └── themeContext.js
├── screens
│   ├── homeScreen.js
│   └── reportScreen.js
├── App.js
├── app.json
├── package.json
