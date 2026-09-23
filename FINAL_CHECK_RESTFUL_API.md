# 🚀 Italy Driving License Platform - Final Checked RESTful API Documentation
> **File Name**: `FINAL_CHECK_RESTFUL_API.md`  
> **Last Verified & Synced**: September 2026  
> **Target Audience**: Flutter Mobile App Developers & Web Frontend Team

---

## 🌐 Base URL
- **Production Base URL**: `https://mbanglapatenteb.com/api/v1`
- **Root-level Alias Base URL**: `https://mbanglapatenteb.com/api`
- **Interactive API Documentation**: `https://mbanglapatenteb.com/documentation.php`

---

## 🚨 CRITICAL RULES FOR FLUTTER DEVELOPERS

### 1. 🖼️ MCQ Card Layout & Image Area Rule (কখনই আন্ডারলাইনের ছবি কার্ডে আসবে না এবং ইমেজ না থাকলে ফাঁকা থাকবে):
1. **Official Question Image Only (`question.image` / `question.img`)**:
   - MCQ কার্ডে কেবল এবং কেবলমাত্র অফিসিয়াল প্রশ্নের ছবি (`question.image`) প্রদর্শিত হবে।
   - কোনো প্রশ্নে যদি অফিশিয়াল ইমেজ না থাকে (`question.image == null` বা খালি), তাহলে ইমেজের জায়গাটি ফাঁকা থাকবে—টেক্সট পুরো জায়গা দখল করবে না বা লেআউট এলোমেলো হবে না।
2. **🚫 Underline Vocabulary Image (`vocabulary[i].image`)**:
   - আন্ডারলাইন করা ভোকাবুলারি শব্দের ছবি (`vocabulary.image`) শুধুমাত্র তখনই প্রদর্শিত হবে যখন ব্যবহারকারী আন্ডারলাইন করা শব্দটিতে ট্যাপ করে ডিকশনারি/অনুবাদ মডাল বা বটম-শীট ওপেন করবে।
   - **ভোকাবুলারির ছবি কখনোই MCQ কার্ডের ছবি হিসেবে ব্যবহৃত হবে না!**
3. **Card Layout Structure**:
   - কার্ডের উপরের বামে প্রশ্নের সিরিয়াল নাম্বার এবং ডানে বড় অক্ষরের **V** (সবুজ) বা **F** (লাল) স্ট্যাটাস ব্যাজ থাকবে।
   - টেক্সটের মাঝের আন্ডারলাইন করা শব্দগুলোতে সাধারণ টেক্সটের মতো স্বাভাবিক রঙ থাকবে এবং নিচে ১ পিক্সেলের সফট আন্ডারলাইন থাকবে।

### 2. 📊 `(TU) Hai risposto:` Stats Card Rule (উত্তরের পরিসংখ্যান কেবল উত্তর দেওয়ার পরেই দেখাবে):
- যদি ব্যবহারকারী পূর্বে কোনো প্রশ্নের উত্তর দিয়ে থাকে (`correct_count > 0 || wrong_count > 0` অথবা `isAnswered == true`), শুধুমাত্র তখনই কার্ডের নিচে স্ট্যাটাস বক্স প্রদর্শিত হবে:
  ```
  (TU) Hai risposto:
  Giusto X volte    Sbagliato Y volte
  ```
- যদি ব্যবহারকারী এখনও কোনো উত্তর না দিয়ে থাকে, তাহলে এই স্ট্যাটাস বক্সটি সম্পূর্ণ অদৃশ্য/হাইড থাকবে (`const SizedBox.shrink()`)।

