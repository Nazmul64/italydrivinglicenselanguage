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

### ⚠️ IMPORTANT INSTRUCTIONS FOR FLUTTER DEVELOPER:
1. **🚫 NO CIRCLE AVATARS / NO CIRCULAR BORDERS (গোল দাগ বা সার্কেল বাদ দিন)**:
   - কার্ডের ছবি বা আইকনকে কোনো `CircleAvatar` বা গোলাকার বৃত্তের (Circle Container) মধ্যে রাখবেন না।
   - ছবি সরাসরি কার্ডের মাঝে বড় এবং সুস্পষ্টভাবে দেখান (`fit: BoxFit.contain`, `height: 80` বা `90`, `BorderRadius.circular(12)` দিয়ে স্কয়ার/রেক্টাঙ্গুলার আকারে)।
2. **🖼️ Dynamic Media Type Rendering**:
   - `media_type == "image"`: `Image.network(card.imageUrl, fit: BoxFit.contain, height: 80)`
   - `media_type == "lottie"`: `Lottie.network(card.lottieUrl, height: 80, fit: BoxFit.contain)`
   - `media_type == "icon"`: `FaIcon(getIcon(card.iconClass), color: hexToColor(card.iconColor), size: 50)`

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

## 🖼️ 1.1 Home Banner Sliders API (হোম পেজ ব্যানার স্লাইডার)

হোম পেজের শীর্ষ ব্যানার স্লাইডারগুলো ডাইনামিকভাবে লোড করার জন্য এই API ব্যবহার করা হয়।

