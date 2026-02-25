# 🎬 Check Giá Vé Phim

> Webapp mobile-first giúp người dùng **so sánh giá vé xem phim** giữa 3 sàn **MoMo**, **ZaloPay**, **VNPay** và kiểm tra ghế trống trước khi đặt vé.

![Tech Stack](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black&style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white&style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white&style=flat-square)

---

## 📋 Mô tả dự án

Webapp **Check Giá Vé Phim** là một ứng dụng tra cứu giá vé phim dạng wizard (step-by-step), giúp người dùng:

1. **Chọn phim** đang chiếu tại Hải Phòng
2. **Chọn ngày** muốn xem
3. **So sánh giá vé** từ 3 sàn (MoMo / ZaloPay / VNPay) trên tất cả các rạp
4. **Kiểm tra ghế trống** với sơ đồ ghế trực quan trước khi quyết định đặt vé

### 🎯 Mục tiêu
- **Không đặt vé** — chỉ tra cứu giá và tình trạng ghế
- Người dùng tìm được **suất chiếu rẻ nhất** + **ghế trống thuận lợi** → quyết định chọn sàn nào để đặt
- Giao diện **mobile-first** (desktop cũng dùng layout mobile, max-width 420px)

---

## 🏗️ Kiến trúc

```
ticket-price-checker-webapp/
├── backend/              # Python FastAPI
│   ├── main.py           # API endpoints (FastAPI)
│   ├── data.py           # In-memory data store (mock)
│   ├── database/         # MongoDB connection (cho production)
│   ├── models/           # Pydantic models
│   └── requirements.txt
├── frontend/             # ReactJS (Vite)
│   ├── src/
│   │   ├── App.jsx       # Wizard state machine
│   │   ├── App.css       # Design system (dark cinema theme)
│   │   ├── components/
│   │   │   ├── StepMovies.jsx      # Bước 1: Chọn phim
│   │   │   ├── StepDates.jsx       # Bước 2: Chọn ngày
│   │   │   ├── StepShowtimes.jsx   # Bước 3: Chọn suất (all rạp + giá)
│   │   │   ├── StepSeatMap.jsx     # Bước 4: Sơ đồ ghế trống
│   │   │   ├── PriceCard.jsx       # Card giá từng sàn
│   │   │   ├── SearchBox.jsx       # Ô tìm kiếm
│   │   │   └── Skeleton.jsx        # Loading skeleton
│   │   ├── api/
│   │   │   └── client.js           # API client (fetch)
│   │   └── utils/
│   │       └── helpers.js          # Format giá, ngày, tìm best price
│   └── index.html
└── README.md
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- **Python** 3.10+
- **Node.js** 18+
- **MongoDB** (tuỳ chọn — hiện tại dùng in-memory data)

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Mở **http://localhost:5173** trên trình duyệt.

---

## 📡 API Endpoints

| Method | Endpoint | Params | Mô tả |
|--------|----------|--------|--------|
| `GET` | `/api/movies` | — | Danh sách phim đang chiếu |
| `GET` | `/api/dates` | `movieId`, `cinemaId?` | Ngày có suất chiếu |
| `GET` | `/api/cinemas` | `movieId`, `date?` | Rạp có suất chiếu |
| `GET` | `/api/showtimes` | `movieId`, `date`, `cinemaId?` | Suất chiếu + giá 3 sàn |
| `GET` | `/api/seats` | `showtimeId` | Sơ đồ ghế (trống/đã đặt) |

---

## 🎨 Luồng người dùng (Wizard Flow)

```
┌─────────┐    ┌─────────┐    ┌──────────────────┐    ┌─────────────┐
│ Chọn    │───▶│ Chọn    │───▶│ Chọn suất chiếu  │───▶│ Kiểm tra    │
│ Phim    │    │ Ngày    │    │ (all rạp + giá)  │    │ ghế trống   │
└─────────┘    └─────────┘    └──────────────────┘    └─────────────┘
  Step 0         Step 1            Step 2                 Step 3
```

### Step 0 — Chọn phim
- Danh sách phim đang chiếu tại HP
- Tìm kiếm accent-insensitive
- Card hiển thị: poster, tên, thể loại, thời lượng, rating

### Step 1 — Chọn ngày
- Horizontal date picker (7 ngày)
- Highlight "Hôm nay"

### Step 2 — Chọn suất chiếu
- **Tổng hợp từ TẤT CẢ rạp** cho phim + ngày đã chọn
- Nhóm theo rạp (CGV / Lotte / BHD / Galaxy)
- **Filter** theo chuỗi rạp và loại ghế (Thường/VIP)
- Mỗi card suất hiển thị **giá 3 sàn** inline
- 🏆 Badge **"Giá tốt nhất"** cho suất rẻ nhất toàn màn hình

### Step 3 — Kiểm tra ghế trống
- Sơ đồ ghế cinema-style (tham khảo ZaloPay)
- **MÀN HÌNH** indicator phía trên
- Màu sắc phân loại: Thường (xanh) / VIP (tím) / Đôi (cam)
- × đánh dấu ghế đã đặt
- Progress bar tình trạng ghế (vd: 46/108 ghế trống)
- Giá 3 sàn hiển thị mini với badge "Tốt nhất"
- Nút "Đổi suất chiếu" / "Tra cứu lại"

---

## 🛠️ Tech Stack

| Layer | Công nghệ | Ghi chú |
|-------|-----------|---------|
| Frontend | ReactJS + Vite | Vanilla CSS, dark theme |
| Backend | Python FastAPI | In-memory data (mock) |
| Database | MongoDB (planned) | Motor async driver |
| Design | Mobile-first | Max-width 420px, dark cinema theme |

---

## 📝 Ghi chú phát triển

- **Data hiện tại là mock** — 5 phim, 4 rạp, 7 ngày, ~700 suất chiếu với giá ngẫu nhiên
- Khi có data thật, chỉ cần thay `data.py` bằng MongoDB queries trong `database/`
- Backend dùng in-memory data để **không cần MongoDB** khi dev/demo
- Ghế trống được generate ngẫu nhiên (seed by showtimeId để consistent)

---

## 📄 License

MIT