### 3. ⏱️ Official Exam 30 Questions Limit (টেস্টে সর্বদা সর্বোচ্চ ৩০টি প্রশ্ন থাকবে):
- ডাটাবেজে ১,০০০ বা ১০,০০০ প্রশ্ন থাকলেও, টেস্ট/এক্সাম মোডে (`GET /api/v1/scheda-esame/generate`) সার্ভার **সর্বোচ্চ ৩০টি প্রশ্ন** রিটার্ন করবে।
- ৩০টি প্রশ্নের উত্তর সাবমিট করার পর স্বয়ংক্রিয়ভাবে ব্যবহারকারীকে **Result Screen** (Promosso / Bocciato)-এ নিয়ে যাবে।

---

### 💻 Flutter Code Implementation for MCQ Card:
```dart
Widget buildMcqCard({
  required BuildContext context,
  required int index,
  required dynamic question,
  required int correctCount,
  required int wrongCount,
}) {
  final hasOfficialImage = question.image != null && question.image.toString().trim().isNotEmpty;
  final isAnswered = correctCount > 0 || wrongCount > 0;
  final isVero = question.is_vero == 1 || question.is_vero == true || question.is_vero == '1';

  return Container(
    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      boxShadow: [
        BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4)),
      ],
      border: Border.all(color: const Color(0xFFE2E8F0)),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Top Row: Question Number, Official Image (if any) or Empty Space, and V/F Badge
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Question Index
            Text('${index + 1}', style: const TextStyle(fontSize: 14, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
            const SizedBox(width: 12),
            
            // Question Text Area
            Expanded(
              child: buildHighlightedItalianText(context, question.italian ?? '', question.vocabulary ?? []),
            ),
            const SizedBox(width: 10),

            // Big V / F Badge on Right
            Text(
              isVero ? 'V' : 'F',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w900,
                color: isVero ? const Color(0xFF16A34A) : const Color(0xFFEF4444),
              ),
            ),
          ],
        ),

        // Action Toolbar: Audio, Bookmark, Note, Translate, Info
        const SizedBox(height: 12),
        buildActionToolbar(context, question),

        // Audio Player Slider (if audio exists)
        if (question.audio != null && question.audio.toString().trim().isNotEmpty) ...[
          const SizedBox(height: 10),
          buildAudioSlider(question.audio),
        ],

        // 📊 (TU) Hai risposto: Box (Only shown if answered!)
        if (isAnswered) ...[
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 14),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                const Text('(TU) Hai risposto:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569))),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Giusto $correctCount volte', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF16A34A))),
                    const SizedBox(width: 16),
                    Text('Sbagliato $wrongCount volte', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFFEF4444))),
                  ],
                ),
              ],
            ),
          ),
        ],
      ],
    ),
  );
}
```

---

## 🔒 Cross-Platform Synchronization & User Identity Architecture
All user activities (**Saved MCQs**, **Noted MCQs**, **Wrong MCQs**, **Correct MCQs**, **Test Results**, **Chat Messages**) are **100% synchronized in real-time** between the **Flutter Mobile App** and the **Web PWA**.

### 📱 Unified User Identification Header & Context Priority:
1. **Bearer Token** (`Authorization: Bearer <token>` via Laravel Sanctum)
2. **Phone Number Headers & Parameters**:
   - HTTP Header: `X-Client-Phone: 01706640864`
   - Query / Body Parameter: `?phone=01706640864`
3. **Session ID Headers & Parameters**:
   - HTTP Header: `X-Session-ID: <session_id>`
   - Query / Body Parameter: `?session_id=<session_id>`

---

