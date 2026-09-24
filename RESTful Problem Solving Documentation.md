# 📱🌐 RESTful API Problem Solving & Cross-Platform Synchronization Documentation

> **Project:** Italy Driving License Bangla Main Site & Mobile App (`mbanglapatenteb.com`)  
> **Documentation Target:** Mobile App (Flutter / Android / iOS) & Web PWA Cross-Platform Synchronization  
> **Updated Date:** September 2026

---

## 📌 ১. সমস্যা ও কারণ বিশ্লেষণ (Problem Diagnosis & Root Causes)

### সমস্যা (The Issue):
ব্যবহারকারী যখন **মোবাইল অ্যাপস** থেকে কোনো **টেস্ট (Test / Scheda Esame)** দিতেন, **নোট (Note)** করতেন, অথবা কোনো প্রশ্ন **সেভ (Bookmark / Saved MCQ)** করতেন:
- মোবাইল অ্যাপসে সেই ডাটা লোকালভাবে বা অ্যাপসে দেখা যেত, কিন্তু **ওয়েবসাইটে গিয়ে দেখলে কারেক্ট/ইনকারেক্ট লিস্টে, নোটে বা সেভ লিস্টে ডাটা আসত না (sync হত না)**।

---

### কেন ডাটা সিঙ্ক হচ্ছিল না? মূল কারণসমূহ (Root Causes):

1. **টেস্ট সাবমিশনের সময় প্রশ্নভিত্তিক রেকর্ড সেভ না হওয়া (`TestApiController` & `SchedaEsameApiController` Issue):**
   - মোবাইল অ্যাপস যখন `/api/v1/test/submit` বা `/api/v1/scheda-esame/submit` এ টেস্টের উত্তর (`answers: [...]`) পাঠাত, ব্যাকএন্ড শুধুমাত্র একটি সামারি অবজেক্ট ক্রিয়েট করার চেষ্টা করত। কিন্তু ডাটাবেসের `user_mcq_results` টেবিলে প্রশ্নভিত্তিক (`question_id`, `is_correct`, `user_answer`, `correct_count`, `wrong_count`, `chapter_id`, `page_id`) রেকর্ড তৈরি বা আপডেট করা হচ্ছিল না।
   - ফলে ব্যবহারকারী টেস্ট শেষ করলেও কোনো প্রশ্ন ডাটাবেজে সঠিক বা ভুল হিসেবে কাউন্ট হত না।

2. **ইউজার আইডেন্টিটি ও সেশন রেজোলিউশন মিসম্যাচ (`ResolvesUserSession` Issue):**
   - মোবাইল অ্যাপ থেকে ব্যবহারকারী ফোন নম্বর (`+39 328 1234567` বা `017...`), Sanctum Token বা অ্যাপ সেশন দিয়ে কল করতেন। কিন্তু ওয়েবসাইটের সেশনের সাথে এই ফোন নম্বরের লিংক ক্যাশ (`Cache::get('qr_phone_' . $sessionId)`) থেকে রিড করা হচ্ছিল না।
   - ফলে ওয়েবসাইটের ব্রাউজার এবং মোবাইল অ্যাপের মধ্যে আইডেন্টিটি ডিসকানেক্টেড ছিল।

3. **API রাউটিং ও Sanctum মিডলওয়্যার রেস্ট্রিকশন:**
   - `/api/v1/test/submit` এবং `/api/v1/scheda-esame/submit` এন্ডপয়েন্টগুলো শুধুমাত্র স্ট্রিক্ট `auth:sanctum` মিডলওয়্যারের ভেতরে ছিল। কোনো অ্যাপ ক্লায়েন্ট বা ওয়েব ক্লায়েন্ট যদি Bearer টোকেন ছাড়া ফোন/সেশন হেডার দিয়ে সাবমিট করত, তাহলে `401 Unauthorized` ফেরত যেত।

4. **বুকমার্ক এবং নোট তৈরিতে Persistent Session Binding এর অভাব:**
   - ব্যবহারকারী ফোন নম্বর দিয়ে প্রথমবার কোনো প্রশ্ন বুকমার্ক বা নোট করলে `app_clients` রেকর্ডের সাথে পার্মানেন্টলি সেশন ম্যাপিং না থাকায় পরবর্তীতে অন্য ডিভাইস বা ওয়েব ব্রাউজার থেকে ওই ফোন নম্বরের ডাটা ফিল্টার করা সম্ভব হত না।

