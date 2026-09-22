# 🚀 Italy Driving License Platform - Full Completely Checked RESTful API Documentation

## 🌐 Base URL
- **Production Base URL**: `https://mbanglapatenteb.com/api/v1`
- **Root-level Alias Base URL**: `https://mbanglapatenteb.com/api`
- **Interactive Documentation**: `https://mbanglapatenteb.com/documentation.php`

---

## 🔒 Cross-Platform Synchronization & User Identity Architecture
All user activities (**Saved/Bookmarked MCQs**, **Noted MCQs**, **Wrong/Incorrect MCQs**, **Correct MCQs**, **Quiz & Exam Results**, **Support Chat Messages**, and **Progress Statistics**) are **100% seamlessly synchronized in real-time** between the **Flutter Mobile App** and the **Web Browser PWA**.

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

## ⚡ 0. Flutter App Performance & Zero-Delay Caching Rules (অ্যাপের স্পিড ও ইনস্ট্যান্ট লোডিং)
> **⚠️ CRITICAL DEVELOPER INSTRUCTION**: 
> অ্যাপের প্রতিটি স্ক্রিন ট্রানজিশন যেন **১ সেকেন্ডের অর্ধেক সময়ে ( < 500ms )** ইনস্ট্যান্টলি লোড হয়।
> 1. **Local State / Hive / SharedPreferences Caching**: পূর্বের ফেচ করা ডাটা লোকাল মেমোরি থেকে সাথে সাথে স্ক্রিনে রেন্ডার করবেন, ব্যাকগ্রাউন্ডে API কল করে লোকাল ডাটা রিফ্রেশ করবেন (Stale-While-Revalidate প্যাটার্ন)।
> 2. **🚫 NO DUMMY / RANDOM IMAGES**: কোনো প্রশ্নে ইমেজ ফিল্ড `null` বা খালি `""` থাকলে বা `/data/user/` লোকাল পাথ থাকলে ইমেজ কন্টেইনার সম্পূর্ণ হাইড (`Visibility(visible: hasValidImage)`) রাখবেন। ভুলেও কোনো ডামি বা আন্দাজে ছবি দেখাবেন না।

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

### 📊 Progress Card UI Data Mapping:
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

---

## 🔖 3. Saved / Bookmarked MCQs (সেভ / বুকমার্ক করা প্রশ্ন)
> **⚠️ STRICT DISTINCTION**:
> - **Save/Bookmark Button (বুকমার্ক আইকন)**: প্রশ্নটি ভবিষ্যতের জন্য বুকমার্ক করতে এই এন্ডপয়েন্ট ব্যবহার করুন।
> - **নোটের সাথে কোনো সম্পর্ক নেই**: নোটে ক্লিক করলে সেভ বাটনের কোনো API কল করা যাবে না।

