# CoLiving — Kế Hoạch Phát Triển Ứng Dụng

> Ứng dụng quản lý căn hộ cho thuê chung (co-living apartment app)
> Tech Stack: React Native CLI · Redux + Redux Saga · MMKV · React Hook Form + Zod · Supabase · React Native Reanimated

---

## Mục lục

1. [Phân tích người dùng](#1-phân-tích-người-dùng)
2. [Phân tích đối thủ & nền tảng tương tự](#2-phân-tích-đối-thủ--nền-tảng-tương-tự)
3. [Đề xuất tính năng](#3-đề-xuất-tính-năng)
4. [Luồng người dùng](#4-luồng-người-dùng)
5. [Kiến trúc tổng quan](#5-kiến-trúc-tổng-quan)
6. [Danh sách màn hình](#6-danh-sách-màn-hình)
7. [Kế hoạch phát triển](#7-kế-hoạch-phát-triển-theo-giai-đoạn)
8. [Rủi ro và thách thức](#8-rủi-ro--thách-thức)

---

## 1. Phân Tích Người Dùng

> Xem thêm [Mục 2: Phân tích đối thủ](#2-phân-tích-đối-thủ--nền-tảng-tương-tự) để hiểu bối cảnh thị trường và các sản phẩm hiện có.

### 1.1 Tenant — Người thuê

**Chân dung:** Nhân viên văn phòng hoặc sinh viên, 22-35 tuổi, thuê phòng trong căn hộ chia sẻ 2-4 người. Dùng smartphone thành thạo, quen với các ứng dụng hàng ngày. Thu nhập 10-20 triệu/tháng, tiền thuê chiếm 30-40%.

**Pain points hiện tại:**

| Vấn đề | Cách xử lý hiện tại | Hậu quả |
|--------|---------------------|---------|
| Mượn đồ dùng chung | Nhắn Zalo nhóm hoặc hỏi miệng | Tin nhắn bị trôi, quên trả, không ai dám đòi |
| Báo cáo hỏng hóc | Nhắn Zalo cá nhân cho chủ nhà | Chủ nhà seen không reply, không biết tiến độ |
| Thanh toán tiền thuê | Chuyển khoản + screenshot gửi Zalo | Không có lịch sử tập trung, tranh cãi "trả rồi/chưa trả" |
| Nhắc thanh toán | Không có — tự nhớ | Quên ngày đóng, bị chủ nhà nhắn hỏi |

**Kỳ vọng khi dùng app:**

- Một nơi tập trung cho mọi giao tiếp liên quan đến căn hộ
- Mượn/trả đồ minh bạch, có ghi nhận trạng thái
- Lịch sử thanh toán rõ ràng, có bằng chứng
- Nhắc nhở tự động, không cần nhờ ai

---

### 1.2 Landlord — Chủ nhà / Quản lý

**Chân dung:** Chủ sở hữu 1-3 căn hộ cho thuê, 30-50 tuổi. Quản lý 5-15 người thuê. Có công việc chính ban ngày, cho thuê là thu nhập phụ. Dùng smartphone cơ bản, quen Excel nhưng không chuyên công nghệ.

**Pain points hiện tại:**

| Vấn đề | Cách xử lý hiện tại | Hậu quả |
|--------|---------------------|---------|
| Quản lý danh sách người thuê | Sổ tay hoặc Excel | Dễ sai sót, khó cập nhật khi có người vào/ra |
| Thu tiền thuê hàng tháng | Nhắn từng người qua Zalo | Mất thời gian, ngại nhắc, đôi khi quên ai đã trả |
| Xử lý sự cố | Nhận tin Zalo từ nhiều người/căn hộ | Tin nhắn lẫn lộn, quên xử lý, tenant phàn nàn |
| Quản lý tài sản | Trí nhớ | Không biết chính xác đồ gì ở đâu, hỏng chưa |
| Tổng hợp doanh thu | Cộng tay từ Excel hoặc sổ | Tốn thời gian, dễ nhầm |

**Kỳ vọng khi dùng app:**

- Dashboard tổng quan: ai đã trả tiền, ai chưa, bao nhiêu sự cố đang chờ
- Hệ thống tự động nhắc tenant đóng tiền thay mình
- Lịch sử thu chi đầy đủ, minh bạch
- Quản lý tập trung tất cả tại một nơi

---

## 2. Phân Tích Đối Thủ & Nền Tảng Tương Tự

### 2.1 Co-Living Platforms (Quốc tế)

#### Common (Mỹ) — co-living lớn nhất thế giới

| Tính năng | Chi tiết |
|-----------|---------|
| Community Feed | Mạng xã hội nội bộ cho cư dân chia sẻ, đăng bài — giống newsfeed nội bộ |
| Roommate Matching | Thuật toán ghép cặp dựa trên khảo sát: giờ ngủ, mức độ sạch sẽ, thú cưng, hút thuốc, mức độ xã giao |
| Event Calendar + RSVP | Tổ chức sự kiện cộng đồng (dinner party, yoga, workshop) qua app |
| Smart Lock | Mở cửa bằng app, cấp mã tạm thời cho khách |
| All-inclusive Billing | Tiền thuê + điện + nước + internet + dọn dẹp gộp vào 1 hóa đơn duy nhất |
| Furnished Inventory | Quản lý nội thất đầy đủ qua hệ thống inventory |

**Bài học rút ra:** Community Feed và Roommate Matching tạo sự khác biệt lớn nhất. Tuy nhiên Roommate Matching chỉ phù hợp khi platform tự vận hành, không áp dụng được cho mô hình "landlord quản lý trực tiếp" của chúng ta.

---

#### Quarters / Medici Living (Đức, Mỹ)

| Tính năng | Chi tiết |
|-----------|---------|
| Amenity Booking | Đặt lịch sử dụng phòng gym, co-working, phòng giặt qua app |
| Digital Visitor Management | Quản lý khách thăm — ghi nhận khách ra/vào, cấp mã truy cập tạm |
| Internal Marketplace | Cư dân mua bán/trao đổi đồ đạc với nhau |
| Digital Move-in/out | Toàn bộ quy trình nhận/trả phòng online |
| Community Manager | Mỗi tòa nhà có quản lý cộng đồng chuyên trách |

**Bài học rút ra:** Amenity Booking và Internal Marketplace là tính năng phù hợp cho co-living. Digital move-in/out giảm tranh chấp khi trả phòng.

---

#### Hmlet (Singapore, Hong Kong, Nhật, Úc) — co-living Đông Nam Á

| Tính năng | Chi tiết |
|-----------|---------|
| Flexible Lease | Hợp đồng từ 1 tháng, linh hoạt |
| Maintenance Feedback Rating | Tenant đánh giá chất lượng sau mỗi lần sửa chữa |
| Move-in Kit | Bộ đồ dùng cơ bản chuẩn bị sẵn cho tenant mới |
| Cross-property Transfer | Tenant chuyển đổi giữa các căn hộ trong mạng lưới (Hmlet Flex) |
| Local Service Integration | Tích hợp dịch vụ địa phương: giặt ủi, dọn dẹp |

**Bài học rút ra:** Rất phù hợp tham khảo vì cùng thị trường Đông Nam Á. Maintenance Feedback Rating là tính năng đơn giản nhưng tạo giá trị lớn: landlord biết tenant có hài lòng không, tenant cảm thấy tiếng nói được lắng nghe.

---

#### Cove (Singapore, Indonesia, Thailand) — co-living Đông Nam Á

| Tính năng | Chi tiết |
|-----------|---------|
| Airport Pickup | Dịch vụ đón sân bay cho tenant mới |
| Welcome Package | Gói chào mừng khi nhận phòng |
| Co-working Access | Truy cập không gian làm việc chung trong mạng lưới |
| Smart Lock Access | Mở cửa bằng app |

**Bài học rút ra:** Onboarding experience xuất sắc (airport pickup + welcome package). Dù không áp dụng 1:1, ý tưởng "welcome flow" cho tenant mới (hướng dẫn nội quy, giới thiệu roommate, checklist nhận phòng) rất đáng tham khảo.

---

### 2.2 Property Management Platforms (Quản lý bất động sản)

#### Buildium (Mỹ) — enterprise property management

| Tính năng nổi bật | Chi tiết |
|-------------------|---------|
| E-Signature Lease | Tạo, ký điện tử, gia hạn, theo dõi hợp đồng hoàn toàn online |
| Tenant Screening | Kiểm tra tín dụng + lý lịch tư pháp + lịch sử thuê nhà + xác minh thu nhập — tất cả tích hợp |
| Auto Late Fee | Tự động tính phí trả trễ theo rule đã cài |
| Accounting Integration | Kế toán tự động, tích hợp 30+ phần mềm kế toán, báo cáo thuế |
| Vendor Management | Quản lý nhà thầu sửa chữa, assign công việc, theo dõi tiến độ, thanh toán |
| Renters Insurance | Quản lý bảo hiểm thuê nhà tích hợp |
| HOA Management | Quản lý hiệp hội cư dân |

**Bài học rút ra:** E-Signature Lease và Auto Late Fee rất phù hợp cho phase mở rộng. Vendor Management hữu ích khi landlord quản lý nhiều căn hộ.

---

#### AppFolio (Mỹ) — AI-powered property management

| Tính năng nổi bật | Chi tiết |
|-------------------|---------|
| AI Leasing Assistant | Chatbot AI trả lời câu hỏi tenant 24/7, tự lên lịch xem nhà |
| Smart Maintenance Triage | AI phân loại yêu cầu bảo trì theo mức độ ưu tiên, gợi ý vendor phù hợp |
| Inspection Checklist | Tạo checklist kiểm tra phòng, chụp ảnh, ghi chú, tạo báo cáo tự động |
| Bulk Communication | Gửi email/SMS hàng loạt cho tất cả tenant |
| Performance Analytics | Dashboard real-time với metrics vận hành |
| Cash Payment Support | Tenant trả tiền mặt tại các điểm bán lẻ (PayNearMe) |

**Bài học rút ra:** Inspection Checklist (= Move-in/out Checklist) rất thiết thực. Smart Maintenance Triage là tính năng tham vọng cho tương lai. Bulk Communication cần thiết cho phase multi-apartment.

---

#### RentRedi (Mỹ) — mobile-first property management

| Tính năng nổi bật | Chi tiết |
|-------------------|---------|
| Video Maintenance Request | Tenant quay video mô tả sự cố thay vì chỉ viết text/chụp ảnh |
| Prequalification | Khách thuê tự điền thông tin prequalification trước khi apply chính thức |
| Listing Syndication | Tự động đăng tin lên Zillow, Trulia, HotPads, Realtor.com |
| In-app Communication | Chat tích hợp giữa landlord và tenant |
| Expense Tracking | Landlord theo dõi chi phí vận hành (sửa chữa, mua sắm) |

**Bài học rút ra:** **Video Maintenance Request** rất sáng tạo và dễ implement — giúp landlord đánh giá mức độ nghiêm trọng trước khi cử người sửa. Expense Tracking giúp landlord có cái nhìn lãi/lỗ chính xác.

---

#### TurboTenant (Mỹ) — freemium model

| Tính năng nổi bật | Chi tiết |
|-------------------|---------|
| RentRep | Tenant được báo cáo thanh toán tiền thuê lên cơ quan tín dụng → xây dựng credit score. Tạo động lực trả đúng hạn |
| Rent Estimate Tool | Ước tính giá thuê dựa trên thị trường xung quanh |
| Lease Agreement Builder | Template hợp đồng tùy chỉnh theo từng khu vực |
| Income Insights | Xác minh thu nhập tenant tự động qua kết nối ngân hàng |

**Bài học rút ra:** **RentRep** là ý tưởng tuyệt vời tạo incentive cho tenant trả đúng hạn. Có thể biến đổi thành hệ thống "uy tín" nội bộ trong app (xem mục Gamification bên dưới).

---

### 2.3 Roommate & Shared Living Apps

#### Splitwise — chia tiền #1 thế giới

| Tính năng | Chi tiết |
|-----------|---------|
| Smart Bill Splitting | Chia đều / chia % / chia số lượng chính xác |
| Simplify Debts | Thuật toán tối ưu: A nợ B, B nợ C → A trả thẳng C. Giảm số giao dịch |
| Recurring Expenses | Tự động tạo chi phí định kỳ |
| Receipt Scanning | Chụp hóa đơn → tự nhận diện số tiền |
| Expense Categories | Phân loại chi tiêu + biểu đồ phân tích |
| Offline Mode | Hoạt động không cần internet |

**Bài học rút ra:** Nếu implement Shared Expense Splitting, tham khảo mô hình Splitwise. Thuật toán "Simplify Debts" rất quan trọng khi có 3+ người.

---

#### OurFlat / Flatastic — quản lý đời sống chung

| Tính năng | Chi tiết |
|-----------|---------|
| Chore Wheel | Vòng xoay phân công việc nhà tự động, xoay vòng mỗi tuần |
| Gamification | Điểm thưởng + huy hiệu + bảng xếp hạng khi hoàn thành việc nhà |
| Shared Shopping List | Danh sách mua sắm chung, ai mua xong tick off |
| Chore Statistics | Thống kê ai làm nhiều nhất / ít nhất |
| Message Board | Bảng tin nội bộ |

**Bài học rút ra:** **Gamification** biến việc nhà (và cả thanh toán đúng hạn) thành trò chơi — tạo động lực rất hiệu quả. **Chore Wheel** giải quyết vấn đề kinh điển trong co-living: "ai dọn bếp hôm nay?"

---

#### Roomi — tìm và quản lý roommate

| Tính năng | Chi tiết |
|-----------|---------|
| Lifestyle Questionnaire | Khảo sát chi tiết: giờ ngủ/dậy, sạch sẽ, thú cưng, hút thuốc, nấu ăn, khách qua đêm |
| Verified Profiles | Xác minh danh tính qua social media + ID |
| Safe Messaging | Nhắn tin trong app, không cần chia sẻ SĐT |
| Neighborhood Insights | Thông tin an ninh, tiện ích, giao thông khu vực |

**Bài học rút ra:** Verified Profiles + Safe Messaging tăng trust trong cộng đồng. Lifestyle Questionnaire có thể dùng dạng giản lược để landlord hiểu tenant mới.

---

### 2.4 Nền Tảng Việt Nam & Đông Nam Á

#### Jeasy (Việt Nam)

| Tính năng | Chi tiết |
|-----------|---------|
| Quản lý điện nước | Nhập số đồng hồ → tính tiền theo **bậc thang VN** |
| Nhắc hạn tự động | Thông báo push cho tenant |
| Phí dịch vụ chung cư | Quản lý phí quản lý, phí gửi xe |
| Báo cáo thu chi | Tổng hợp tài chính theo tháng/quý |

---

#### Lozido (Việt Nam)

| Tính năng | Chi tiết |
|-----------|---------|
| Thông báo qua Zalo | Tích hợp gửi nhắc nhở qua Zalo OA — phù hợp thói quen VN |
| Quản lý CMND/CCCD | Lưu trữ giấy tờ tùy thân của tenant |
| Tính tiền bậc thang | Hỗ trợ tính tiền điện/nước theo bậc thang đặc thù VN |
| Đăng tin cho thuê | Đăng tin lên nền tảng của Lozido |

**Bài học rút ra từ VN market:** (1) Tích hợp Zalo gần như bắt buộc cho thị trường VN. (2) Tính tiền điện nước theo bậc thang là nhu cầu thiết yếu. (3) Quản lý giấy tờ tùy thân (tạm trú/tạm vắng) là yêu cầu pháp lý.

---

### 2.5 Tổng Hợp: Bản Đồ Tính Năng Theo Nền Tảng

| Tính năng | Common | Quarters | Hmlet | Cove | Buildium | AppFolio | RentRedi | Splitwise | OurFlat | Jeasy | Lozido | **CoLiving (chúng ta)** |
|-----------|:------:|:--------:|:-----:|:----:|:--------:|:--------:|:--------:|:---------:|:-------:|:-----:|:------:|:----------------------:|
| Auth & Roles | x | x | x | x | x | x | x | - | - | x | x | **MVP** |
| Payment Tracking | x | x | x | x | x | x | x | - | - | x | x | **MVP** |
| Issue Reporting | x | x | x | x | x | x | x | - | - | - | - | **MVP** |
| Item Borrowing | - | - | - | - | - | - | - | - | - | - | - | **MVP (unique!)** |
| Push Notifications | x | x | x | x | x | x | x | x | x | x | x | **MVP** |
| Community Feed | x | x | - | - | - | - | - | - | x | - | - | Phase 2 |
| Chore Scheduling | - | - | - | - | - | - | - | - | x | - | - | Phase 2 |
| Expense Splitting | - | - | - | - | - | - | - | x | x | - | - | Phase 3 |
| Video Maintenance | - | - | - | - | - | - | x | - | - | - | - | Phase 2 |
| Smart Lock | x | x | - | x | - | - | - | - | - | - | - | Phase 3+ |
| E-Lease | - | - | - | - | x | x | - | - | - | - | - | Phase 3 |
| Gamification | - | - | - | - | - | - | - | - | x | - | - | Phase 2 |
| Utility Billing (VN) | - | - | - | - | - | - | - | - | - | x | x | Phase 2 |
| Zalo Integration | - | - | - | - | - | - | - | - | - | - | x | Phase 2 |
| Multi-property | - | x | x | x | x | x | x | - | - | x | x | Phase 3 |

> **Điểm khác biệt cốt lõi:** Tính năng **Item Borrowing** (mượn/trả đồ giữa roommate) là unique — không có nền tảng nào trong danh sách trên implement tính năng này. Đây là USP (Unique Selling Point) của CoLiving.

---

## 3. Đề Xuất Tính Năng

### 3.1 Core Features (MVP)

| # | Tính năng | Mô tả | Lý do cần thiết |
|---|-----------|-------|-----------------|
| 1 | **Auth & Role-Based Access** | Đăng ký/đăng nhập bằng email+password. Landlord tạo căn hộ và mời tenant bằng invite code. Phân quyền 2 vai trò. | Nền tảng của mọi tính năng. Phải biết ai là ai và thuộc căn hộ nào. |
| 2 | **Apartment Setup** | Landlord tạo hồ sơ căn hộ: tên, địa chỉ, số phòng, thông tin cơ bản. | Cần có "container" logic để gắn tenant và tài sản vào. |
| 3 | **Tenant Management** | Landlord xem/thêm/xóa tenant. Tenant xem danh sách roommate (tên, phòng). | Landlord cần biết ai đang ở, tenant cần biết hỏi mượn đồ từ ai. |
| 4 | **Item Borrowing** | Tenant tạo yêu cầu mượn đồ → chủ đồ chấp nhận/từ chối → đánh dấu trả → xác nhận nhận lại. Tracking trạng thái đầy đủ. | Giải quyết xung đột lớn nhất trong co-living: đồ dùng chung. |
| 5 | **Issue Reporting** | Tenant tạo báo cáo sự cố (loại, mô tả, ảnh, mức độ). Landlord tiếp nhận, cập nhật trạng thái, đóng ticket. | Thay thế Zalo rời rạc, có tracking rõ ràng hai chiều. |
| 6 | **Rent Payment Tracking** | Landlord tạo kỳ thu tiền hàng tháng. Tenant đánh dấu "đã trả". Landlord xác nhận. Lịch sử đầy đủ. | Xóa bỏ tranh cãi thanh toán, minh bạch cho cả hai bên. |
| 7 | **Push Notifications** | Nhắc thanh toán tự động (trước hạn 3 ngày, 1 ngày). Thông báo khi có yêu cầu mượn đồ, cập nhật sự cố, xác nhận thanh toán. | Giữ user quay lại app, đảm bảo không bỏ lỡ thông tin quan trọng. |
| 8 | **Revenue Dashboard** | Landlord xem tổng thu tháng, danh sách ai đã trả / chưa trả. | Landlord cần cái nhìn tổng quan nhanh. |

### 3.2 Nice-to-Have (Tương lai) — Cập nhật sau phân tích đối thủ

#### Nhóm A — Cộng đồng & Sinh hoạt chung (tham khảo: Common, OurFlat, Quarters)

| # | Tính năng | Mô tả | Nguồn tham khảo | Lý do |
|---|-----------|-------|-----------------|-------|
| 1 | **Community Feed** | Mạng xã hội nội bộ cho cư dân chia sẻ, đăng bài, tương tác | Common, Quarters | Tăng gắn kết cộng đồng, giảm phụ thuộc Zalo group |
| 2 | **Chore Scheduling (Phân công việc nhà)** | Vòng xoay phân công dọn dẹp khu vực chung tự động, xoay vòng hàng tuần | OurFlat, Flatastic | Giải quyết vấn đề kinh điển: "ai dọn bếp hôm nay?" |
| 3 | **Shared Shopping List** | Danh sách mua sắm đồ dùng chung, ai mua xong tick off | OurFlat | Đơn giản nhưng thiết thực cho đời sống chung |
| 4 | **Apartment Rules & Announcements** | Landlord đăng nội quy, thông báo chung. Tenant xác nhận đã đọc | Common, Hmlet | Giảm mâu thuẫn, có cơ sở xử lý vi phạm |
| 5 | **Internal Marketplace** | Cư dân mua bán/trao đổi/tặng đồ đạc với nhau | Quarters | Mở rộng tự nhiên từ tính năng mượn đồ |
| 6 | **Quiet Hours Management** | Đặt giờ yên tĩnh cho căn hộ, nhắc nhở tự động | RoomMate apps | Giảm xung đột tiếng ồn — vấn đề phổ biến trong co-living |

#### Nhóm B — Quản lý vận hành nâng cao (tham khảo: Buildium, AppFolio, RentRedi)

| # | Tính năng | Mô tả | Nguồn tham khảo | Lý do |
|---|-----------|-------|-----------------|-------|
| 7 | **Video Maintenance Request** | Tenant quay video mô tả sự cố thay vì chỉ text/ảnh | RentRedi | Landlord đánh giá mức độ nghiêm trọng chính xác hơn trước khi cử thợ |
| 8 | **Utility Billing (Tính tiền điện/nước VN)** | Nhập số đồng hồ → tính tiền tự động theo bậc thang VN | Jeasy, Lozido | Nhu cầu thiết yếu ở thị trường VN, không platform quốc tế nào có |
| 9 | **Expense Tracking (Landlord)** | Landlord ghi nhận chi phí vận hành (sửa chữa, mua sắm) → xem lãi/lỗ thực | RentRedi | Giúp landlord hiểu chính xác lợi nhuận sau chi phí |
| 10 | **Move-in / Move-out Checklist** | Checklist bàn giao phòng kèm ảnh hiện trạng + e-signature | AppFolio, Buildium | Tránh tranh chấp khi tenant rời đi |
| 11 | **Maintenance Feedback Rating** | Tenant đánh giá (1-5 sao) sau mỗi lần sửa chữa hoàn tất | Hmlet | Landlord biết chất lượng dịch vụ, tenant cảm thấy được lắng nghe |
| 12 | **Vendor Management** | Danh sách nhà thầu sửa chữa, assign ticket cho vendor, theo dõi tiến độ | Buildium, AppFolio | Hữu ích khi landlord quản lý nhiều căn hộ |

#### Nhóm C — Tài chính & Thanh toán (tham khảo: Splitwise, TurboTenant)

| # | Tính năng | Mô tả | Nguồn tham khảo | Lý do |
|---|-----------|-------|-----------------|-------|
| 13 | **Shared Expense Splitting** | Chia tiền điện/nước/internet, thuật toán "Simplify Debts" tối ưu số giao dịch | Splitwise | Nhu cầu phổ biến, giảm xung đột tài chính giữa roommate |
| 14 | **Payment Integration** | Tích hợp MoMo, VNPay, ZaloPay để trả tiền trực tiếp trong app | Buildium, RentRedi | Giảm friction, tự động ghi nhận khi thanh toán thành công |
| 15 | **Auto Late Fee** | Tự động tính phí trả trễ theo rule landlord cài đặt | Buildium | Công bằng, minh bạch, landlord không phải nhắc thủ công |
| 16 | **Receipt Scanning** | Chụp hóa đơn → tự nhận diện số tiền | Splitwise | UX tốt hơn khi nhập chi phí |

#### Nhóm D — Tăng trưởng & Engagement (tham khảo: OurFlat, TurboTenant, Common)

| # | Tính năng | Mô tả | Nguồn tham khảo | Lý do |
|---|-----------|-------|-----------------|-------|
| 17 | **Gamification System** | Điểm thưởng khi trả tiền đúng hạn, hoàn thành việc nhà, mượn/trả đúng hẹn. Huy hiệu + bảng xếp hạng | OurFlat, TurboTenant (RentRep) | Tạo động lực tích cực, biến nghĩa vụ thành thú vị |
| 18 | **Tenant Reputation Score** | Điểm uy tín nội bộ: tích lũy từ thanh toán đúng hạn, trả đồ đúng hẹn, đánh giá từ roommate | TurboTenant (RentRep) | Incentive cho tenant, dữ liệu cho landlord khi screening |
| 19 | **Referral Rewards** | Tenant giới thiệu người mới → nhận ưu đãi (giảm tiền thuê tháng sau) | Common, Bungalow | Growth hack, giảm chi phí tìm tenant mới |
| 20 | **Welcome Flow for New Tenant** | Onboarding sequence: giới thiệu roommate, hướng dẫn nội quy, checklist nhận phòng, tour căn hộ | Cove | First impression tốt = retention tốt |

#### Nhóm E — Mở rộng & Scale (tham khảo: Buildium, AppFolio)

| # | Tính năng | Mô tả | Nguồn tham khảo | Lý do |
|---|-----------|-------|-----------------|-------|
| 21 | **Multi-Apartment Management** | Landlord quản lý nhiều căn hộ, dashboard tổng hợp | Buildium, AppFolio | Scale cho landlord nhiều bất động sản |
| 22 | **E-Lease (Hợp đồng điện tử)** | Tạo hợp đồng từ template → ký điện tử → lưu trữ đám mây | Buildium, AppFolio | Chuyên nghiệp hóa, có giá trị pháp lý |
| 23 | **Document Storage** | Lưu hợp đồng, CMND/CCCD, biên bản bàn giao | Avail, Lozido | Yêu cầu pháp lý VN (tạm trú/tạm vắng) |
| 24 | **Analytics & Reports** | Biểu đồ doanh thu, tỷ lệ lấp đầy, thời gian xử lý sự cố, export PDF/Excel | AppFolio | Giúp landlord ra quyết định kinh doanh |
| 25 | **In-App Chat** | Nhắn tin trực tiếp giữa thành viên, không cần chia sẻ SĐT | Roomi, RentRedi | Giữ giao tiếp trong hệ sinh thái app |
| 26 | **Zalo Notification Integration** | Gửi nhắc nhở qua Zalo OA (bên cạnh push notification) | Lozido | Phù hợp thói quen người dùng VN, reach cao hơn push |
| 27 | **Bulk Communication** | Landlord gửi thông báo hàng loạt cho tất cả tenant | AppFolio | Tiết kiệm thời gian khi quản lý nhiều căn hộ |

---

## 4. Luồng Người Dùng

### 4.1 Flow: Đăng ký / Đăng nhập & Phân quyền

```
Mở app lần đầu
    │
    ├─ Welcome Screen → Chọn vai trò
    │
    ├─ [Chủ nhà]
    │   ├─ Đăng ký (email + password)
    │   ├─ Xác thực email
    │   ├─ Tạo căn hộ (tên, địa chỉ, số phòng)
    │   ├─ Hệ thống sinh invite code
    │   ├─ Gửi invite code cho tenant (qua Zalo/SMS bên ngoài app)
    │   └─ → Landlord Dashboard
    │
    └─ [Người thuê]
        ├─ Đăng ký (email + password)
        ├─ Xác thực email
        ├─ Nhập invite code từ landlord
        ├─ Hệ thống xác minh → hiển thị tên căn hộ
        ├─ Xác nhận tham gia
        └─ → Tenant Home

Đăng nhập lần sau:
    Email + Password → Kiểm tra role → Điều hướng đến Home tương ứng
    (Token lưu MMKV → auto-login nếu còn hạn)
```

**Lưu ý:** Một tài khoản chỉ có một vai trò. Nếu một người vừa là chủ nhà vừa thuê ở nơi khác, cần 2 tài khoản riêng biệt (xem xét multi-role ở phase sau).

---

### 4.2 Flow: Mượn đồ (Item Borrowing)

```
Trạng thái: [Pending] → [Approved / Rejected] → [In-Use] → [Return Requested] → [Returned]
```

**Bước chi tiết:**

1. **Tenant A** mở tab "Mượn đồ" → xem danh sách đồ có thể mượn (đồ chung của apartment + đồ cá nhân mà tenant khác cho mượn)
2. Chọn món đồ → nhấn **"Yêu cầu mượn"**
3. Nhập: lý do mượn, thời gian dự kiến trả (ví dụ: "2 ngày") → Gửi
4. Hệ thống gửi **push notification** đến chủ đồ (Tenant B hoặc Landlord)
5. **Chủ đồ** mở thông báo → xem chi tiết → chọn:
   - **Chấp nhận** → trạng thái chuyển sang `In-Use`, cả hai nhận notification
   - **Từ chối** → có thể ghi lý do, Tenant A nhận notification, flow kết thúc
6. Khi đến hạn trả → hệ thống gửi **nhắc nhở** cho Tenant A
7. Tenant A trả đồ ngoài đời thực → mở app → nhấn **"Đã trả"**
8. Chủ đồ nhận notification → xác nhận **"Đã nhận lại"** → trạng thái `Returned`
9. **Quá hạn:** Nếu quá thời gian mà chưa trả → nhắc nhở hàng ngày. Sau 3 ngày quá hạn → thông báo thêm cho Landlord

---

### 4.3 Flow: Báo cáo vấn đề (Issue Reporting)

```
Trạng thái: [Open] → [In Progress] → [Resolved] → [Closed]
                                         ↓
                                    [Reopened] → [In Progress] → ...
```

**Bước chi tiết:**

1. **Tenant** mở tab "Báo cáo" → nhấn **"Tạo báo cáo mới"**
2. Chọn **danh mục**: Hỏng hóc thiết bị / Tiếng ồn / Vệ sinh khu chung / An ninh / Khác
3. Chọn **vị trí**: Phòng khách / Bếp / WC / Ban công / Phòng riêng
4. Chọn **mức độ khẩn cấp**: Bình thường / Khẩn cấp
5. Nhập mô tả chi tiết + đính kèm ảnh (tối đa 3 ảnh) → Gửi
6. **Landlord** nhận push notification → mở danh sách báo cáo → xem chi tiết
7. Landlord nhấn **"Tiếp nhận"** (→ `In Progress`) + ghi chú: "Đã gọi thợ, hẹn chiều mai"
8. Tenant nhận notification cập nhật, xem được ghi chú
9. Khi xong → Landlord nhấn **"Đã xử lý"** (→ `Resolved`) + ghi kết quả
10. Tenant xem kết quả → chọn:
    - **"Xác nhận đã ổn"** → `Closed`
    - **"Chưa xong, mở lại"** → `Reopened` → quay lại bước 7

---

### 4.4 Flow: Quản lý thanh toán (Rent Payment)

```
Trạng thái: [Unpaid] → [Tenant Reported] → [Confirmed] 
                ↓
            [Overdue] → [Tenant Reported] → [Confirmed]
```

**Bước chi tiết:**

1. **Landlord** đầu tháng → mở tab "Thanh toán" → nhấn **"Tạo kỳ thu tiền"**
2. Chọn tháng → hệ thống tự tạo bản ghi cho từng tenant với số tiền thuê mặc định (đã cài trước cho mỗi phòng)
3. Landlord điều chỉnh nếu cần (phụ thu, giảm giá) → nhấn **"Gửi thông báo"**
4. **Tất cả tenant** nhận push notification: "Tiền thuê tháng 4/2026: 5.000.000đ — Hạn: 05/04/2026"
5. Tenant chuyển khoản bên ngoài app → mở app → nhấn **"Tôi đã thanh toán"**
6. Chọn hình thức (Chuyển khoản / Tiền mặt) → đính kèm ảnh biên lai (tùy chọn) → Gửi
7. **Landlord** nhận notification → kiểm tra → chọn:
   - **"Xác nhận đã nhận"** → `Confirmed`, ghi nhận ngày + hình thức
   - **"Chưa nhận được"** → Tenant nhận notification kiểm tra lại
8. **Nhắc nhở tự động:**
   - T-3 ngày: notification nhẹ nhàng
   - T-1 ngày: notification nhấn mạnh
   - Quá hạn: thông báo cho cả tenant và landlord
9. Landlord xem **tổng quan tháng**: bao nhiêu đã trả / chưa trả / tổng thu

---

## 5. Kiến Trúc Tổng Quan

### 5.1 Vai trò từng thành phần trong stack

#### Supabase — Toàn bộ backend

| Module | Vai trò |
|--------|---------|
| **Auth** | Xác thực email+password, quản lý session, JWT token. Lưu vai trò (role) trong user metadata. |
| **Database (PostgreSQL)** | Lưu toàn bộ dữ liệu: users, apartments, tenants, items, borrow_requests, issues, payments. Sử dụng **Row Level Security (RLS)** để phân quyền ở tầng database. |
| **Realtime** | Subscribe changes trên các bảng quan trọng. Khi có thay đổi trạng thái → client nhận event → cập nhật UI tức thì. |
| **Storage** | Lưu ảnh: avatar, ảnh sự cố, ảnh biên lai thanh toán, ảnh tài sản. Phân quyền bucket theo apartment. |
| **Edge Functions** | Logic phức tạp: gửi push notification, tạo kỳ thu tiền hàng loạt, cron job nhắc nhở thanh toán. |

#### Redux + Redux Saga — Client state & side effects

| Thành phần | Vai trò |
|-----------|---------|
| **Redux Store** | Global state: danh sách tenant, items, requests, issues, payments đã fetch. Normalized entities pattern. UI state: filter, sort, loading, error. |
| **Redux Saga** | Side effects phức tạp: chuỗi API calls, retry khi mất mạng, đồng bộ offline → online. Lắng nghe Supabase Realtime channels và dispatch Redux actions tương ứng. |

#### MMKV — Local storage

| Dữ liệu | Lý do |
|----------|-------|
| Auth token | Auto-login khi mở app, không cần đăng nhập lại |
| User role + apartment_id | Điều hướng nhanh khi khởi động |
| User preferences | Theme, ngôn ngữ, notification settings |
| Cache dữ liệu ít thay đổi | Thông tin căn hộ, danh sách phòng — giảm API calls, hiển thị nhanh khi offline |
| Onboarding state | Đã xem intro chưa |
| **KHÔNG lưu** | Password, dữ liệu tài chính chi tiết, dữ liệu hay thay đổi (trạng thái payment) |

#### React Hook Form + Zod — Forms & validation

- Quản lý mọi form: đăng ký, tạo yêu cầu mượn đồ, báo cáo sự cố, tạo kỳ thanh toán
- Zod schema validate trước khi gửi lên Supabase → đảm bảo type-safety, giảm tải backend
- Zod schema có thể tái sử dụng giữa form validation và API response parsing

#### React Native Reanimated — Animations

- Bottom sheet trượt lên khi xem chi tiết (request, ticket, payment)
- Swipe actions trên list items (swipe để chấp nhận/từ chối)
- Pull-to-refresh animation
- Skeleton loading placeholders
- Transition giữa các tab
- Status badge đổi màu mượt mà khi cập nhật
- **Không dùng cho logic**, chỉ dùng cho UX polish

---

### 5.2 Điểm cần xử lý Realtime

| Sự kiện | Ai gửi | Ai nhận | Cơ chế |
|---------|--------|---------|--------|
| Yêu cầu mượn đồ mới | Tenant A | Chủ đồ (Tenant B / Landlord) | Realtime subscription + Push notification |
| Phản hồi yêu cầu mượn | Chủ đồ | Tenant A | Realtime subscription + Push notification |
| Báo cáo sự cố mới | Tenant | Landlord | Realtime subscription + Push notification |
| Cập nhật trạng thái sự cố | Landlord | Tenant (người tạo) | Realtime subscription + Push notification |
| Tạo kỳ thu tiền | Landlord | Tất cả tenant | Push notification |
| Tenant báo đã thanh toán | Tenant | Landlord | Realtime subscription + Push notification |
| Nhắc thanh toán quá hạn | Hệ thống (cron) | Tenant chưa trả | Push notification qua Edge Function |
| Danh sách tenant thay đổi | — | — | Không cần realtime — fetch khi mở tab |
| Thông tin căn hộ | — | — | Không cần realtime — cache trong MMKV |

---

### 5.3 Phân quyền dữ liệu (RLS Policies)

| Dữ liệu | Tenant xem được | Landlord xem được |
|----------|-----------------|-------------------|
| Thông tin cá nhân | Của mình (đầy đủ) + Roommate (tên, avatar, phòng) | Tất cả tenant trong căn hộ mình (đầy đủ) |
| Yêu cầu mượn đồ | Tất cả trong căn hộ mình | Tất cả trong căn hộ mình |
| Báo cáo sự cố | Tất cả trong căn hộ mình | Tất cả trong căn hộ mình quản lý |
| Thanh toán | **Chỉ của mình** (nhạy cảm!) | Tất cả trong căn hộ mình |
| Revenue / Dashboard | Không truy cập | Chỉ landlord |
| Danh sách tài sản | Đọc | Đọc + Tạo + Sửa + Xóa |
| Thông tin căn hộ | Đọc | Đọc + Sửa |

> **Quan trọng:** Tenant A **không được** xem lịch sử thanh toán của Tenant B — đây là dữ liệu tài chính nhạy cảm.

---

## 6. Danh Sách Màn Hình

### 6.1 Màn hình dùng chung (Auth & Onboarding) — 6 màn hình

| # | Màn hình | Mô tả |
|---|---------|-------|
| A1 | **Splash** | Logo app, auto-check token trong MMKV → quyết định đi Welcome hay Home |
| A2 | **Welcome / Role Selection** | Chọn "Tôi là Chủ nhà" hoặc "Tôi là Người thuê" |
| A3 | **Sign Up** | Form: Họ tên, Email, Password, Xác nhận password |
| A4 | **Sign In** | Form: Email, Password, link "Quên mật khẩu" |
| A5 | **Forgot Password** | Nhập email → gửi link reset |
| A6 | **Join Apartment** | (Tenant) Nhập invite code để gia nhập căn hộ |

### 6.2 Màn hình Tenant — 12 màn hình (MVP)

| # | Màn hình | Mô tả |
|---|---------|-------|
| T1 | **Tenant Home** | Tổng quan: nhắc thanh toán, yêu cầu mượn đồ đang chờ, thông báo gần nhất |
| T2 | **Roommate List** | Danh sách người cùng ở: tên, avatar, phòng |
| T3 | **Borrow — List** | Danh sách yêu cầu mượn đồ (của mình + gửi đến mình), filter theo trạng thái |
| T4 | **Borrow — Create Request** | Form: chọn đồ, chọn người, ghi chú, thời gian mượn |
| T5 | **Borrow — Request Detail** | Chi tiết yêu cầu, timeline trạng thái, nút hành động |
| T6 | **Issues — List** | Danh sách báo cáo sự cố trong căn hộ, filter theo trạng thái & danh mục |
| T7 | **Issues — Create Report** | Form: danh mục, vị trí, mô tả, ảnh, mức độ khẩn cấp |
| T8 | **Issues — Report Detail** | Chi tiết báo cáo, timeline, ghi chú từ landlord |
| T9 | **Payments — History** | Lịch sử thanh toán, tháng hiện tại nổi bật trên cùng |
| T10 | **Payments — Detail** | Chi tiết kỳ thanh toán, nút "Tôi đã thanh toán", đính kèm ảnh |
| T11 | **Notifications** | Danh sách thông báo, đánh dấu đã đọc |
| T12 | **Profile / Settings** | Thông tin cá nhân, đổi mật khẩu, cài đặt thông báo, đăng xuất |

### 6.3 Màn hình Landlord — 14 màn hình (MVP)

| # | Màn hình | Mô tả |
|---|---------|-------|
| L1 | **Landlord Dashboard** | Tổng quan: doanh thu tháng, số tenant, sự cố chờ, thanh toán chưa xác nhận |
| L2 | **Apartment Setup** | Tạo/sửa thông tin căn hộ: tên, địa chỉ, số phòng |
| L3 | **Apartment — Invite Code** | Hiển thị invite code, nút copy/share |
| L4 | **Tenants — List** | Danh sách tenant: tên, phòng, trạng thái thanh toán tháng này |
| L5 | **Tenants — Detail** | Chi tiết tenant: liên hệ, lịch sử thanh toán, lịch sử báo cáo |
| L6 | **Assets — List** | Danh sách tài sản/đồ dùng, ai đang mượn gì |
| L7 | **Assets — Add/Edit** | Form: tên, loại, vị trí, tình trạng, ảnh |
| L8 | **Issues — List** | Tất cả báo cáo, filter theo trạng thái/mức độ |
| L9 | **Issues — Detail & Handle** | Chi tiết + nút: tiếp nhận, ghi chú, đóng |
| L10 | **Payments — Create Billing** | Tạo kỳ thu tiền: chọn tháng, danh sách tenant + số tiền, điều chỉnh, gửi |
| L11 | **Payments — Monthly Overview** | Ai đã trả, ai chưa, tổng thu tháng |
| L12 | **Payments — Confirm** | Chi tiết thanh toán tenant đã báo + nút xác nhận |
| L13 | **Revenue History** | Lịch sử doanh thu theo tháng |
| L14 | **Profile / Settings** | Thông tin cá nhân, quản lý căn hộ, đăng xuất |

**Tổng MVP: 32 màn hình** (6 chung + 12 tenant + 14 landlord)

### 6.4 Màn hình bổ sung Phase 2 — +10 màn hình

| # | Màn hình | Nhóm | Mô tả |
|---|---------|------|-------|
| P2-1 | **Community Feed** | Tenant | Newsfeed nội bộ: đăng bài, bình luận, like |
| P2-2 | **Chore Schedule** | Tenant | Lịch phân công việc nhà, xem vòng xoay, đánh dấu hoàn thành |
| P2-3 | **Utility Billing — Input** | Landlord | Nhập số đồng hồ điện/nước, tính tiền bậc thang VN |
| P2-4 | **Utility Billing — Detail** | Tenant | Xem chi tiết tiền điện/nước tháng này |
| P2-5 | **Apartment Rules** | Chung | Xem/quản lý nội quy căn hộ |
| P2-6 | **Gamification Dashboard** | Tenant | Xem điểm, huy hiệu, bảng xếp hạng |
| P2-7 | **Welcome Onboarding** | Tenant | Tour hướng dẫn cho tenant mới: nội quy, giới thiệu roommate, checklist |
| P2-8 | **Maintenance Rating** | Tenant | Đánh giá chất lượng sau khi sự cố được xử lý |
| P2-9 | **Revenue Analytics** | Landlord | Biểu đồ doanh thu, thống kê cơ bản |
| P2-10 | **Expense Tracking** | Landlord | Ghi nhận chi phí vận hành, xem lãi/lỗ |

### 6.5 Màn hình bổ sung Phase 3 — +12 màn hình

| # | Màn hình | Nhóm | Mô tả |
|---|---------|------|-------|
| P3-1 | **Multi-Apartment Switcher** | Landlord | Chọn căn hộ đang quản lý, tổng quan tất cả |
| P3-2 | **Expense Splitting — Overview** | Tenant | Xem ai nợ ai, simplify debts |
| P3-3 | **Expense Splitting — Add** | Tenant | Thêm chi phí chung cần chia |
| P3-4 | **Payment Gateway** | Tenant | Thanh toán trực tiếp qua MoMo/VNPay |
| P3-5 | **E-Lease — Create** | Landlord | Tạo hợp đồng từ template |
| P3-6 | **E-Lease — Sign** | Tenant | Xem và ký hợp đồng điện tử |
| P3-7 | **Document Storage** | Chung | Xem/upload hợp đồng, CMND/CCCD |
| P3-8 | **Chat — Conversations** | Chung | Danh sách cuộc trò chuyện |
| P3-9 | **Chat — Messages** | Chung | Nhắn tin chi tiết |
| P3-10 | **Internal Marketplace** | Tenant | Đăng bán/trao đổi đồ đạc |
| P3-11 | **Analytics Dashboard** | Landlord | Dashboard phân tích nâng cao, export báo cáo |
| P3-12 | **Move-in/out Checklist** | Chung | Checklist bàn giao phòng kèm ảnh + e-signature |

**Tổng toàn bộ: 54 màn hình** (32 MVP + 10 Phase 2 + 12 Phase 3)

---

## 7. Kế Hoạch Phát Triển Theo Giai Đoạn

### Phase 1 — MVP (4-6 tuần)

**Mục tiêu:** App hoạt động end-to-end cho 1 căn hộ với 4 flow chính. Đủ để cho 1-2 căn hộ thực tế dùng thử lấy feedback.

**Tính năng:**
- [x] Auth: đăng ký, đăng nhập, phân quyền Tenant / Landlord
- [x] Apartment setup + invite code
- [x] Tenant management (thêm, xem, xóa)
- [x] Item borrowing (full flow: tạo → chấp nhận/từ chối → trả → đóng)
- [x] Issue reporting (full flow: tạo → tiếp nhận → xử lý → đóng)
- [x] Payment tracking (tạo kỳ thu → tenant báo → landlord xác nhận)
- [x] Push notifications cho các sự kiện chính
- [x] Landlord dashboard cơ bản (tổng thu, sự cố chờ)

**Màn hình:** ~24/32 (bỏ qua Revenue History chi tiết, Asset Management nâng cao, Notification center riêng)

**Tuần 1-2:** Setup project, Auth flow, Supabase schema + RLS, Navigation structure
**Tuần 3:** Tenant management, Item borrowing flow
**Tuần 4:** Issue reporting flow
**Tuần 5:** Payment tracking flow, Push notifications
**Tuần 6:** Landlord dashboard, Testing, Bug fixing

---

### Phase 2 — Cải Thiện & Cộng Đồng (4-6 tuần)

**Mục tiêu:** Polish UX, thêm tính năng cộng đồng và quản lý đặc thù VN dựa trên feedback Phase 1.

**Tính năng cải thiện UX:**
- [ ] UX polish: skeleton loading, pull-to-refresh, swipe actions, micro-animations (Reanimated)
- [ ] Offline support cơ bản (cache MMKV, hiển thị dữ liệu cũ khi mất mạng)
- [ ] Image compression trước khi upload
- [ ] Deep linking cho notifications
- [ ] Notification center trong app
- [ ] Onboarding tutorial / Welcome flow cho tenant mới

**Tính năng mới — Cộng đồng (tham khảo Common, OurFlat):**
- [ ] Community Feed — mạng xã hội nội bộ cho cư dân
- [ ] Chore Scheduling — phân công dọn dẹp khu vực chung tự động
- [ ] Apartment Rules & Announcements — nội quy + thông báo chung
- [ ] Gamification cơ bản — điểm thưởng khi trả tiền đúng hạn, hoàn thành việc nhà

**Tính năng mới — Quản lý VN (tham khảo Jeasy, Lozido, RentRedi):**
- [ ] Utility Billing — tính tiền điện/nước theo bậc thang VN
- [ ] Video Maintenance Request — quay video mô tả sự cố
- [ ] Maintenance Feedback Rating — tenant đánh giá sau sửa chữa
- [ ] Expense Tracking — landlord ghi nhận chi phí vận hành
- [ ] Revenue Analytics — biểu đồ doanh thu theo tháng
- [ ] Asset management đầy đủ

**Màn hình mới:** +10 (xem mục 6.4)

**Tuần 1-2:** UX polish, Notification center, Welcome flow, Offline support
**Tuần 3-4:** Community Feed, Chore Scheduling, Gamification
**Tuần 5-6:** Utility Billing, Video Maintenance, Revenue Analytics, Expense Tracking

---

### Phase 3 — Mở Rộng & Scale (6-8 tuần)

**Mục tiêu:** Scale lên nhiều căn hộ, tích hợp thanh toán, chuyên nghiệp hóa.

**Tính năng — Scale (tham khảo Buildium, AppFolio):**
- [ ] Multi-Apartment Management — dashboard tổng hợp nhiều căn hộ
- [ ] E-Lease — hợp đồng điện tử với e-signature
- [ ] Document Storage — lưu hợp đồng, CMND/CCCD
- [ ] Bulk Communication — gửi thông báo hàng loạt
- [ ] Vendor Management — quản lý nhà thầu sửa chữa
- [ ] Analytics Dashboard nâng cao + Export PDF/Excel

**Tính năng — Tài chính (tham khảo Splitwise, TurboTenant):**
- [ ] Payment Integration — MoMo, VNPay, ZaloPay
- [ ] Shared Expense Splitting — chia tiền + "Simplify Debts"
- [ ] Auto Late Fee — tự động tính phí trả trễ
- [ ] Tenant Reputation Score — điểm uy tín tích lũy

**Tính năng — Giao tiếp & Engagement:**
- [ ] In-App Chat — nhắn tin trực tiếp không cần chia sẻ SĐT
- [ ] Zalo Notification Integration — gửi nhắc nhở qua Zalo OA
- [ ] Internal Marketplace — cư dân mua bán/trao đổi đồ đạc
- [ ] Move-in / Move-out Checklist — bàn giao phòng kèm ảnh + ký
- [ ] Referral Rewards — giới thiệu tenant mới nhận ưu đãi
- [ ] Localization (English)

**Màn hình mới:** +12 (xem mục 6.5)

---

## 8. Rủi Ro & Thách Thức

### 8.1 Rủi ro sản phẩm

| Rủi ro | Mức độ | Cách giảm thiểu |
|--------|--------|-----------------|
| **"Zalo đủ rồi" — user không adopt** | Cao | Tập trung vào điều Zalo không làm được: tracking trạng thái, lịch sử thanh toán có xác nhận 2 chiều, nhắc nhở tự động. Chiến lược: landlord adopt trước → yêu cầu tenant cài app để nhận thông tin. |
| **Tính năng mượn đồ bị lạm dụng** | Trung bình | Giới hạn số yêu cầu đang mở (tối đa 3). Cho phép landlord tắt tính năng. Tự động nhắc khi quá hạn. Thêm đánh giá ở phase 2. |
| **Landlord không chịu dùng app** | Trung bình | UX cực đơn giản, ít bước nhất. Dashboard mặc định hiển thị đúng thông tin cần. Onboarding tutorial. Xem xét vai trò "property manager". |
| **Dữ liệu thanh toán thiếu tin cậy** | Trung bình | MVP: ghi nhận thủ công 2 chiều (tenant báo + landlord xác nhận). Phase 3: tích hợp payment gateway tự động. |
| **Tenant cảm thấy bị giám sát** | Thấp | Thiết kế theo hướng "công cụ hỗ trợ cộng đồng", không phải "hệ thống kiểm soát". Tenant chủ động trong hầu hết flow. |

### 8.2 Rủi ro kỹ thuật

| Rủi ro | Mức độ | Cách giảm thiểu |
|--------|--------|-----------------|
| **Supabase Realtime khi scale** | Trung bình | MVP quy mô nhỏ nên OK. Khi scale: subscribe theo apartment_id (không subscribe toàn bộ bảng). Có fallback polling nếu realtime disconnect. |
| **RLS policies phức tạp dần** | Trung bình | Viết RLS từ đầu với cấu trúc rõ ràng. Tạo helper functions trong PostgreSQL. Test kỹ từng policy. Document mọi policy. |
| **React Native CLI build issues** | Trung bình | Lock version dependencies sớm. CI/CD từ Phase 1. Test trên cả iOS simulator và Android device thật. |
| **Redux state phình to (multi-apartment)** | Thấp | Normalize state từ đầu. Lazy load theo apartment active. Purge state apartment không active. |
| **MMKV sync conflict** | Thấp | MMKV chỉ là cache, không phải source of truth. Supabase DB luôn là source of truth. Khi mở app: fetch fresh → update MMKV → render. |
| **Push notification cross-platform** | Trung bình | Dùng FCM cho Android, APNs cho iOS qua Supabase Edge Functions. Hoặc dùng OneSignal để abstract. Test kỹ cả 2 platform. |

---

## Product Brief

**CoLiving** là ứng dụng mobile quản lý căn hộ cho thuê chung, phục vụ hai nhóm người dùng: **người thuê** và **chủ nhà**. App giải quyết ba vấn đề cốt lõi mà Zalo và Excel không xử lý tốt: (1) theo dõi mượn/trả đồ dùng giữa roommate một cách minh bạch, (2) quản lý báo cáo sự cố với trạng thái rõ ràng từ tạo đến giải quyết, và (3) ghi nhận thanh toán tiền thuê có xác nhận hai chiều kèm nhắc nhở tự động.

Xây dựng trên React Native CLI + Supabase, app ưu tiên realtime (cập nhật trạng thái tức thì) và bảo mật dữ liệu (tenant không xem được thông tin tài chính của nhau). Tổng cộng 32 màn hình, phát triển theo 3 giai đoạn: **Phase 1 (MVP, 4-6 tuần)** — đủ để 1 căn hộ dùng thực tế; **Phase 2 (3-4 tuần)** — UX polish, offline support, thống kê; **Phase 3 (6-8 tuần)** — multi-apartment, tích hợp thanh toán online, analytics nâng cao.