---

## 🛠️ ২. বাস্তবায়িত সমাধান (Implemented Solutions)

1. ✅ **`ResolvesUserSession` ট্রেইট আপগ্রেড:**
   - ফোন নম্বর (যেকোনো ফরম্যাট: `+39...`, `39...`, স্পেস বা ড্যাশ সহ, শেষ ১০ ডিজিট), Sanctum User, AppClient UUID, Laravel Session ID এবং **QR Code Cache (`qr_phone_<sessionId>`)** সবগুলোকে একত্রিত করে একটি ইউনিফাইড কনটেক্সট তৈরি করা হয়েছে।
   - এর ফলে মোবাইল অ্যাপস থেকে ফোন নম্বর বা টোকেন দিয়ে যাই সাবমিট করা হোক, ওয়েবসাইটে QR কোড স্ক্যান করে লগইন করা ব্রাউজার ইনস্ট্যান্টলি সেই একই ডাটা রিড করতে পারবে।

2. ✅ **`TestApiController::submitResult` এবং `SchedaEsameApiController::submitExam` রিফ্যাক্টরিং:**
   - এখন টেস্ট বা একজাম সাবমিট হলে প্রেরিত `answers` অ্যারের প্রতিটি প্রশ্নের জন্য `user_mcq_results` টেবিলে স্বয়ংক্রিয়ভাবে `correct_count`, `wrong_count`, `user_answer`, `is_correct`, `chapter_id`, `page_id` আপডেট বা তৈরি হয়।
   - এটি সম্পন্ন হওয়ার সাথে সাথে ওয়েবসাইটের **Correct MCQs (`/correct-mcqs`)**, **Wrong MCQs (`/wrong-mcqs`)**, এবং প্রতিটি অধ্যায়ের প্রগ্রেস বারে লাইভ ডাটা প্রতিফলিত হয়।

3. ✅ **বুকমার্ক (`SavedMcqsApiController`) ও নোট (`NotedMcqsApiController`) পার্সিস্টেন্স:**
   - বুকমার্ক বা নোট সেভ করার সাথে সাথে ব্যবহারকারীর ফোন ও সেশন লিংক হয়ে যায়।
   - ওয়েবসাইটের `app.js` এবং মডিউলসগুলোকে আপডেট করা হয়েছে যাতে তারা সবসময় `X-Client-Phone` এবং `X-Client-Session-ID` পাঠিয়ে ব্যাকএন্ড থেকে সর্বশেষ ডাটা রিড করে।

4. ✅ **API রাউটসমূহ উন্মুক্ত ও সমন্বিত করা হয়েছে:**
   - `/api/v1/test/submit`, `/api/v1/scheda-esame/submit`, `/api/v1/saved-mcqs/toggle`, `/api/v1/notes` ইত্যাদি সব এন্ডপয়েন্টকে সরাসরি অ্যাক্সেসযোগ্য এবং স্বয়ংক্রিয় ইউজার রেজোলিউশনের আওতায় আনা হয়েছে।

---

## 📡 ৩. কমপ্লিট RESTful API এন্ডপয়েন্ট রেফারেন্স (API Documentation)

### ৩.১ টেস্ট ও শিট এক্সাম সাবমিশন (Test & Scheda Esame)

#### ১. প্র্যাকটিস টেস্ট সাবমিট (Submit Practice Test)
- **URL:** `POST /api/v1/test/submit` (Alias: `POST /api/test/submit`)
- **Headers:**
  ```http
  Content-Type: application/json
  Accept: application/json
  X-Client-Phone: +393281234567 (অথবা Authorization: Bearer <token>)
  X-Client-Session-ID: <session_id>
  ```
- **Request Body (JSON):**
  ```json
  {
    "phone": "+393281234567",
    "total_questions": 30,
    "correct_count": 28,
    "wrong_count": 2,
    "answers": [
      {
        "question_id": 2,
        "question_type": "argomenti",
        "user_answer": "V",
        "is_correct": true
      },
      {
        "question_id": 5,
        "question_type": "cartelli",
        "user_answer": "F",
        "is_correct": false
      }
    ]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "success": true,
    "is_passed": true,
    "result_status": "PROMOSSO (PASSED)",
    "total_questions": 30,
    "correct_count": 28,
    "wrong_count": 2,
    "processed_answers": 2,
    "message": "Practice test result submitted and synchronized successfully"
  }
  ```

