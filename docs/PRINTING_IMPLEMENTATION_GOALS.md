# Sade Chocolate Tasarım Aracı
## Offset Baskı Araştırması Sonucu Yapılacaklar ve Hedefler

> **Kaynak**: [PRINTING_REFERENCE.md](./PRINTING_REFERENCE.md)
> **Tarih**: 2026-01-04
> **Durum**: Implementation Planning

---

## 📋 Executive Summary

Offset baskı araştırması sonucunda, **Sade Chocolate Tasarım Aracı**'nın mevcut SVG generator'ını production-ready, Türk matbaalara direkt gönderilebilir dosyalar üretecek şekilde upgrade etmemiz gerekiyor.

**Kritik bulgular:**
- Mevcut SVG output yeterli DEĞİL (sadece preview seviyesi)
- PDF/X-1a veya PDF/X-4 export zorunlu
- CMYK color space + FOGRA39/51 profile gerekli
- 3mm bleed, TrimBox/BleedBox tanımları eksik
- Die line layer organizasyonu yapılandırılmalı

---

## 🎯 Ana Hedefler (Priority Order)

### 1. PDF/X-1a Export Implementasyonu
**Öncelik:** 🔴 CRITICAL
**Süre Tahmini:** 3-4 saat
**Açıklama:** React app'ten print-ready PDF/X-1a dosyası üretme

**Gereklilikler:**
- [ ] PDF/X-1a:2001 veya PDF/X-4:2010 uyumlu export
- [ ] FOGRA39 veya FOGRA51 ICC profile embedding
- [ ] TrimBox ve BleedBox metadata doğru tanımlanmalı
- [ ] Font embedding %100 (veya outline conversion)
- [ ] Output intent embedded olmalı

**Kütüphane araştırması gerekli:**
- `jsPDF` - PDF/X support var mı?
- `PDFKit` - Color profile embedding?
- `pdf-lib` - Metadata manipulation?
- Ya da backend'de Node.js ile PDF generation? (Puppeteer + Chrome headless?)

---

### 2. CMYK Color Space Conversion
**Öncelik:** 🔴 CRITICAL
**Süre Tahmini:** 2-3 saat
**Açıklama:** Tüm renkleri RGB'den CMYK'ye dönüştürme

**Gereklilikler:**
- [ ] SVG generator'da CMYK mode
- [ ] RGB to CMYK conversion function (ICC profile-based)
- [ ] Total ink coverage kontrolü (≤300-330%)
- [ ] Rich black definition (C60 M40 Y40 K100 for large areas)
- [ ] 100% K for black text (not rich black)

**Kütüphane araştırması:**
- `colorjs.io` - CMYK support?
- `color-convert` - Accurate RGB → CMYK?
- Custom ICC profile transformation implementation?

---

### 3. Bleed ve Safety Zone Implementation
**Öncelik:** 🟠 HIGH
**Süre Tahmini:** 2 saat
**Açıklama:** Automatic bleed ve safety zone calculation