## 🎴 1. Home Navigation Cards API
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
      "image_url": "https://mbanglapatenteb.com/uploads/cards/card_img_1790047087_306.webp",
      "lottie_url": "https://mbanglapatenteb.com/uploads/cards/lottie/lottie_lezioni.json",
      "order_index": 1,
      "status": true
    },
    {
      "id": 9,
      "title": "Saved MCQs",
      "subtitle": "সেভ করা এমসিকিউ",
      "screen_key": "saved-mcqs",
      "media_type": "image",
      "icon_class": "fa-solid fa-bookmark",
      "icon_color": "#EF4444",
      "color": "#EF4444",
      "image_url": "https://mbanglapatenteb.com/uploads/cards/saved_mcqs.svg",
      "order_index": 9,
      "status": true
    },
    {
      "id": 10,
      "title": "Noted MCQs",
      "subtitle": "নোট করা এমসিকিউ",
      "screen_key": "noted-mcqs",
      "media_type": "image",
      "icon_class": "fa-regular fa-note-sticky",
      "icon_color": "#10B981",
      "color": "#10B981",
      "image_url": "https://mbanglapatenteb.com/uploads/cards/card_img_1790055889_674.webp",
      "order_index": 10,
      "status": true
    }
  ]
}
```

> **⚠️ Flutter Home Navigation Mapping**:
> - `screen_key == "saved-mcqs"` -> Navigate to `SavedQuestionsScreen` (Title: **Saved MCQs**)
> - `screen_key == "noted-mcqs"` -> Navigate to `NotedQuestionsScreen` (Title: **Noted MCQs**)
> - `screen_key == "correct-mcqs"` -> Navigate to `CorrectQuestionsScreen` (Title: **Correct MCQs**)
> - `screen_key == "wrong-mcqs"` -> Navigate to `WrongQuestionsScreen` (Title: **Wrong MCQs**)

---

## 📝 2. Noted MCQs API (নোট করা প্রশ্ন)
- **Get All Noted MCQs**: `GET /api/v1/noted-mcqs` (or `GET /api/v1/notes`)
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
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
      "note_text": "মনে রাখতে হবে এই প্রশ্নের উত্তর সর্বদা Vero",
      "created_at": "2026-09-22T10:00:00.000000Z",
      "updated_at": "2026-09-22T10:00:00.000000Z",
      "question": {
        "id": 1,
        "chapter_id": 1,
        "chapter_name": "Definizioni Generali",
        "italian": "Italian Driving Licence Quiz 2026 with <u>official</u>",
        "bangla": "Italian Driving Licence Quiz 2026 with official",
        "is_vero": true,
        "image": null,
        "audio": "",
        "video": "",
        "vocabulary": [
          {
            "italian": "official",
            "bangla": "অফিশিয়াল",
            "image": "https://mbanglapatenteb.com/uploads/vocabulary/vocab_1790044472_476.png"
          }
        ],
        "type": "argomenti",
        "note_id": 1,
        "note_text": "মনে রাখতে হবে এই প্রশ্নের উত্তর সর্বদা Vero"
      }
    }
  ]
}
```

### 💾 Save or Edit Note:
- **Endpoint**: `POST /api/v1/noted-mcqs/save` (or `POST /api/v1/notes`)
- **Body Payload**:
```json
{
  "question_id": 1,
  "type": "argomenti",
  "note_text": "মনে রাখতে হবে এই প্রশ্নের উত্তর সর্বদা Vero",
  "phone": "01706640864",
  "session_id": "c89b7b83-d9d1-4c75"
}
```

### 🗑️ Delete Note:
- **Endpoint**: `DELETE /api/v1/notes/{id}` (or `POST /api/v1/noted-mcqs/delete`)

---

## 🔖 3. Saved / Bookmarked MCQs (সেভ / বুকমার্ক করা প্রশ্ন)
- **Get Saved MCQs**: `GET /api/v1/saved-mcqs`
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Toggle Save/Unsave**: `POST /api/v1/saved-mcqs/toggle`
  - **Body Payload**:
```json
{
  "question_id": 105,
  "type": "argomenti",
  "phone": "01706640864",
  "session_id": "c89b7b83-d9d1-4c75"
}
```

---

## ✔ 4. Correct MCQs (সঠিক উত্তরের প্রশ্ন)
- **Endpoint**: `GET /api/v1/correct-mcqs`
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Query Filters**: `?phone=01706640864&chapter_id=1&page_id=2&search=autostrada`

---

