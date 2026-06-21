# App Icon — CoLiving

## Phân tích project

| Mục | Chi tiết |
|-----|----------|
| Tên app | **CoLiving** |
| Loại | App quản lý nhà ở chung / co-living (React Native + Supabase) |
| Đối tượng | 2 vai trò: **Chủ nhà (landlord)** và **Người thuê (tenant)** |
| Tính năng chính | Quản lý căn hộ/phòng, hóa đơn & thanh toán, tiện ích (điện nước), sự cố, mượn đồ, bạn cùng phòng, doanh thu |
| Tinh thần | Sống chung, chia sẻ không gian, quản lý minh bạch — gọn gàng, đáng tin cậy |

### Bảng màu thực tế trong code (Tailwind-style)

| Màu | Hex | Vai trò |
|-----|-----|---------|
| Xanh dương (primary) | `#2563EB` | Màu thương hiệu chính (blue-600) |
| Xanh navy đậm | `#1E293B` | Chữ / nền tối (slate-800) |
| Xám | `#64748B` | Phụ (slate-500) |
| Trắng | `#FFFFFF` | Nền / contrast |
| Xanh lá (accent) | `#16A34A` | Thành công (green-600) |

→ Icon nên dùng **xanh dương `#2563EB` làm chủ đạo**, nền trắng hoặc gradient xanh nhạt → xanh dương, phong cách phẳng (flat), tối giản.

---

## Prompt tạo icon (1024×1024)

### Prompt chính (tiếng Anh — dùng cho Midjourney / DALL·E / Ideogram)

```
A minimalist flat-design mobile app icon for a co-living and shared-housing
management app called "CoLiving". Centered symbol: a simple rounded house
silhouette whose roof is formed by two overlapping/joined shapes suggesting
people living together (or the letter "C" subtly hugging the house).
Single clean geometric line-and-fill style, no text, no letters.
Primary color royal blue #2563EB on a soft white-to-light-blue background,
optional subtle gradient. Generous padding, perfectly centered, symmetrical,
crisp vector look, soft rounded corners, no shadows or only a very soft one.
iOS/Android app icon, 1024x1024, high resolution, clean, modern, friendly,
trustworthy. Flat 2D, no realism, no gradient overload, no busy details.
```

### Negative prompt (nếu công cụ hỗ trợ)

```
text, words, letters, watermark, photo-realistic, 3d render, clutter,
busy background, drop shadows everywhere, gradients overload, noise,
people faces, complex scenery, multiple objects
```

---

## Các phương án ý tưởng (chọn 1)

1. **Ngôi nhà + người** — Silhouette ngôi nhà bo tròn, mái nhà là 2 đầu người lồng vào nhau → "sống chung".
2. **Chữ C ôm ngôi nhà** — Chữ "C" (CoLiving) cong ôm lấy một ngôi nhà nhỏ bên trong, đơn sắc xanh dương.
3. **Mái nhà chung** — Một mái nhà che 2 hình khối đơn giản (2 người/2 phòng) → chia sẻ không gian.
4. **Cửa + chìa khóa tối giản** — Ngôi nhà với ô cửa hình trái tim hoặc chìa khóa nhỏ → an cư, tin cậy.

> Gợi ý: phương án **1** hoặc **3** dễ nhận diện nhất ở kích thước nhỏ (app icon).

---

## Ý tưởng độc đáo + prompt chi tiết

