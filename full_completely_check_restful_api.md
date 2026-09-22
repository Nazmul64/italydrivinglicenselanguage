# 🚀 Italy Driving License Platform - Full Completely Checked RESTful API Documentation

## 🌐 Base URL
- **Production Base URL**: `https://mbanglapatenteb.com/api/v1`
- **Root-level Alias Base URL**: `https://mbanglapatenteb.com/api`
- **Interactive Documentation**: `https://mbanglapatenteb.com/documentation.php`

---

## 🔒 Cross-Platform Synchronization & User Identity Architecture
All user activities (**Noted MCQs**, **Saved/Bookmarked MCQs**, **Wrong/Incorrect MCQs**, **Correct MCQs**, **Quiz & Exam Results**, **Support Chat Messages**, and **Progress Statistics**) are **100% seamlessly synchronized in real-time** between the **Flutter Mobile App** and the **Web Browser PWA**.

### 📱 Unified User Identification Header & Context Priority
The backend automatically resolves the user identity across platforms via the `ResolvesUserSession` trait:
1. **Bearer Token** (`Authorization: Bearer <token>` via Laravel Sanctum)
2. **Phone Number Headers & Parameters**:
   - HTTP Header: `X-Client-Phone: 01706640864`
   - Query / Body Parameter: `?phone=01706640864` or `?user_phone=01706640864`
   - Cookie / Web Session: `app_client_phone`
3. **Session ID Headers & Parameters**:
   - HTTP Header: `X-Session-ID: <session_id>` or `X-Client-Session-ID: <session_id>`
   - Query / Body Parameter: `?session_id=<session_id>`
   - Cookie: `app_client_session_id`, `qr_session_id`

---

## 🎴 1. Home Navigation Cards API (হোম সার্ভিসেস কার্ড / আইকন / ইমেজ / Lottie JSON)

Admin প্যানেল থেকে হোম পেজের কার্ডগুলোর নাম, আইকন, ছবি, Lottie অ্যানিমেশন JSON বা ক্রম পরিবর্তন করলে Flutter অ্যাপেও যেন স্বয়ংক্রিয়ভাবে রিয়েল-টাইমে আপডেট হয়ে যায়।

### 📡 Get Active Home Cards
- **Endpoint**: `GET /api/v1/home-cards` (or `GET /api/home-cards`)
- **Method**: `GET`
- **Response Format**:
```json
{
  "status": "success",
  "total": 18,
  "data": [
    {
      "id": 1,
      "title": "Lezioni",
      "subtitle": "ক্লাস ভিডিও",
      "screen_key": "lezioni",
      "media_type": "image",
      "icon_class": "fa-solid fa-video",
      "icon_color": "#3B82F6",
      "color": "#3B82F6",
      "icon_url": null,
      "image_url": "https://mbanglapatenteb.com/uploads/cards/card_img_1790047087_306.webp",
      "lottie_url": "https://mbanglapatenteb.com/uploads/cards/lottie/lottie_lezioni.json",
      "order_index": 1,
      "status": true
    },
    {
      "id": 2,
      "title": "Test",
      "subtitle": "অনুশীলন টেস্ট",
      "screen_key": "test",
      "media_type": "image",
      "icon_class": "fa-solid fa-laptop-code",
      "icon_color": "#3B82F6",
      "color": "#3B82F6",
      "icon_url": null,
      "image_url": "https://mbanglapatenteb.com/uploads/cards/card_img_1790055113_489.webp",
      "lottie_url": "https://mbanglapatenteb.com/uploads/cards/lottie/lottie_test.json",
      "order_index": 2,
      "status": true
    },
    {
      "id": 3,
      "title": "Argomenti",
      "subtitle": "অধ্যায়সমূহ",
      "screen_key": "argomenti",
      "media_type": "image",
      "icon_class": "fa-solid fa-book-open",
      "icon_color": "#10B981",
      "color": "#10B981",
      "icon_url": null,
      "image_url": "https://mbanglapatenteb.com/uploads/cards/card_img_1790055395_599.webp",
      "lottie_url": "https://mbanglapatenteb.com/uploads/cards/lottie/lottie_argomenti.json",
      "order_index": 3,
      "status": true
    }
  ]
}
```

---

## 📚 2. Argomenti (Chapters & Pages with User Statistics)

### 📖 Get All Chapters with Statistics
- **Endpoint**: `GET /api/v1/chapters` (or `GET /api/chapters`)
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Response**:
```json
[
  {
    "id": 1,
    "chapter_number": 1,
    "name": "Italian Driving Licence Quiz 2026 with official",
    "bn_name": "একেবারে নিচ পর্যন্ত নেমে যাও",
    "image": "https://mbanglapatenteb.com/uploads/chapters/chapter_cover_1789783335_739.webp",
    "cover_image": "https://mbanglapatenteb.com/uploads/chapters/chapter_cover_1789783335_739.webp",
    "question_count": 535,
    "questions_count": 535,
    "totale": 535,
    "corrette": 149,
    "errori": 40,
    "non_risposte": 346
  }
]
```

### 📄 Get Pages for a Chapter
- **Endpoint**: `GET /api/v1/chapters/{id}/pages`
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Response**:
```json
[
  {
    "id": 1,
    "chapter_id": 1,
    "sort_order": 1,
    "title": "theory and real Ministry questions",
    "bn_title": "নিচ পর্যন্ত যাও, তারপর ডান দিকে ঘুরো",
    "image": "https://mbanglapatenteb.com/uploads/pages/images/page_img_1_1790056046_178.webp",
    "questions_count": 25,
    "totale": 25,
    "corrette": 15,
    "errori": 2,
    "non_risposte": 8
  }
]
```