## ❌ 5. Wrong MCQs (ভুল উত্তরের প্রশ্ন)
- **Endpoint**: `GET /api/v1/wrong-mcqs`
- **Headers**: `X-Client-Phone: <phone>`, `X-Session-ID: <session_id>`
- **Query Filters**: `?phone=01706640864&chapter_id=1&page_id=2&search=strada`

---

## 📊 6. Submit MCQ Results (লগ টেস্ট ও প্র্যাকটিস ফলাফল)
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

## 🎓 7. Exam Simulation & Practice Quizzes
- **Scheda Esame (Official 30 MCQs)**: `GET /api/v1/scheda-esame/generate` (or `GET /api/v1/quiz/exam`)
- **Submit Exam**: `POST /api/v1/scheda-esame/submit`

---

## 🎨 9. System Settings & Unified Design / Font Tokens API
- **Endpoint**: `GET /api/v1/settings` (or `GET /api/settings`)
- **Method**: `GET`
- **Purpose**: Both the **Flutter Mobile App** and the **Web PWA** MUST load and apply the exact same Typography, Theme Colors, and Exam Timers dynamically from this endpoint.

### 📄 Response Format:
```json
{
  "status": "success",
  "app_name": "mbanglapatenteb",
  "font_family": "Outfit",
  "font_weight": "normal",
  "text_color": "#1e293b",
  "primary_color": "#F4F7FA",
  "accent_color": "#4CAF50",
  "exam_time_minutes": 20,
  "qr_target_mode": "local",
  "active_base_url": "http://10.0.2.2:8000"
}
```

### 🎯 Typography & Aesthetics Rules for Flutter & Web:
1. **Font Family**: Use Google Font `Outfit` (fallback to system sans-serif).
2. **Primary Text Color**: Use modern Slate Charcoal `#1e293b` in light mode (NEVER use harsh pure jet black `#000000` or `#111111`).
3. **Secondary Text Color**: `#64748b` (muted slate gray).
4. **Underline Dictionary Terms (`<u>word</u>`)**:
   - Text color must **INHERIT** the question color (`#1e293b` in light mode, `#f8fafc` in dark mode).
   - Underline color: subtle accent green tint `rgba(76, 175, 80, 0.45)` with `1.5px` thickness and `3px` offset.
   - On tap/hover: color shifts to `var(--accent-green)` (`#4CAF50`) and opens the Vocabulary Sheet.

---

## 🏁 10. Official Exam (30 MCQs) & Result Evaluation Flow
1. **Fetch 30 MCQs**: Call `GET /api/v1/scheda-esame/generate` (or `GET /api/v1/quiz/exam`).
2. **Timer**: 20 minutes countdown (`exam_time_minutes` from settings).
3. **User Submits Exam**:
   - Send answers to `POST /api/v1/scheda-esame/submit` (or `POST /api/v1/test/submit`).
   - Server automatically marks each question as Correct or Wrong and logs each question into `user_mcq_results` with user's phone/session.
4. **Result Calculation**:
   - **0 to 3 Errors**: `IDONEO` (Passed / Promosso 🏆).
   - **4 or more Errors**: `BOCCIATO` (Failed / Non idoneo ⚠️).
5. **Immediate Sync**:
   - The answered questions will immediately show up in **Correct MCQs** (`GET /api/v1/correct-mcqs`) and **Wrong MCQs** (`GET /api/v1/wrong-mcqs`) on both the App and the Web!

---

## 💬 11. Support & License Verification Workflow
- **Registration**: `POST /api/v1/support/register` (Body: `{"first_name": "Md", "last_name": "Rahim", "phone": "01706640864"}`)
- **License Status**: `GET /api/v1/license/status`
- **Chat Messages**: `GET /api/v1/chat/messages?phone=01706640864`
- **Send Message**: `POST /api/v1/chat/messages` (Body: `{"phone": "01706640864", "message": "আমার লাইসেন্স একটিভ করুন"}`)