> Mỗi prompt đã tối ưu sẵn cho **1024×1024**, flat design, màu xanh dương `#2563EB`.
> Negative prompt chung ở [cuối mục](#negative-prompt-dùng-chung).

### 🥇 #A — Hai chữ "C" lồng nhau thành mái nhà *(đề xuất số 1)*

Hai chữ "C" đối xứng ghép lại tạo đường nóc nhà — vừa là logo chữ vừa là biểu tượng nhà.

```
A minimalist flat app icon for "CoLiving". Two symmetrical letter "C" shapes,
mirrored and joined at the top to form a triangular house roofline, leaving a
small house/door shape in the negative space below. Single royal blue #2563EB
mark on a clean white background. Geometric, bold, balanced strokes, perfectly
centered, generous padding, soft rounded corners, no text labels, no shadows.
Vector logo style, modern, friendly, 1024x1024.
```

### 🥈 #B — Ngôi nhà với cửa sổ sáng đèn

Silhouette nhà màu xanh đậm, vài ô cửa sổ sáng → "nhiều người cùng dưới một mái nhà". Ấm áp, kể chuyện rõ.

```
A minimalist flat app icon for a co-living app. A simple rounded house
silhouette in deep blue #1E293B, with several small glowing windows lit in
warm yellow and bright blue #2563EB, suggesting many people living together
under one roof. Soft white-to-light-blue background, centered, symmetrical,
clean geometric vector style, soft rounded corners, no text. Cozy, warm,
trustworthy, 1024x1024.
```

### 🥉 #C — Negative space: 2 người trong khối nhà

Khối nhà đặc, khoảng trắng âm bên trong tạo thành 2 người đứng cạnh nhau (kiểu logo ẩn).

```
A clever minimalist flat app icon for "CoLiving". A solid royal blue #2563EB
house shape; the white negative space inside cleverly forms two simple people
standing side by side. Hidden-symbol logo design (like the FedEx arrow),
clean white background, perfectly centered, balanced, geometric vector style,
soft rounded corners, no text, no shadow. Sophisticated, premium, 1024x1024.
```

### #D — Mái nhà chia ô màu (ở ghép)

Ngôi nhà bo tròn chia 2–4 ô màu pastel khác nhau → mỗi phòng/người một màu.

```
A minimalist flat app icon for a shared-housing app. A single rounded house
divided into 2-4 clean sections, each a soft pastel color (light blue, blue
#2563EB, soft green #16A34A, warm sand), representing shared rooms. Clean white
background, centered, symmetrical, flat geometric vector style, soft rounded
corners, no text, no shadow. Modern, playful yet calm, 1024x1024.
```

### #E — Ngôi nhà ghép từ 2 mảnh puzzle

Một đường ghép puzzle duy nhất ở giữa → chủ nhà + người thuê ăn khớp.

```
A minimalist flat app icon for "CoLiving". A simple house shape made of two
interlocking puzzle pieces joined by a single seam down the middle, in two
tones of blue (#2563EB and a lighter blue). Clean white background, centered,
symmetrical, flat geometric vector style, soft rounded corners, no text,
no shadow. Clean, meaningful, modern, 1024x1024.
```

### #F — Ngôi nhà là bong bóng chat

Mái nhà kiêm speech bubble → "sống chung = giao tiếp, chia sẻ".

```
A minimalist flat app icon for a co-living app. A rounded house whose roof
doubles as a speech bubble (with a small tail), symbolizing communication and
sharing among roommates. Royal blue #2563EB on a clean white background,
centered, flat geometric vector style, soft rounded corners, no text,
no shadow. Friendly, social, modern, 1024x1024.
```

### #G — Chìa khóa hình ngôi nhà

Đầu chìa khóa (bow) là ngôi nhà nhỏ → "trao chìa khóa, an cư". Sang, gọn.

```
A minimalist flat app icon for "CoLiving". A simple vertical key whose head
(bow) is shaped like a small house, symbolizing handing over the keys to a
home. Single royal blue #2563EB mark on a clean white background, centered,
flat geometric vector style, soft rounded corners, no text, no shadow.
Elegant, trustworthy, modern, 1024x1024.
```

### #H — Ngôi nhà trong vòng tay / vòng cung

Ngôi nhà nằm gọn trong một vòng cung mở (chữ C / vòng tay ôm) → bảo vệ, cộng đồng.

```
A minimalist flat app icon for a co-living app. A simple house nestled inside
an open curved arc that wraps around it like an embracing arm or the letter C,
symbolizing community and protection. Royal blue #2563EB on a clean white
background, centered, symmetrical, flat geometric vector style, soft rounded
corners, no text, no shadow. Warm, safe, modern, 1024x1024.
```

### Negative prompt (dùng chung)

```
text, words, letters, watermark, photo-realistic, 3d render, clutter,
busy background, drop shadows everywhere, gradients overload, noise,
realistic human faces, complex scenery, too many objects, low contrast
```

### Bảng so sánh nhanh

| Mã | Ý tưởng | Độ độc đáo | Dễ nhận diện @48px | Tinh thần |
|----|---------|:---:|:---:|-----------|
| A | 2 chữ C → mái nhà | ⭐⭐⭐ | ⭐⭐⭐ | Brand-first |
| B | Nhà cửa sổ sáng đèn | ⭐⭐ | ⭐⭐⭐ | Ấm, kể chuyện |
| C | Negative space 2 người | ⭐⭐⭐ | ⭐⭐ | Cao cấp, tinh tế |
| D | Mái nhà chia ô màu | ⭐⭐ | ⭐⭐ | Ở ghép, vui tươi |
| E | Nhà puzzle | ⭐⭐ | ⭐⭐ | Ăn khớp, hợp tác |
| F | Nhà = chat bubble | ⭐⭐⭐ | ⭐⭐ | Giao tiếp, social |
| G | Chìa khóa hình nhà | ⭐⭐ | ⭐⭐ | Tin cậy, sang |
| H | Nhà trong vòng tay | ⭐⭐ | ⭐⭐⭐ | Cộng đồng, an toàn |

---

## Lưu ý kỹ thuật khi xuất icon

- Xuất gốc **1024×1024 PNG**, nền đầy (không trong suốt) cho iOS App Store.
- Để **safe margin** ~10–12% quanh viền (Android adaptive icon sẽ crop).
- Tránh chi tiết nhỏ/chữ — phải đọc được ở 48×48 px.
- Sau khi có file gốc, generate các size cho:
  - iOS: `ios/CoLiving/Images.xcassets/AppIcon.appiconset/`
  - Android: `android/app/src/main/res/mipmap-*/` (mdpi → xxxhdpi) + adaptive `ic_launcher`.