### 📝 Get Page Details & Questions
- **Endpoint**: `GET /api/v1/pages/{id}`
- **Response**:
```json
{
  "id": 1,
  "chapter_id": 1,
  "title": "theory and real Ministry questions",
  "image": "https://mbanglapatenteb.com/uploads/pages/images/page_img_1_1790056046_178.webp",
  "questions": [
    {
      "id": 1,
      "chapter": 1,
      "question_type": "vero_falso",
      "sort_order": 1,
      "italian": "Italian Driving Licence Quiz 2026 with official",
      "bangla": "ইতালিয়ান ড্রাইভিং লাইসেন্স কুইজ ২০২৬",
      "is_vero": true,
      "image": "",
      "audio": "",
      "video": "",
      "vocabulary": [
        {
          "italian": "official",
          "bangla": "অফিসিয়াল",
          "image": "https://mbanglapatenteb.com/uploads/vocabulary/vocab_1790044472_476.png"
        }
      ]
    }
  ]
}
```

---

## 🔖 3. Saved / Bookmarked MCQs (সেভ / বুকমার্ক করা প্রশ্ন)
- **Get Saved MCQs**: `GET /api/v1/saved-mcqs` (or `GET /api/saved-mcqs`)
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Toggle Save/Unsave**: `POST /api/v1/saved-mcqs/toggle` (or `POST /api/saved-mcqs/toggle`)
  - **Body Payload**:
```json
{
  "question_id": 105,
  "type": "argomenti",
  "phone": "01706640864",
  "session_id": "c89b7b83-d9d1-4c75"
}
```
  - **Response**:
```json
{
  "status": "saved",
  "saved": true,
  "message": "প্রশ্নটি সেভ করা হয়েছে"
}
```

---

## 📝 4. Noted MCQs (নোট করা প্রশ্ন)
- **Get All Noted MCQs**: `GET /api/v1/noted-mcqs` (or `GET /api/notes`)
- **Save / Edit Note**: `POST /api/v1/notes` (or `POST /api/v1/noted-mcqs/save`)
  - **Body Payload**:
```json
{
  "question_id": 105,
  "page_id": 1,
  "type": "argomenti",
  "note_text": "মনে রাখবেন এই প্রশ্নের উত্তর সর্বদা Vero",
  "phone": "01706640864",
  "session_id": "c89b7b83-d9d1-4c75"
}
```
- **Delete Note**: `DELETE /api/v1/notes/{id}` or `POST /api/v1/noted-mcqs/delete`

---

## ✔ 5. Correct MCQs (সঠিক উত্তরের প্রশ্ন)
- **Get Correct MCQs**: `GET /api/v1/correct-mcqs`
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Query Filters**: `?phone=01706640864&chapter_id=1&page_id=2&date=2026-09-22&search=autostrada`

---

## ❌ 6. Wrong / Incorrette MCQs (ভুল উত্তরের প্রশ্ন)
- **Get Wrong MCQs**: `GET /api/v1/wrong-mcqs`
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Query Filters**: `?phone=01706640864&chapter_id=1&page_id=2&date=2026-09-22&search=strada`

---

## 📊 7. Submit MCQ Results (লগ টেস্ট ও প্র্যাকটিস ফলাফল)
- **Endpoint**: `POST /api/v1/user-mcq-results/log` (or `POST /api/user-mcq-results`)
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Body Payload**:
```json
{
  "phone": "01706640864",
  "session_id": "c89b7b83-d9d1-4c75",
  "results": [
    {
      "question_id": 105,
      "question_type": "argomenti",
      "user_answer": "V",
      "is_correct": 1
    },
    {
      "question_id": 102,
      "question_type": "argomenti",
      "user_answer": "F",
      "is_correct": 0
    }
  ]
}
```

---

## 🚸 8. Cartelli (Road Signs) API
- **Categories**: `GET /api/v1/cartelli/categories`
- **Chapters**: `GET /api/v1/cartelli/chapters/{categoryId?}`
- **Pages**: `GET /api/v1/cartelli/pages/{chapterId}`
- **Page MCQs**: `GET /api/v1/cartelli/page-mcqs/{pageId}`
- **Chapter MCQs**: `GET /api/v1/cartelli/chapter-mcqs/{chapterId}`

---

## 🎓 9. Exam Simulation & Practice Quizzes
- **Scheda Esame (Official 30 MCQs)**: `GET /api/v1/quiz/exam` (or `GET /api/quiz/exam`)
- **Random Practice Quiz**: `GET /api/questions/random-test`

---

## 📖 10. Dictionary & Translation API
- **Search Vocabulary**: `GET /api/v1/dictionary/search?q=motoveicolo`
- **All Terms**: `GET /api/v1/dictionary/all`
- **Instant Translation**: `POST /api/v1/translate` (Body: `{"text": "corsia di emergenza", "from_lang": "it", "to_lang": "bn"}`)

---

## 💬 11. Support & Live Chat Messages
- **Get Messages**: `GET /api/v1/chat/messages?phone=01706640864&session_id=<session_id>`
- **Send Message**: `POST /api/v1/chat/messages`
  - Body: `{"phone": "01706640864", "session_id": "<session_id>", "message": "আমার লাইসেন্স সংক্রান্ত জিজ্ঞাসা"}`
- **Upload Chat Image**: `POST /api/v1/chat/upload-image` (Multipart `image` file)