### 📡 Get Active Sliders
- **Endpoint**: `GET /api/v1/sliders` (or `GET /api/sliders`, `GET /api/v1/dashboard/banners`)
- **Method**: `GET`
- **Response Format**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "Patente B Official Course 2026",
      "subtitle": "সম্পূর্ণ বাংলায় ইতালিয়ান ড্রাইভিং লাইসেন্স প্রস্তুতি",
      "image_url": "https://mbanglapatenteb.com/uploads/sliders/slider_1790045000_102.webp",
      "link_type": "screen",
      "link_value": "argomenti",
      "order_index": 1,
      "status": 1
    }
  ]
}
```

---

## 📚 2. Argomenti (Chapters & Pages with User Statistics & Real-time Progress)

Flutter অ্যাপের **"Scegli Categoria"** (Capitoli List) এবং **"Scegli Scheda"** (Pages List) স্ক্রিনের প্রতিটি চ্যাপ্টার ও পেজ কার্ডে ব্যবহারকারীর রিয়েল-টাইম প্রোগ্রেস স্ট্যাটিস্টিকস প্রদর্শনের জন্য নিচের API গুলো ব্যবহৃত হয়।

### ⚠️ IMPORTANT FOR FLUTTER DEVELOPER (MCQ IMAGE & EMPTY STATE):
1. **🚫 NO DUMMY/RANDOM IMAGE FOR MCQs (আন্দাজে ইমেজ দেখানো যাবে না)**:
   - যদি কোনো MCQ প্রশ্নে ছবি আপলোড না করা থাকে (`image` ফিল্ড `null` বা খালি `""`), তবে কোনো ডিফল্ট বা স্যাম্পল ছবি দেখাবেন না। ইমেজ বক্সটি সম্পূর্ণ হাইড (`Visibility(visible: question.image != null && question.image!.isNotEmpty)`) রাখুন।
2. **🚫 NO FAKE QUESTIONS ON EMPTY PAGES**:
   - যদি কোনো চ্যাপ্টার বা পেজে কোনো প্রশ্ন না থাকে (`questions` খালি `[]`), তবে খালি প্লেসহোল্ডার ("Nessuna domanda trovata") দেখান, কোনো ডামি বা আন্দাজে প্রশ্ন ইনজেক্ট করবেন না।

### 📊 Progress Card UI Data Mapping (স্ক্রিনশটের মতো):
- **Corrette**: ব্যবহারকারীর সঠিক দেওয়া উত্তরের সংখ্যা (`corrette`).
- **Errori**: ব্যবহারকারীর ভুল দেওয়া উত্তরের সংখ্যা (`errori`).
- **Non risposte**: এখনও উত্তর না দেওয়া বাকি প্রশ্নের সংখ্যা (`non_risposte = totale - corrette - errori`).
- **Totale**: চ্যাপ্টার বা পেজের মোট MCQ সংখ্যা (`totale` বা `questions_count`).
- **Progress Bar**: সবুজ অংশ = `(corrette / totale) * 100%`, লাল অংশ = `(errori / totale) * 100%`, ধূসর অংশ = বাকি প্রশ্ন।

### 📖 Get All Chapters with User Statistics
- **Endpoint**: `GET /api/v1/chapters` (or `GET /api/chapters`)
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Response Format**:
```json
[
  {
    "id": 1,
    "chapter_number": 1,
    "name": "DOVERI NELL'USO DELLA STRADA",
    "bn_name": "রাস্তা ব্যবহারের নিয়মাবলী",
    "image": "https://mbanglapatenteb.com/uploads/chapters/chapter_cover_1789783335_739.webp",
    "cover_image": "https://mbanglapatenteb.com/uploads/chapters/chapter_cover_1789783335_739.webp",
    "question_count": 535,
    "questions_count": 535,
    "totale": 535,
    "corrette": 149,
    "errori": 40,
    "non_risposte": 346
  },
  {
    "id": 2,
    "chapter_number": 2,
    "name": "SEGNALI DI PERICOLO",
    "bn_name": "বিপদ সংকেতসমূহ",
    "image": "https://mbanglapatenteb.com/uploads/chapters/chapter_cover_1789783336_740.webp",
    "cover_image": "https://mbanglapatenteb.com/uploads/chapters/chapter_cover_1789783336_740.webp",
    "question_count": 662,
    "questions_count": 662,
    "totale": 662,
    "corrette": 174,
    "errori": 29,
    "non_risposte": 459
  }
]
```

### 📄 Get Pages for a Specific Chapter with Statistics
- **Endpoint**: `GET /api/v1/chapters/{id}/pages` (or `GET /api/chapters/{id}/pages`)
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Response Format**:
```json
[
  {
    "id": 1,
    "chapter_id": 1,
    "sort_order": 1,
    "title": "THEORY AND REAL MINISTRY QUESTIONS",
    "bn_title": "থিওরি ও মন্ত্রণালয়ের অফিসিয়াল প্রশ্নসমূহ",
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

---

## 🛡️ 12. License Protection & Free Access Mode API (লাইসেন্স প্রোটেকশন ও ফ্রি অ্যাক্সেস মোড)

Admin প্যানেলের **"License Protection & Free Access Settings"** থেকে কন্ট্রোল করা যায় কাস্টমার রেজিস্ট্রেশন ও লাইসেন্স কি ছাড়া ফ্রিলি পড়তে পারবে, নাকি লাইসেন্স কি এবং কিউআর কোড স্ক্যান বাধ্যতামূলক।

### ⚙️ Setting Modes:
1. **🔴 License Protection Mode ON (প্রোটেকশন লক সক্রিয়)**:
   - এডমিন প্যানেলে চেকবক্স **টিক দেওয়া থাকলে (Checked / ON)**।
   - অ্যাপে ফার্স্ট নেম, লাস্ট নেম ও ফোন নম্বর দিয়ে লাইসেন্স কি নেওয়া বাধ্যতামূলক।
   - ওয়েবসাইট ব্যবহারের জন্য মোবাইল অ্যাপ দিয়ে কিউআর কোড স্ক্যান করে আনলক করতে হবে।

2. **🟢 Free Access Mode (ফ্রি অ্যাক্সেস সক্রিয়)**:
   - এডমিন প্যানেলে চেকবক্স **টিক উঠিয়ে দিলে (Unchecked / OFF)**।
   - কাস্টমার ফার্স্ট নেম, লাস্ট নেম, ফোন নম্বর বা লাইসেন্স কি ছাড়াই ওয়েবসাইট ও মোবাইল অ্যাপে সরাসরি ফ্রিলি সম্পূর্ণ অ্যাক্সেস পাবে।
   - কোনো কিউআর কোড স্ক্যান লাগবে না।

### 📡 Check License & Protection Status
- **Endpoint**: `GET /api/v1/license/status` (or `GET /api/v1/settings`)
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Response when Protection is ON (Unregistered / Locked User)**:
```json
{
  "success": false,
  "status": "inactive",
  "protection_disabled": false,
  "message": "License key is required or inactive."
}
```
- **Response when Free Access is ON (Protection OFF)**:
```json
{
  "success": true,
  "status": "active",
  "protection_disabled": true,
  "license": {
    "license_key": "FREE_ACCESS",
    "status": "active",
    "activated_at": "2026-09-22T00:00:00.000000Z",
    "expires_at": "2027-09-22T00:00:00.000000Z"
  }
}
```

### 📱 User Registration & License Request
- **Endpoint**: `POST /api/v1/support/register`
- **Body Payload**:
```json
{
  "first_name": "Md",
  "last_name": "Rahim",
  "phone": "01706640864",
  "session_id": "<session_id>"
}
```
- **Response**:
```json
{
  "status": "success",
  "message": "Registration successful",
  "license_key": "729104",
  "is_active": true
}
```

### 🔓 Admin/Client Activate License
- **Endpoint**: `POST /api/v1/client/activate`
- **Body**: `{"phone": "01706640864", "days": 365}`