**Gereklilikler:**
- [ ] Box dimensions + 3mm bleed otomatik hesaplama
- [ ] Safety zone (trim'den 3-5mm içeride) markup
- [ ] Artwork'ün bleed'e uzanması kontrolü
- [ ] Critical content'in safety zone içinde olması kontrolü

**Visual feedback:**
- [ ] Tasarım ekranında bleed ve safety zone çizgileri göster
- [ ] User'a hangi elemanların safety zone dışında olduğunu uyar
- [ ] Preview mode: "Trim view" vs "Full bleed view"

---

### 4. Die Line Layer Organizasyonu
**Öncelik:** 🟠 HIGH
**Süre Tahmini:** 3 saat
**Açıklama:** Proper layer structure export

**Gereklilikler:**
- [ ] **Layer 1:** Die Line (Spot color "Dieline" veya "Cut", 0.25-0.5pt stroke)
- [ ] **Layer 2:** Crease/Fold Lines (Spot color "Crease", dashed)
- [ ] **Layer 3:** Technical Marks (Registration marks, crop marks)
- [ ] **Layer 4:** Spot Finishes (Varnish, foil areas - eğer kullanılıyorsa)
- [ ] **Layer 5:** Artwork/Graphics (CMYK)
- [ ] **Layer 6:** Background

**Export logic:**
- [ ] Print PDF'de die line layer'ı EXCLUDE et
- [ ] Separate die line dosyası export (overprint set)
- [ ] Production package: Print PDF + Die line PDF

---

### 5. Resolution ve Image Quality Control
**Öncelik:** 🟡 MEDIUM
**Süre Tahmini:** 1-2 saat
**Açıklama:** 300 PPI minimum resolution enforcement

**Gereklilikler:**
- [ ] User-uploaded images için 300 PPI check
- [ ] Scaling kontrolü (max %120)
- [ ] Effective resolution calculation: `Original PPI ÷ Scale Factor`
- [ ] Low-resolution warning sistem

**Upload validation:**
```javascript
if (effectivePPI < 300) {
  warn("Bu görsel baskı için çok düşük çözünürlüklü. Minimum 300 PPI gerekli.");
}
```

---

### 6. Registration Marks ve Crop Marks
**Öncelik:** 🟡 MEDIUM
**Süre Tahmini:** 2 saat
**Açıklama:** Professional print marks ekleme

**Gereklilikler:**
- [ ] Crop marks (8-10mm length, 0.25pt line weight)
- [ ] Registration marks (slug area'da, bleed'den 3-4mm offset)
- [ ] Color bars (CMYK solid patches, tint patches)
- [ ] Tüm marks Registration color'da (100% all CMYK)

---

### 7. Food-Safe Compliance Metadata
**Öncelik:** 🟢 LOW (Documentation)
**Süre Tahmini:** 1 saat
**Açıklama:** Gıda temas uyumluluk bilgileri

**Gereklilikler:**
- [ ] PDF metadata'ya "Food Contact Compliant" flag ekle
- [ ] "FDA 21 CFR 176.170" ve "EU EC 1935/2004" notları
- [ ] Material specification sheet template (user'a verilebilir)

---

### 8. Turkish Printing Facility Presets
**Öncelik:** 🟢 LOW (User Experience)
**Süre Tahmini:** 2 saat
**Açıklama:** GS Packaging, Duran Doğan, OMAKS presets

**UI Enhancement:**
- [ ] "Export for:" dropdown
  - [ ] GS Packaging (Istanbul)
  - [ ] Duran Doğan Basım
  - [ ] OMAKS Packaging
  - [ ] Custom/Generic (FOGRA39 default)

Her preset için:
- Preferred color profile
- Specific file naming convention
- Contact info ve delivery instructions

---

## 🚀 Phase Planning

### Phase 1: Core Printing Compliance (Week 1)
**Must-Have Features:**
1. PDF/X-1a Export
2. CMYK Color Space Conversion
3. Bleed ve Safety Zone

**Deliverable:** Production-ready PDF export capability

---

### Phase 2: Professional Print Features (Week 2)
**Must-Have Features:**
4. Die Line Layer Organization
5. Resolution Control
6. Registration Marks

**Deliverable:** Matbaa-ready complete package

---

### Phase 3: Polish & Documentation (Week 3)
**Nice-to-Have Features:**
7. Food-Safe Compliance Metadata
8. Turkish Printing Facility Presets

**Deliverable:** User-friendly export system + Documentation

---

## 🛠️ Technical Implementation Stack

### Frontend Enhancements

**Libraries to Research:**
- `jsPDF` + `jspdf-autotable` - PDF/X support?
- `pdf-lib` - Metadata manipulation
- `colorjs.io` - CMYK conversion
- `fabricjs` - Layer management improvements

### Backend Additions

**New Services Needed:**
- `pdfGenerationService.ts` - PDF/X compliant generation
- `colorProfileService.ts` - CMYK conversion + ICC profiles
- `printValidationService.ts` - Pre-flight checks

**Potential Node.js libraries:**
- `pdfkit` - PDF generation with ICC profile embedding
- `sharp` - Image processing + resolution validation
- `puppeteer` - Headless Chrome for complex PDF rendering

---

## 📊 Success Criteria

### Minimum Viable Product (MVP)

✅ **Export edilen PDF:**
- PDF/X-1a uyumlu
- CMYK color space
- 3mm bleed dahil
- 300 PPI minimum resolution
- TrimBox ve BleedBox tanımlı

✅ **Validation:**
- Türk matbaalara gönderildiğinde **revizyon istenmemeli**
- GS Packaging veya Duran Doğan test approval'ı almalı

### Stretch Goals

🎯 **Advanced Features:**
- Spot color support (Pantone)
- Hot foil area definition
- Emboss area definition
- Multi-page box template support (inner lid + outer box)

---

## 🔍 Pre-Flight Check System

### Automated Validation (Implementation Önerisi)

User "Export for Print" butonuna bastığında:

```
✓ PDF/X-1a compliance: PASS
✓ Color space: CMYK (FOGRA39)
✓ Bleed: 3mm on all sides
✓ Image resolution: 300+ PPI
✓ Font embedding: 100%
✓ Total ink coverage: 285% (within limit)
✓ Die line layer: Properly separated
⚠ Warning: 1 element outside safety zone (Logo on lid)
✗ Error: RGB color detected in artwork layer
```

User error'ları fixlemeden export edemez.

---

## 💼 Matbaa İlişkileri ve Test

### Önerilen Yaklaşım:

1. **GS Packaging (Istanbul) ile iletişim:**
   - Test batch order (500-1000 adet)
   - File format feedback al
   - Approval süreci nasıl çalışıyor?

2. **Sample production run:**
   - İlk 1-2 tasarımı gerçek baskıya gönder
   - Quality control feedback topla
   - Iterate based on matbaa requirements

3. **Documentation:**
   - "How to Order from Turkish Printers" guide
   - File delivery checklist
   - Common rejection reasons ve çözümleri

---

## 📈 Metrics to Track

### Implementation Progress
- [ ] PDF/X-1a export functional
- [ ] CMYK conversion accuracy (ΔE < 2 for brand colors)
- [ ] Zero file rejection rate from printers
- [ ] User satisfaction (export süresi, ease of use)

### Production Metrics
- Lead time from design to print (target: 5-7 days rush, 15-20 standard)
- Cost per unit at different batch sizes
- Quality defect rate (AQL compliance)

---

## 🎓 Team Training Needs

1. **Offset printing basics** (1 saat training)
2. **Color management** (CMYK vs RGB, ICC profiles)
3. **PDF/X standards** anlamak
4. **Matbaa terminology** (Türkçe - İngilizce)

---

## 💰 Cost Estimation

### Development Costs
- Phase 1: ~24 saat development
- Phase 2: ~16 saat development
- Phase 3: ~8 saat development + documentation

**Total:** ~48 saat development effort

### External Costs
- Test printing batch: ~₺2,000-5,000 (500 units)
- Matbaa consultation fee (if any)
- ICC profile licensing (if required)

---

## 📝 Next Immediate Actions

1. **Araştırma:** PDF/X-1a generation için en iyi library seçimi
2. **Prototype:** Basit box template için PDF/X-1a export
3. **Validation:** Export edilen PDF'i Adobe Acrobat Preflight ile test et
4. **Matbaa iletişimi:** GS Packaging ile toplantı ayarla

---

**Son Güncelleme:** 2026-01-04
**Sorumlu:** Development Team
**Durum:** Planning Complete - Ready for Implementation
