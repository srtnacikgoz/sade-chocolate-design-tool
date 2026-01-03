# Sade Chocolate Tasarım Aracı

AI destekli lüks çikolata kutusu tasarım platformu. Sade Chocolate markası için otomatik kutu tasarımı, teknik çizim üretimi ve maliyet hesaplama aracı.

## 🎯 Proje Özellikleri

- 🎨 **AI Destekli Tasarım**: 4 uzman AI ajanı ile otomatik tasarım pipeline
- 📐 **SVG Die-Line Üretimi**: Baskıya hazır teknik çizimler
- 💰 **Maliyet Hesaplama**: Gerçek zamanlı fiyatlandırma ve senaryo analizi
- 🔄 **Hybrid Mimari**: Web arayüzü + REST API
- 🔗 **Entegrasyonlar**: Notion (versiyon yönetimi) + Google Sheets (fiyat verisi)

## 🛠️ Teknoloji Stack

**Frontend:** React 18 + TypeScript + Vite + TailwindCSS + Zustand
**Backend:** Node.js 18 + Express + Firebase Functions
**Database:** Firestore + Firebase Storage
**AI:** Claude Code Agents (4 uzman ajan)

## 📦 Kurulum

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend/functions
npm install
npm run build

# Firebase Emulators
firebase emulators:start
```

## 🚀 Development

Frontend: http://localhost:5173
Backend API: http://localhost:5001
Emulator UI: http://localhost:4000

## 📊 Implementation Status

✅ **PHASE 1: Foundation** (TAMAMLANDI)
- Monorepo yapısı
- React + TypeScript + Tailwind
- Firebase konfigürasyonu
- Type definitions
- AI agents (4/4)
- Seed data

⬜ **PHASE 2-8**: Devam edecek...

## 📖 Daha Fazla Bilgi

Detaylı dokümantasyon için `/Users/sertanacikgoz/.claude/plans/keen-kindling-rocket.md` dosyasına bakın.

## 🏢 Sade Chocolate

Web: sadechocolate.com
