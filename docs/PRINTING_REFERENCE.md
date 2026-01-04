# Professional Chocolate and Pastry Box Manufacturing
## Complete Technical Specifications for Offset Printing

> **Kaynak**: Kapsamlı Offset Baskı Araştırması
> **Güncelleme**: 2026-01-04
> **Kapsam**: Türkiye ve AB standartları

---

## 📋 İçindekiler

1. [Offset Baskı Süreci ve Renk Spesifikasyonları](#offset-baskı-süreci)
2. [PDF/X Standartları ve Dosya Hazırlığı](#pdfx-standartları)
3. [Bleed, Trim ve Safety Zone](#bleed-trim-safety)
4. [Die-Cutting Toleransları](#die-cutting)
5. [Kutu Yapı Tipleri ve ECMA/FEFCO Standartları](#kutu-yapıları)
6. [Malzeme Spesifikasyonları](#malzeme-spesifikasyonları)
7. [Gıda Temas Düzenlemeleri](#gıda-temas-düzenlemeleri)
8. [Yüzey İşlemleri](#yüzey-işlemleri)
9. [Kalite Kontrol ve Test Standartları](#kalite-kontrol)
10. [Türkiye Üretim Kapasiteleri](#türkiye-üretim)
11. [Matbaaya Hazır Dosya Kontrol Listesi](#checklist)

---

## Offset Baskı Süreci ve Renk Spesifikasyonları {#offset-baskı-süreci}

### ISO 12647-2:2013 Standartları

Modern offset baskı **ISO 12647-2:2013** standardını takip eder. Bu standart, plaka oluşturmadan final çıktıya kadar tüm süreci yönetir.

**Standart baskı sırası:** Black → Cyan → Magenta → Yellow (KCMY)

Her renk için ayrı **alüminyum CTP (Computer-to-Plate)** görüntüleme gerekir:
- **Minimum çözünürlük:** 2540 DPI

### Kritik Renk Parametreleri

| Parametre | Coated Paper | Uncoated Paper | Tolerans |
|-----------|--------------|----------------|----------|
| Cyan density | 1.45 | 1.10 | ±0.10 |
| Magenta density | 1.45 | 1.15 | ±0.10 |
| Yellow density | 1.00 | 0.95 | ±0.07 |
| Black density | 1.70 | 1.30 | +0.20/-0.05 |
| **Total Ink Coverage** | **≤330%** | **≤300%** | Maximum limit |

### Renk Doğruluğu

- **Standart ticari iş:** ΔE < 5
- **Premium marka renkleri:** ΔE < 2
- **Halftone screening:** 150-175 LPI (coated packaging cardboard)

**Standart screen açıları:**
- Cyan: 15°
- Magenta: 75°
- Yellow: 0°
- Black: 45°

### Tone Value Increase (Dot Gain)

50% midtone'da:
- **Coated paper:** 14-16%
- **Uncoated substrates:** 18-20%

**ICC Profile kompensasyonu gerekli:**
- **Avrupa:** FOGRA39 veya FOGRA51
- **Kuzey Amerika:** GRACoL 2006

---

## Gıda Güvenli Mürekkep Gereksinimleri

Tüm gıda ambalajı ile temas eden mürekkepler:
- **EuPIA** (European Printing Ink Association) yönergelerine uymalı
- **FDA 21 CFR 175.105** veya **EU EC 1935/2004** standartlarını karşılamalı

### Kritik Spesifikasyonlar

| Gereklilik | Değer/Standart |
|------------|----------------|
| Migration limit | ≤10 ppb (non-evaluated substances, EU) |
| Migration limit | ≤0.5 ppb (FDA-listed specific substances) |
| **Yasaklı maddeler** | CMR materials, heavy metals, certain photoinitiators |
| **Low-migration inks** | Birincil gıda ambalajı için zorunlu |
| **Functional barrier** | Geleneksel mürekkep kullanımında gerekli (aluminum foil, PET film, özel kaplamalar) |

---

## PDF/X Standartları ve Dosya Hazırlığı {#pdfx-standartları}

### PDF/X-1a vs PDF/X-4

**Baskıya hazır dosyalar** şu standartlardan birine uymalı:
- **PDF/X-1a:2001** (en güvenli, maksimum uyumluluk)
- **PDF/X-4:2010** (modern workflow, transparency desteği)

| Spesifikasyon | PDF/X-1a:2001 | PDF/X-4:2010 |
|---------------|---------------|--------------|
| Color spaces | CMYK + Spot only | CMYK, RGB, LAB, ICC-based |
| Transparency | Must be flattened | Native support |
| Layers | Flattened | Preserved |
| PDF version | 1.3/1.4 | 1.6 |
| Font embedding | 100% required | 100% required |
| Output intent | Required | Required (must embed ICC) |

**Öneri:** PDF/X-1a Türk ve Avrupa matbaaları için en güvenli seçimdir. Tüm renkleri CMYK'ye dönüştürür ve transparency'yi düzleştirir.

### PDF Box Tanımları

Her baskıya hazır PDF şu box'ları doğru tanımlamalı:

- **MediaBox:** Tüm markalar ve slug area dahil tam doküman
- **TrimBox:** Final kesim boyutu (bitmiş kutu ölçüleri)
- **BleedBox:** TrimBox + bleed miktarı (tipik olarak TrimBox'tan tüm taraflarda 3-5mm daha büyük)

**Örnek:**
- 100×150mm panel boyutu + 3mm bleed için:
  - TrimBox: 100×150mm
  - BleedBox: 106×156mm

---

## Çözünürlük ve Görsel Gereksinimleri

| İçerik Tipi | Minimum | Önerilen | Maximum Useful |
|-------------|---------|----------|----------------|
| Continuous tone images | 250 PPI | **300 PPI** | 450 PPI |
| Images with embedded text | 350 PPI | **400 PPI** | 450 PPI |
| Line art/barcodes | 800 PPI | **1200 PPI** | 3600 PPI |

**Temel formül:**
`Image Resolution = LPI × 2`

175 LPI ambalaj baskısı için görüntüler **minimum 350 PPI** gerektirir (final output size'da).

**Scaling kuralı:**
`Effective Resolution = Original PPI ÷ Scale Factor`

⚠️ Görselleri layout yazılımında **%120'den fazla büyütmeyin**.

---

## Bleed, Trim ve Safety Zone Spesifikasyonları {#bleed-trim-safety}

| Zone | Metric Standard | Imperial Equivalent | Amaç |
|------|-----------------|---------------------|------|
| **Bleed extension** | 3mm (5mm for die-cut) | 0.125" (0.25" for die-cut) | Artwork beyond trim |
| **Trim line** | Final dimensions | Final dimensions | Cut location |
| **Safety margin** | 3-5mm inside trim | 0.125-0.25" | Protects critical content |

### Kurallar

✅ **Kenar kadar gitmesi gereken tüm tasarım elemanları:**
- Trim line'dan **minimum 3mm** dışarı uzanmalı

✅ **Kritik text, logolar ve içerik:**
- Trim line'dan **5mm içeride** kalmalı (kesim varyansını karşılar)

✅ **Die-cut ambalajlar (düzensiz şekiller):**
- Bleed'i **5-6mm**'ye uzatın

---

## Registration Marks ve Printer Marks Yerleşimi

- **Slug area'da** (bleed dışında) yerleştirilmeli
- Bleed kenarından **9-12 point (3-4mm)** offset
- **Crop marks:** 8-10mm uzunluk, 0.25pt minimum line weight
- **Registration color** kullanılmalı (100% all CMYK values) - her separation plate'de görünür

**Standard color bars:**
- Trim area dışında
- Tipik olarak gripper edge boyunca
- İçerik: CMYK solid patches, 25/50/75% tint patches, gray balance verification strips

---

## Die-Cutting Toleransları ve Yapısal Kutu Tasarımı {#die-cutting}

### Kritik Boyutsal Toleranslar

| Spesifikasyon | Steel Rule Die | Solid Milled Die |
|---------------|----------------|------------------|
| General tolerance | ±0.25-0.38mm | ±0.13-0.25mm |
| High-precision work | ±0.13mm | ±0.025-0.05mm |
| **Packaging industry standard** | **±1.0mm** | **±0.5mm** |

### Steel Rule Die Spesifikasyonları

- **Standard rule thickness:** 2-point (0.028" / 0.71mm)
- **Standard rule height:** 0.937" (23.8mm)
- **Bevel type:** Center bevel (longest wear, best dulling resistance)
- **Material:** Stainless steel (gıda uygulamaları için - sterilize edilebilir)

---

## Creasing (Katlama Çizgisi) Spesifikasyonları

Creasing, lif kırılması olmadan temiz, tutarlı katlamalar sağlar.

**Standart creasing rule genişliği:** 0.71mm

**Groove genişliği formülü:**
`Groove Width = (Cardboard Thickness × 1.5) + Creasing Rule Width`

**Örnek:** 0.4mm kalınlıkta mukavva için:
`Groove = (0.4 × 1.5) + 0.71 = 1.31mm groove width`

- Yaklaşık **0.7mm shrinkage reserve** ekleyin (kalın mukavva için daha fazla)
- **Kağıt grain** ana creasing çizgilerine dik olmalı (kabarmayı önler)

---

## Perforation (Delme) Spesifikasyonları

| Cut:Tie Ratio | Uygulama | Tear Resistance |
|---------------|----------|-----------------|
| 2:1 | Weakest—push-out shapes | Very easy tear |
| 3:1 | Standard tear-off panels | Normal resistance |
| 4:1 | Robust panels | Higher resistance |

**Standard tie dimension:** 0.032" with 30+ TPI (teeth per inch) for micro-perforating

---

## Kutu Yapı Tipleri ve ECMA/FEFCO Standartları {#kutu-yapıları}

### ECMA Kodları (Folding Cartons)

ECMA sistemi **8 haneli format** kullanır: `X00.00.00.00`

**Harf fundamental yapıyı belirtir:**

- **A-group:** Rectangular boxes with longitudinal seam (çikolata kutuları için en yaygın)
- **B-group:** Tray types without longitudinal gluing
- **F-group:** Special constructions (pillow boxes dahil)

**Yaygın çikolata kutusu kodları:**
- `A20.20.03.01` - Standard tuck-in flap
- `A60.20.00.01` - Tuck top auto bottom
- `A60 series` variations - Auto-lock bottom boxes

---

## Standart Çikolata Kutu Ölçüleri

| Kapasite | Dimensions (L × W × H) | Metric Equivalent |
|----------|------------------------|-------------------|
| 2 pieces | 1⅜" × 1 7/16" × 2¾" | 35 × 37 × 70mm |
| 4 pieces | 2¾" × 1 7/16" × 2¾" | 70 × 37 × 70mm |
| 6 pieces | 2¾" × 1 7/16" × 4⅛" | 70 × 37 × 105mm |
| 12 pieces | 4⅛" × 1" × 6⅛" | 105 × 25 × 156mm |
| Chocolate bar | 2.2" × 6.12" × 0.74" | 56 × 155 × 19mm |

---

## Dieline Layer Organizasyonu

Tasarım dosyalarında doğru layer yapısı kritiktir:

1. **Die Line** (top layer) — Spot color "Dieline" veya "Cut", 0.25-0.5pt stroke
2. **Crease/Fold Lines** — Spot color "Crease", dashed line style
3. **Technical Marks** — Registration, crop marks
4. **Spot Finishes** — Varnish, foil, white ink areas
5. **Artwork/Graphics** — CMYK design elements
6. **Background** (bottom layer)

⚠️ **Önemli:** Die line layer'ları:
- **Overprint** olarak ayarlanmalı
- **Ayrı dosya olarak export edilmeli**
- Final üründe basılmamalı ama die oluşturmayı yönlendirmeli

---

## Malzeme Spesifikasyonları {#malzeme-spesifikasyonları}

### Paperboard Grades ve GSM Spesifikasyonları

| GSM Range | Caliper | Uygulama |
|-----------|---------|----------|
| 250-300 gsm | 0.30-0.42mm | Standard food packaging, bakery boxes |
| 300-350 gsm | 0.36-0.50mm | **Premium chocolate boxes, pastry boxes** |
| 350-450 gsm | 0.42-0.60mm | Luxury packaging, rigid box wraps |

### Paperboard Tipleri

**GC1 (Coated White Back):**
- Virgin fiber, triple-coated topside
- Premium çikolatalar için ideal
- Tam EU ve FDA gıda temas uyumlu

**GC2 (Cream Back):**
- Virgin fiber with uncoated reverse
- Mükemmel katlama özellikleri
- Standart çikolata ambalajı için en yaygın (200-450 gsm)

**SBS (Solid Bleached Sulfate):**
- 100% virgin bleached pulp
- Beyaz throughout
- Luxury uygulamalar için üstün baskılabilirlik

---

## Çikolata Koruma için Barrier Özellikleri

Çikolata koruması gerektiren faktörler:
- **Nem** (sugar bloom'a neden olur)
- **Oksijen** (fat bloom'a neden olur)
- **Dış kokular**

**Barrier spesifikasyonları:**

| Özellik | Değer |
|---------|-------|
| Moisture (MVTR) | <150 g/m²/day for coated paperboard |
| Oxygen barrier | EVOH/PE multilayer structures (uzatılmış raf ömrü için) |
| Grease resistance | Kit rating 0-12 (yüksek = daha iyi) |
| PFAS-free compliance | Fluorine-free dispersion coatings mevcut |

---

## Gıda Temas Düzenlemeleri {#gıda-temas-düzenlemeleri}

### FDA Regulations (21 CFR 176.170 ve 176.180)

**FDA 21 CFR 176.170:** Aqueous ve fatty gıda teması için kağıt ve mukavvayı yönetir.

**Ana gereklilikler:**

| Gereklilik | Değer |
|------------|-------|
| Chloroform-soluble extractives | ≤0.5 mg/in² (water, heptane, 8% ethanol at 25°C) |
| No migration threshold | <50 parts per billion (migrate etmemesi beklenen maddeler için) |
| Food types | I-VIII sınıflandırması (acidity, water activity, fat content) |
| Conditions of use | A-H sınıflandırması (temperature exposure during filling/storage) |

---

### EU Regulations (EC 1935/2004 ve EU 10/2011)

AB framework Türkiye'den Avrupa pazarlarına tüm ihracatlara uygulanır:

| Spesifikasyon | Değer |
|---------------|-------|
| **Overall Migration Limit (OML)** | 10 mg/dm² or 60 mg/kg food |
| Infant packaging | Stricter 60 mg/kg limit (zorunlu) |
| Specific Migration Limits | Annex I'de substance-specific değerler (1,000+ substances) |
| Primary Aromatic Amines | 0.002 mg/kg LOD'de tespit edilmemeli |

---

### Türkiye Düzenleme Uyumu

**Turkish food contact regulations** (Notification No. 2019/44):
- **EU Regulation 10/2011 ile tamamen harmonize**
- AB standartlarını karşılayan ürünler otomatik olarak Türk gerekliliklerini karşılar
- **Declaration of Compliance (DoC)** ve traceability documentation zorunlu

---

## Yüzey İşlemleri Spesifikasyonları {#yüzey-işlemleri}

### Lamination Seçenekleri

| Tip | Kalınlık | Karakteristikler |
|-----|----------|------------------|
| **Gloss lamination** | 12-25μm | Parlak, renk kontrastını artırır |
| **Matte lamination** | 15-25μm | Yansımasız, sofistike |
| **Soft-touch lamination** | 18-35μm | Kadifemsi dokunuş, premium his |

**Standart gıda ambalajı:** 20-50μm PE lamination films kullanır
⚠️ Tüm filmler gıda teması için FDA-compliant olmalı

---

### Varnishing Spesifikasyonları

**UV coating:**
- **Application:** 2.5-4.0 g/m² dry weight
- **Curing:** 200-500 mJ/cm² UV energy altında anında
- **Food contact compliance:** FCN 772 (FDA 21 CFR 176.170)

**Spot UV:**
- **Thickness:** 2-80 microns
  - Standard spot UV (2-5μm): Subtle sheen
  - Raised spot UV (20-80μm): Tactile effects
- **Minimum element spacing:** 2mm
- **Registration accuracy:**
  - Offset application: ±0.5-1.0mm
  - Digital: ±0.1mm

---

### Hot Foil Stamping Parametreleri

| Substrate | Temperature | Pressure | Dwell Time |
|-----------|-------------|----------|------------|
| Paper (general) | 90-130°C | 100-300 PSI | 1-2 seconds |
| Paper (fine detail) | 90-120°C | Lower end | Shorter |
| Coated cardboard | 100-140°C | Medium | 1-2 seconds |

---

### Embossing Derinlik Spesifikasyonları

**300-400 GSM kağıt için:**
- **Embossing depth:** 0.5-2.0mm
- **Minimum mesafe:** Creasing/folding alanlarından 4mm
- **Cavity-to-punch clearance tolerance:** ±0.05mm

---

## Kalite Kontrol ve Test Standartları {#kalite-kontrol}

### Renk Tolerans Spesifikasyonları (ISO 12647-2)

| Metric | Standard Tolerance | Premium Tolerance |
|--------|-------------------|-------------------|
| Solid ink patches | ΔE < 5 | ΔE < 2 |
| Primary colors | ΔE < 5 average | ΔE < 3 average |
| Proof-to-print match | ΔE < 5 | ΔE < 3 |
| **Brand spot colors** | **ΔE < 3** | **ΔE < 2** |

**Öneri:** CIE Delta E 2000 (ΔE00) formülü kullanın (en doğru insan algısı korelasyonu)

---

### AQL (Acceptable Quality Level) Standartları

| Defect Category | AQL Value | Examples |
|-----------------|-----------|----------|
| **Critical** | 0.0-0.065 | Food contamination, safety hazards |
| **Major** | 0.4-2.5 | Color variation, misregistration, unreadable barcodes |
| **Minor** | 2.5-4.0 | Minor scratches, slight color variation within tolerance |

**Normal Inspection Level II:**
1,000 birimlik lot için 80 birimlik sample gerekir

**AQL 2.5'te:**
- Accept ≤5 defects
- Reject ≥6 defects

---

### Strength Testing Standartları

| Standard | Test Type | Range |
|----------|-----------|-------|
| **ISO 2758** | Paper burst strength | 70-1,400 kPa |
| **ISO 2759** | Board burst strength | 350-5,500 kPa |
| **ASTM D5264** | Sutherland rub test | 10-100 strokes at 2-4 lb weight |

---

## Türkiye Üretim Kapasiteleri {#türkiye-üretim}

### Tam Üretim Timeline'ı

| Aşama | Standart Süre | Rush Süre |
|-------|---------------|-----------|
| Prepress/proofing | 2-3 days | 1 day |
| CTP plate making | 4-8 hours | 2-4 hours |
| **Printing** | 1-3 days | Same day possible |
| Lamination | 1 day | Same day |
| Die-cutting | 1-2 days | Same day |
| Folding/gluing | 1-2 days | Same day |
| **TOPLAM** | **15-20 working days** | **5-7 working days** |

**Modern offset press performansı:**
- **Heidelberg XL 106:** 18,000-21,000 sheets/hour
- **Makeready time:** 6-16 minutes (automated systems)

---

### Ekonomik Batch Büyüklükleri

| Adet | Maliyet Durumu |
|------|----------------|
| 500-1,000 sheets | Offset printing cost-effective başlangıç |
| 3,000+ units | Significant per-unit savings başlar |
| **5,000-10,000 units** | **Sweet spot** - per-unit cost 40-60% düşer |

---

## Türkiye'deki Büyük Ambalaj Üreticileri

### 1. Görsel Sanatlar (GS) Packaging (Istanbul)

- **Kapasite:** 12,000 tons/year
- **Sertifikalar:**
  - ISO 12647-2 PSO compliant
  - BRCGS PM certified
- **Uzmanlık:** Çikolata ve şekerleme ambalajı
- **Özellikler:** Full inline capabilities (hot-foil stamping, window patching)

### 2. Duran Doğan Basım

- **Üretim:** 50,000 tons
- **Tesis:** 30,000 m²
- **Export:** Production'ın %60'ı
- **Sertifikalar:** ISO 9001/14001, BRC/IOP

### 3. OMAKS Packaging

- **İlk:** Türkiye'de integrated Braille systems
- **Renk yönetimi:** ISO 12647 PSO
- **Sertifikalar:** BRC PM, FSC

---

### Tüm Büyük Türk Tesisler:

✅ PDF/X-1a veya PDF/X-4 kabul eder
✅ FOGRA39/51 color profiles ile çalışır
✅ Avrupa standartlarına uygun proofing workflows sağlar

---

## Matbaaya Hazır Dosya Kontrol Listesi {#checklist}

### 📄 Document Setup Verification

- [ ] Doğru trim ölçüleri + 3-5mm bleed extension
- [ ] Kritik içerik için trim'den 3-5mm içeride safety margin
- [ ] PDF'de TrimBox ve BleedBox doğru tanımlanmış

### 🎨 Color Verification

- [ ] Tüm elemanlar CMYK color mode'da (RGB yok)
- [ ] Output intent belirtilmiş: FOGRA39/51 veya ISO Coated v2
- [ ] Total ink coverage 300-320% altında
- [ ] Siyah text 100% K olarak ayarlanmış (rich black değil)
- [ ] Büyük alanlar için rich black: C60 M40 Y40 K100
- [ ] Siyah text overprint'e ayarlanmış

### 🖼️ Image ve Font Verification

- [ ] Tüm görseller final output size'da ≥300 PPI
- [ ] Line art ≥1200 PPI
- [ ] Tüm fontlar embedded veya outline'a çevrilmiş
- [ ] Missing font warning'i yok

### 📐 Technical Element Verification

- [ ] Crop marks bleed dışında 3-4mm konumlanmış
- [ ] Registration marks Registration color'da
- [ ] Die line ayrı layer'da (spot color, overprint'e ayarlı)
- [ ] Die line layer visibility off (print PDF export için)
- [ ] Transparency problemi yok (PDF/X-1a için flattened)

### 📦 File Delivery Package

- [ ] Print-ready PDF/X-1a veya PDF/X-4
- [ ] Native files (AI/INDD) backup olarak
- [ ] Ayrı die line dosyası
- [ ] Pantone color callout dokümanı
- [ ] Önceki basılmış sample (renk eşleştirme için)

---

## 🎯 React-based PDF/SVG Generation için Kritik Parametreler

Sade Chocolate uygulamasında SVG/PDF generator için **mutlaka implement edilmesi gerekenler:**

1. **PDF/X-1a veya PDF/X-4 conformance**
2. **3mm bleed** (tüm kenarlarda)
3. **300 PPI minimum** image resolution
4. **CMYK color space** with FOGRA39/51 profiles
5. **TrimBox/BleedBox geometries** doğru tanımlanmış
6. **Layer organization:**
   - Die lines: Spot color, overprint
   - Artwork'ten ayrı export
   - Technical layer'lar print PDF'den exclude edilmeli ama production files'da korunmalı

---

## 📊 Sonuç

Başarılı çikolata ve pastry box üretimi için **her aşamada quantified spesifikasyonlara** sıkı uyum gereklidir:

- ±0.1mm registration tolerance (printing sırasında)
- ΔE < 2 color matching (brand elementleri için)
- 3mm bleed on all edges
- 300 PPI minimum image resolution
- CMYK color space with FOGRA39/51

**Türk baskı endüstrisi:**
- Avrupa-aligned standartlar
- ISO 12647-2 PSO, BRCGS, FSC sertifikaları
- Bu spesifikasyonları execute etme kapasitesine sahip

**Lead times:**
- Standart: 15-20 working days
- Rush: 5-7 days
- Economical volume: 3,000+ units

**Material selection:**
- Tipik: GC2 folding boxboard
- GSM: 300-350 gsm
- Food contact compliance: EU EC 1935/2004 (Turkish Notification 2019/44)
- Barrier requirements: Moisture ve oxygen protection (çikolata için)

---

**Bu doküman Sade Chocolate Tasarım Aracı için ana teknik referans kaynağıdır.**
