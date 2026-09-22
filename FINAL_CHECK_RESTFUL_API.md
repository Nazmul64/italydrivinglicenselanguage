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

## 🚨 CRITICAL RULE FOR FLUTTER DEVELOPERS: NO DICTIONARY/UNDERLINE IMAGES ON MCQ CARDS!

### ❌ What Was Going Wrong in the App:
When an MCQ has no official image (`question.image == null` or `""`), but has an underlined vocabulary word (`<u>official</u>` with `vocabulary: [{"image": "https://.../vocab_xxx.png"}]`), the Flutter app was incorrectly extracting the vocabulary image and showing it as the **Main Question Image** across:
1. **Noted MCQs Screen** (`noted_questions_screen.dart` / `noted_mcqs_screen.dart`)
2. **Wrong MCQs Screen** (`wrong_questions_screen.dart`)
3. **Correct MCQs Screen** (`correct_questions_screen.dart`)
4. **Test Live Quiz Screen** (`test_screen.dart` / `quiz_practice_screen.dart`)
5. **Test Results Screen** (`test_results_screen.dart` / `bocciato_screen.dart` / `promosso_screen.dart`)

### ✅ The Correct Rule:
1. **`question.image` (Official Question Image)**:
   - Only display an image on the MCQ card if `question.image != null && question.image.trim().isNotEmpty`.
   - If `question.image` is empty/null, render `const SizedBox.shrink()` (0 height, completely hidden, no empty space).
2. **`question.vocabulary[i].image` (Underline Dictionary Image)**:
   - This image belongs **EXCLUSIVELY** to the Vocabulary Dictionary Modal / BottomSheet that opens **ONLY when the user taps on the underlined word**.
   - **NEVER** assign or display `vocabulary.image` or `page.image` on the question card!

### 💻 Flutter Code Implementation:
```dart
// Helper method to get the valid question image
String? getValidQuestionImage(dynamic question) {
  final rawImg = question.image ?? question.img;
  if (rawImg == null) return null;
  final imgStr = rawImg.toString().trim();
  if (imgStr.isEmpty || imgStr.contains('/data/user/') || imgStr.contains('scaled_IMG')) {
    return null;
  }
  return imgStr;
}

// Widget for rendering MCQ Question Image across ALL 5 screens:
Widget buildQuestionImageWidget(dynamic question) {
  final imageUrl = getValidQuestionImage(question);
  
  // 🚫 If no question image, DO NOT show vocabulary image or dummy image!
  if (imageUrl == null) {
    return const SizedBox.shrink(); // Completely hidden
  }

  return Padding(
    padding: const EdgeInsets.only(bottom: 12.0),
    child: ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.network(
        imageUrl,
        height: 140,
        width: double.infinity,
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
      ),
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

## 💬 8. Support & License Verification Workflow
- **Registration**: `POST /api/v1/support/register` (Body: `{"first_name": "Md", "last_name": "Rahim", "phone": "01706640864"}`)
- **License Status**: `GET /api/v1/license/status`
- **Chat Messages**: `GET /api/v1/chat/messages?phone=01706640864`
- **Send Message**: `POST /api/v1/chat/messages` (Body: `{"phone": "01706640864", "message": "আমার লাইসেন্স একটিভ করুন"}`)
