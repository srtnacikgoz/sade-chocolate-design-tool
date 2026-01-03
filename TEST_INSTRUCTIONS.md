# Phase 4 Test Senaryosu

## Ön Hazırlık

### 1. Backend'i Başlat (Terminal 1)
```bash
cd backend/functions
npm run build
npm run serve
```

Backend şu adreste çalışacak: `http://localhost:5001/sade-chocolate/us-central1/api`

### 2. Frontend'i Başlat (Terminal 2)
```bash
cd frontend
npm run dev
```

Frontend şu adreste çalışacak: `http://localhost:5173`

---

## Test Senaryosu: AI Workflow'u Baştan Sona Çalıştırma

### Adım 1: Ana Sayfayı Görüntüle
1. Tarayıcıda `http://localhost:5173` aç
2. Ana sayfada 4 özellik kartını göreceksin:
   - 🔍 Trend Analizi
   - 🎨 Görsel Tasarım
   - 📐 Teknik Çizim
   - 💰 Maliyet Hesaplama
3. "Yeni Tasarım Başlat" butonuna tıkla

### Adım 2: Design Studio - Box Seç
1. Design Studio sayfasına yönlendirileceksin
2. Sol tarafta kutu şablonları görünecek:
   - 16'lık Hediye Kutusu
   - 24'lük Hediye Kutusu
   - 9'lu Truffle Kutusu
   - vb.
3. Herhangi bir kutu seç (örn: "16'lık Hediye Kutusu")
4. Sağ tarafta seçtiğin kutunun bilgileri görünecek
5. "Tasarımı Başlat" butonuna tıkla

### Adım 3: Design Detail - Workflow İzle
1. Tasarım detay sayfasına yönlendirileceksin
2. "AI Sürecini Başlat" butonuna tıkla
3. Şimdi 4 adımı izleyebilirsin:

**Beklenen Davranış:**
- Her 5 saniyede bir sayfa otomatik güncellenecek (polling)
- Adımlar sırayla çalışacak:
  1. 🔍 Trend Analizi (2 saniye) - Pazar araştırması
  2. 🎨 Görsel Tasarım (2 saniye) - Renk paleti
  3. 📐 Teknik Çizim (3 saniye) - Die-line SVG
  4. 💰 Maliyet Hesaplama (1 saniye) - Fiyat breakdown

**Progress Bar:**
- 0% → 25% → 50% → 75% → 100%

**Her Adım Tamamlandıkça:**
- Yeşil ✓ işareti görünecek
- Adım detayları sayfada genişleyecek:
  - Trend analizi: Özet + Öneriler
  - Görsel tasarım: Renk paleti (4 renk kartı)
  - Teknik çizim: SVG indirme butonu
  - Maliyet raporu: Birim maliyet + senaryo tablosu

### Adım 4: Sonuçları İncele
Toplam süre: ~8 saniye

Sayfada göreceksin:
- ✅ Durum: "Tamamlandı" (yeşil badge)
- 📊 İlerleme: 100%
- 4 adet genişletilebilir sonuç kartı

---

## API Test (Manuel - cURL ile)

Backend çalışırken başka bir terminalde:

### 1. Design Oluştur
```bash
curl -X POST http://localhost:5001/sade-chocolate/us-central1/api/api/v1/designs \
  -H "Content-Type: application/json" \
  -d '{
    "boxId": "gift-16"
  }'
```

Response'dan `designId`'yi kopyala (örn: `abc123xyz`)

### 2. Workflow Başlat
```bash
curl -X POST http://localhost:5001/sade-chocolate/us-central1/api/api/v1/workflows/start \
  -H "Content-Type: application/json" \
  -d '{
    "designId": "ABC123XYZ_BURAYA_KOPYALADIĞIN_ID"
  }'
```

Response'dan `workflowId`'yi kopyala

### 3. Workflow Durumunu Kontrol Et (3-4 kez tekrarla)
```bash
curl http://localhost:5001/sade-chocolate/us-central1/api/api/v1/workflows/WORKFLOW_ID/status
```

Her seferinde farklı `status` göreceksin:
- `"pending"` → `"running"` → `"completed"`

### 4. Final Design'ı Görüntüle
```bash
curl http://localhost:5001/sade-chocolate/us-central1/api/api/v1/designs/DESIGN_ID
```

Tüm 4 ajan sonucunu göreceksin:
- `trendAnalysis`
- `visualDesign`
- `technicalDrawing`
- `costReport`

---

## Beklenen Console Logları

### Backend Console'da:
```
[Workflow abc123] Başlatılıyor...
[Workflow abc123] Design yüklendi: gift-16
[Workflow abc123] 🔄 trend adımı başlıyor...
[Trend Agent] Pazar analizi yapılıyor...
[Workflow abc123] ✅ trend adımı tamamlandı
[Workflow abc123] 🔄 visual adımı başlıyor...
[Visual Agent] Renk paleti ve görsel öğeler oluşturuluyor...
[Workflow abc123] ✅ visual adımı tamamlandı
[Workflow abc123] 🔄 technical adımı başlıyor...
[Technical Agent] Die-line SVG üretiliyor...
[Workflow abc123] ✅ technical adımı tamamlandı
[Workflow abc123] 🔄 cost adımı başlıyor...
[Cost Agent] Maliyet hesaplaması yapılıyor...
[Workflow abc123] ✅ cost adımı tamamlandı
[Workflow abc123] ✅ Tamamlandı
```

### Frontend Console'da:
```
Starting workflow for design: abc123
Polling started - checking every 5 seconds
Design status: processing
Design status: processing
Design status: processing
Design status: completed
Polling stopped
```

---

## Sorun Giderme

### Backend başlamıyorsa:
```bash
# Firebase emulator yüklü değilse:
npm install -g firebase-tools

# Veya direkt functions çalıştır:
cd backend/functions
npm run serve
```

### Port çakışması varsa:
- Frontend: `http://localhost:5173` yerine `5174` olabilir
- Backend: `5001` yerine `5000` olabilir

### CORS hatası alırsan:
Backend CORS middleware zaten ekli, ama eğer hata alırsan:
- Frontend `.env` dosyasında `VITE_API_BASE_URL` kontrol et
- Backend `cors.ts` dosyasında `localhost:5173` izni var mı kontrol et

---

## Başarı Kriterleri

✅ Backend API yanıt veriyor
✅ Frontend sayfalar yükleniyor
✅ Box seçimi yapılabiliyor
✅ Design oluşturuluyor
✅ Workflow başlatılabiliyor
✅ 4 adım sırayla tamamlanıyor (~8 saniye)
✅ Sonuçlar UI'da görüntüleniyor
✅ Progress bar %100'e ulaşıyor

---

## İleri Seviye Test

### Pause/Resume Test:
1. Workflow başlat
2. 2-3 saniye sonra "Güncellemeyi Durdur" butonuna tıkla
3. Backend'de workflow pause endpoint'ini çağır:
```bash
curl -X POST http://localhost:5001/.../workflows/WORKFLOW_ID/pause
```
4. Resume endpoint'i ile devam ettir:
```bash
curl -X POST http://localhost:5001/.../workflows/WORKFLOW_ID/resume
```

### Çoklu Tasarım Test:
1. 3-4 farklı box için tasarım oluştur
2. Hepsini aynı anda çalıştır
3. Design Studio'dan listeyi görüntüle

---

## Video Kayıt Önerisi

Test yaparken ekran kaydı al, böylece:
- Workflow animation'ını görebiliriz
- Progress bar transition'ını izleyebiliriz
- Renk paletlerinin görünümünü kontrol edebiliriz