- **Get Saved MCQs**: `GET /api/v1/saved-mcqs` (or `GET /api/saved-mcqs`, `GET /api/v1/bookmarks`)
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Toggle Save/Unsave**: `POST /api/v1/saved-mcqs/toggle` (or `POST /api/saved-mcqs/toggle`, `POST /api/v1/bookmarks/toggle`)
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
  "status": "success",
  "saved": true,
  "message": "Question added to bookmarks",
  "data": {
    "id": 10,
    "question_id": 105,
    "type": "argomenti"
  }
}
```

---

## 📝 4. Noted MCQs API (নোট করা প্রশ্ন — সম্পূর্ণ আলাদা ফিচার)
> **⚠️ CRITICAL WARNING FOR FLUTTER DEVELOPER**:
> MCQ কার্ডের **"নোট" (Note)** বাটনে ক্লিক করলে:
> 1. একটি Note Dialog / BottomSheet খুলবে যেখানে ইউজার নোট লিখতে পারবেন।
> 2. সেভ চাপলে `POST /api/v1/notes` অথবা `POST /api/v1/noted-mcqs/save` এন্ডপয়েন্টে পাঠাবেন।
> 3. ❌ ভুলেও নোটে ক্লিক করলে `Saved MCQs` এর toggle API কল করবেন না বা লোকাল BookmarkManager-এ সেভ করবেন না!
> 4. নোটকৃত প্রশ্নগুলো হোমপেজের **"Noted MCQs"** স্ক্রিন থেকে `GET /api/v1/noted-mcqs` দিয়ে লোড হবে।

### 📡 Get All Noted MCQs
- **Endpoint**: `GET /api/v1/noted-mcqs` (or `GET /api/v1/notes`, `GET /api/notes`)
- **Headers**: `X-Client-Phone: 01706640864`, `X-Session-ID: <session_id>`
- **Response Format**:
```json
{
  "status": "success",
  "total": 1,
  "data": [
    {
      "id": 1,
      "session_id": "c89b7b83-d9d1-4c75",
      "user_id": null,
      "question_id": 1,
      "page_id": 1,
      "type": "argomenti",
      "note_text": "এই প্রশ্নটিতে খেয়াল রাখবেন: হাইওয়েতে স্পিড ১৩০ কিমি/ঘণ্টা।",
      "created_at": "2026-09-22T10:00:00.000000Z",
      "updated_at": "2026-09-22T10:00:00.000000Z",
      "question": {
        "id": 1,
        "chapter_id": 1,
        "chapter_name": "Definizioni Generali",
        "italian": "Il limite massimo di velocita in autostrada e di 130 km/h",
        "bangla": "হাইওয়েতে সর্বোচ্চ গতিসীমা ১৩০ কিমি/ঘণ্টা",
        "is_vero": true,
        "image": null,
        "audio": "",
        "video": "",
        "type": "argomenti",
        "note_id": 1,
        "note_text": "এই প্রশ্নটিতে খেয়াল রাখবেন: হাইওয়েতে স্পিড ১৩০ কিমি/ঘণ্টা।"
      }
    }
  ]
}
```

### 💾 Save or Edit Note
- **Endpoint**: `POST /api/v1/notes` (or `POST /api/v1/noted-mcqs/save`, `POST /api/v1/noted-mcqs`)
- **Headers**: `X-Client-Phone: 01706640864`, `X-Session-ID: <session_id>`
- **Body Payload**:
```json
{
  "question_id": 1,
  "page_id": 1,
  "type": "argomenti",
  "note_text": "এই প্রশ্নটিতে খেয়াল রাখবেন: হাইওয়েতে স্পিড ১৩০ কিমি/ঘণ্টা।",
  "phone": "01706640864",
  "session_id": "c89b7b83-d9d1-4c75"
}
```
- **Response**:
```json
{
  "status": "success",
  "message": "নোট সফলভাবে সংরক্ষণ করা হয়েছে",
  "data": {
    "id": 1,
    "question_id": 1,
    "note_text": "এই প্রশ্নটিতে খেয়াল রাখবেন: হাইওয়েতে স্পিড ১৩০ কিমি/ঘণ্টা।"
  }
}
```

### 🗑️ Delete Note
- **Endpoint**: `DELETE /api/v1/notes/{id}` (or `POST /api/v1/noted-mcqs/delete`)
- **Body**: `{"id": 1, "phone": "01706640864"}`

---

## ✔ 5. Correct MCQs (সঠিক উত্তরের প্রশ্ন)
- **Get Correct MCQs**: `GET /api/v1/correct-mcqs` (or `GET /api/correct-mcqs`)
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Query Filters**: `?phone=01706640864&chapter_id=1&page_id=2&date=2026-09-22&search=autostrada`

---

## ❌ 6. Wrong / Incorrette MCQs (ভুল উত্তরের প্রশ্ন)
- **Get Wrong MCQs**: `GET /api/v1/wrong-mcqs` (or `GET /api/wrong-mcqs`)
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
- **Scheda Esame (Official 30 MCQs)**: `GET /api/v1/quiz/exam` (or `GET /api/scheda-esame/generate`)
- **Submit Exam**: `POST /api/v1/scheda-esame/submit`

---

## 📖 10. Dictionary & Translation API
- **Search Vocabulary**: `GET /api/v1/dictionary/search?q=motoveicolo`
- **All Terms**: `GET /api/v1/dictionary/all`
- **Instant Translation**: `POST /api/v1/translate` (Body: `{"text": "corsia di emergenza", "from_lang": "it", "to_lang": "bn"}`)

---

## 💬 11. Support, Live Chat & Registration Workflow (লাইভ চ্যাট ও রেজিস্ট্রেশন ফ্লো)

যখন এডমিন প্যানেল থেকে **License Protection ON** থাকে, তখন মোবাইল অ্যাপে নিচের ধারাবাহিক ধাপে রেজিস্ট্রেশন ও অ্যাক্টিভেশন সম্পন্ন হয়:

### 📱 ধাপ ১: কাস্টমার রেজিস্ট্রেশন (First Name, Last Name, Phone Number)
- **Endpoint**: `POST /api/v1/support/register`
- **Method**: `POST`
- **Body Payload**:
```json
{
  "first_name": "Md",
  "last_name": "Rahim",
  "phone": "01706640864",
  "session_id": "c89b7b83-d9d1-4c75"
}
```
- **Response Format**:
```json
{
  "success": true,
  "user": {
    "id": "7b2e91a0-4f51-4c28",
    "first_name": "Md",
    "last_name": "Rahim",
    "phone": "01706640864"
  },
  "client": {
    "id": 15,
    "first_name": "Md",
    "last_name": "Rahim",
    "phone": "01706640864",
    "is_active": false
  },
  "license_status": "inactive",
  "token": "1|qXy...sanctum_token"
}
```

---

### 💬 ধাপ ২: লাইভ সাপোর্ট মেসেজ আদান-প্রদান (Chat Room)
- **Get Messages**: `GET /api/v1/chat/messages?phone=01706640864&session_id=<session_id>`
- **Send Message**: `POST /api/v1/chat/messages`
  - Body: `{"phone": "01706640864", "session_id": "<session_id>", "message": "আমার লাইসেন্স কি একটিভ করে দিন প্লিজ"}`
- **Upload Chat Image**: `POST /api/v1/chat/upload-image` (Multipart `image` file)

---

### 🔓 ধাপ ৩: এডমিন দ্বারা লাইসেন্স কি অ্যাক্টিভেশন (Admin Activation)
- এডমিন প্যানেলে **Manage Customers** বা **Chat Room** থেকে এডমিন "পাঠান ও একটিভ করুন" বাটনে ক্লিক করলে:
- **Endpoint**: `POST /api/v1/client/activate`
- **Body Payload**:
```json
{
  "phone": "01706640864",
  "days": 365
}
```

---

### 🔓 ধাপ ৪: অ্যাপে লাইসেন্স স্ট্যাটাস চেক ও আনলক (App Unlock)
- **Endpoint**: `GET /api/v1/license/status`
- **Headers**: `X-Client-Phone: 01706640864`, `X-Session-ID: <session_id>`
- **Active Response**:
```json
{
  "success": true,
  "status": "active",
  "license_status": "active",
  "license": {
    "license_key": "729104",
    "status": "active",
    "activated_at": "2026-09-22T00:00:00.000000Z",
    "expires_at": "2027-09-22T00:00:00.000000Z"
  }
}
```

---

## 🛡️ 12. License Protection & Free Access Mode Enforcement (লাইসেন্স প্রোটেকশন গেট)

Admin প্যানেলের **"License Protection & Free Access Settings"** থেকে কন্ট্রোল করা হয় কাস্টমার রেজিস্ট্রেশন ও লাইসেন্স কি ছাড়া ফ্রিলি পড়তে পারবে, নাকি লাইসেন্স কি এবং কিউআর কোড স্ক্যান বাধ্যতামূলক।

### ⚠️ FLUTTER APP LOGIC:
1. **🔴 License Protection Mode ON (এডমিন প্যানেলে টিক দেওয়া থাকলে)**:
   - অ্যাপ চালু হলে `GET /api/v1/license/status` কল করবে।
   - যদি `status != "active"` এবং `protection_disabled == false` হয়, তবে সরাসরি অ্যাপের কন্টেন্ট লক থাকবে।
   - ইউজারকে রেজিস্ট্রেশন স্ক্রিন (First Name, Last Name, Phone Number) প্রদর্শন করবে এবং `POST /api/v1/support/register` পাঠাবে।
   - এডমিন একটিভ করার পর আনলক হবে।
2. **🟢 Free Access Mode (এডমিন প্যানেলে টিক উঠিয়ে দিলে)**:
   - `GET /api/v1/license/status` রেসপন্সে `protection_disabled: true` ও `status: "active"` আসবে।
   - কোনো রেজিস্ট্রেশন বা লাইসেন্স কি ছাড়াই অ্যাপ সরাসরি উন্মুক্ত থাকবে।