---

#### ২. শিদাহ একজাম সাবমিট (Submit Scheda Esame)
- **URL:** `POST /api/v1/scheda-esame/submit` (Alias: `POST /api/scheda-esame/submit`)
- **Headers:**
  ```http
  Content-Type: application/json
  Accept: application/json
  X-Client-Phone: +393281234567
  ```
- **Request Body (JSON):**
  ```json
  {
    "phone": "+393281234567",
    "total_questions": 30,
    "correct_count": 27,
    "wrong_count": 3,
    "answers": [
      {
        "question_id": 2,
        "question_type": "argomenti",
        "user_answer": "V",
        "is_correct": true
      }
    ]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "success": true,
    "is_passed": true,
    "result_status": "PROMOSSO (PASSED)",
    "total_questions": 30,
    "correct_count": 27,
    "wrong_count": 3,
    "processed_answers": 1,
    "message": "Complimenti! Hai superato la Scheda Esame."
  }
  ```

---

### ৩.২ সঠিক ও ভুল প্রশ্নের তালিকা (Correct & Wrong MCQs)

#### ১. সঠিক উত্তর দেওয়া প্রশ্নসমূহ (Get Correct MCQs)
- **URL:** `GET /api/v1/correct-mcqs` (Alias: `GET /api/correct-mcqs`)
- **Query Params:** `?phone=+393281234567&chapter_id=&page_id=&search=`
- **Headers:** `X-Client-Phone: +393281234567`
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "total_correct": 1,
    "data": [
      {
        "id": 2,
        "chapter": 2,
        "chapter_name": "Italian Driving Licence Quiz 2026",
        "italian": "Italian Driving Licence Quiz 2026 with official",
        "bangla": "ইতালিয়ান ড্রাইভিং লাইসেন্স কুইজ ২০২৬",
        "is_vero": true,
        "image": "",
        "audio": "",
        "video": "",
        "correct_count": 3,
        "wrong_count": 0,
        "has_answered": true
      }
    ]
  }
  ```

---

#### ২. ভুল উত্তর দেওয়া প্রশ্নসমূহ (Get Wrong MCQs)
- **URL:** `GET /api/v1/wrong-mcqs` (Alias: `GET /api/wrong-mcqs`)
- **Query Params:** `?phone=+393281234567&chapter_id=&page_id=&search=`
- **Headers:** `X-Client-Phone: +393281234567`
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "total_wrong": 1,
    "data": [ ... ]
  }
  ```

---

### ৩.৩ প্রশ্ন সেভ / বুকমার্ক (Saved MCQs / Bookmarks)

#### ১. বুকমার্ক টগল (Save / Unsave Question)
- **URL:** `POST /api/v1/saved-mcqs/toggle` (Alias: `POST /api/saved-mcqs/toggle`, `POST /api/v1/bookmarks/toggle`)
- **Request Body (JSON):**
  ```json
  {
    "phone": "+393281234567",
    "question_id": 2,
    "type": "argomenti"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "saved": true,
    "message": "Question added to bookmarks",
    "data": {
      "id": 8,
      "question_id": 2,
      "type": "argomenti"
    }
  }
  ```

#### ২. সেভ করা প্রশ্নের তালিকা (Get Saved MCQs List)
- **URL:** `GET /api/v1/saved-mcqs` (Alias: `GET /api/saved-mcqs`)
- **Query Params:** `?phone=+393281234567`
- **Headers:** `X-Client-Phone: +393281234567`
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 8,
        "question_id": 2,
        "type": "argomenti",
        "question": {
          "id": 2,
          "italian": "...",
          "bangla": "...",
          "is_vero": true
        }
      }
    ]
  }
  ```

---

### ৩.৪ প্রশ্ন নোট (Noted MCQs / Notes)

#### ১. নোট তৈরি বা আপডেট (Save / Update Note)
- **URL:** `POST /api/v1/notes` (Alias: `POST /api/v1/noted-mcqs/save`, `POST /api/notes`)
- **Request Body (JSON):**
  ```json
  {
    "phone": "+393281234567",
    "question_id": 2,
    "type": "argomenti",
    "note_text": "এই প্রশ্নের নিয়মটি মনে রাখতে হবে।"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "নোট সফলভাবে সংরক্ষণ করা হয়েছে",
    "data": {
      "id": 6,
      "question_id": 2,
      "type": "argomenti",
      "note_text": "এই প্রশ্নের নিয়মটি মনে রাখতে হবে।"
    }
  }
  ```

#### ২. নোটের তালিকা (Get Notes List)
- **URL:** `GET /api/v1/notes` (Alias: `GET /api/v1/noted-mcqs`, `GET /api/notes`)
- **Query Params:** `?phone=+393281234567`
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "total": 1,
    "data": [
      {
        "id": 6,
        "question_id": 2,
        "note_text": "এই প্রশ্নের নিয়মটি মনে রাখতে হবে。",
        "question": { ... }
      }
    ]
  }
  ```

---

### ৩.৫ একক বা ব্যাচ MCQ লগিং (Direct MCQ Result Logger)

- **URL:** `POST /api/v1/user-mcq-results/log` (Alias: `POST /api/user-mcq-results/log`)
- **Request Body (JSON):**
  ```json
  {
    "phone": "+393281234567",
    "results": [
      {
        "question_id": 2,
        "question_type": "argomenti",
        "user_answer": "V",
        "is_correct": true
      }
    ]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "success": true,
    "count": 1,
    "logged": [ ... ]
  }
  ```

---

## 📱 ৪. মোবাইল অ্যাপ (Flutter / Mobile Developer) ইন্টিগ্রেশন গাইড

মোবাইল অ্যাপ থেকে কল করার সময় নিশ্চিত করুন:
1. **HTTP Headers এ ব্যবহারকারীর ফোন নম্বর ও সেশন পাঠানো:**
   ```dart
   final headers = {
     'Content-Type': 'application/json',
     'Accept': 'application/json',
     'X-Client-Phone': userPhoneNumber, // e.g. '+393281234567'
     'X-Client-Session-ID': userSessionId,
     if (userAuthToken != null) 'Authorization': 'Bearer $userAuthToken',
   };
   ```
2. **টেস্ট শেষ হলে সাবমিট করা:**
   - ব্যবহারকারী টেস্ট বা শিট এক্সাম শেষ করার সাথে সাথে `/api/v1/test/submit` অথবা `/api/v1/scheda-esame/submit` এ প্রতিটি উত্তরের স্টেট সহ `POST` রিকোয়েস্ট পাঠান।
3. **বুকমার্ক / নোট করার সময়:**
   - `/api/v1/saved-mcqs/toggle` এবং `/api/v1/notes` এন্ডপয়েন্টে `phone` প্যারামিটার সহ কল করুন।
4. **রেজাল্ট:**
   - মোবাইল অ্যাপে করা প্রতিটি টেস্ট, বুকমার্ক এবং নোট সাথে সাথে সেন্ট্রাল ডাটাবেজে রেকর্ড হবে এবং ওয়েবসাইটের সংশ্লিষ্ট স্ক্রিনগুলোতে (Correct MCQs, Wrong MCQs, Saved MCQs, Noted MCQs, Chapter Statistics) তাৎক্ষণিকভাবে দৃশ্যমান হবে।

---

## ✅ ৫. টেস্টিং ভ্যালিডেশন রিপোর্ট (Automated Test Run)

```bash
PHP Syntax Check:
- app/Traits/ResolvesUserSession.php: OK
- app/Http/Controllers/Api/TestApiController.php: OK
- app/Http/Controllers/Api/SchedaEsameApiController.php: OK
- routes/api.php: OK

API Synchronization Integration Test:
1. Test Submit Result: {"status":"success","success":true,"is_passed":true,"total_questions":1,"correct_count":1,"wrong_count":0,"processed_answers":1}
2. Correct MCQs Found: 1 -> MATCHED
3. Bookmark Toggle: {"status":"success","saved":true} -> MATCHED
4. Saved MCQs Found: 1 -> MATCHED
5. Note Save: {"status":"success"} -> MATCHED
6. Notes Found: 1 -> MATCHED

ALL CROSS-PLATFORM SYNCHRONIZATION TESTS PASSED!
```
