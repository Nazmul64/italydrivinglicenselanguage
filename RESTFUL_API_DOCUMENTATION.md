# 🚗 MBanglaPatenteB - Official Master RESTful API & Mobile Integration Documentation

> **Base URL (Local/Dev):** `http://127.0.0.1:8000/api/v1`  
> **Base URL (Production):** `https://mbanglapatenteb.com/api/v1`  
> **Headers Required:**  
> - `Accept: application/json`  
> - `Content-Type: application/json`  
> - `X-Client-Phone: <User_Phone_Number>` *(Crucial for 2-Way Sync)*  
> - `Authorization: Bearer <Sanctum_Token>` *(Optional / If logged in)*

---

## 📋 Table of Contents
1. [Core Architectural Rules & Problem Solutions (Must-Read for Flutter Developers)](#1-core-architectural-rules--problem-solutions)
   - [Rule 1: Question Card Image vs Underline Vocabulary Image Isolation](#rule-1-question-card-image-vs-underline-vocabulary-image-isolation)
   - [Rule 2: Left Image Box Rule - NO Empty Placeholder Box](#rule-2-left-image-box-rule---no-empty-placeholder-box)
   - [Rule 3: 2-Way Real-time Synchronization (Web & Mobile App)](#rule-3-2-way-real-time-synchronization-web--mobile-app)
   - [Rule 4: QR Code Scan & Active License Security Verification](#rule-4-qr-code-scan--active-license-security-verification)
   - [Rule 5: Official Scheda Esame / Practice Quiz 30-Question Limit & Result Redirection](#rule-5-official-scheda-esame--practice-quiz-30-question-limit--result-redirection)
2. [Authentication, Registration & License Management](#2-authentication-registration--license-management)
3. [QR Code Website Unlock & Verification](#3-qr-code-website-unlock--verification)
4. [Chapters, Topics & Pagina Content APIs](#4-chapters-topics--pagina-content-apis)
5. [MCQs & Cartelli (Road Signs) APIs](#5-mcqs--cartelli-road-signs-apis)
6. [Practice Quiz & Official Scheda Esame APIs](#6-practice-quiz--official-scheda-esame-apis)
7. [Saved MCQs (2-Way Sync) APIs](#7-saved-mcqs-2-way-sync-apis)
8. [Noted MCQs (2-Way Sync) APIs](#8-noted-mcqs-2-way-sync-apis)
9. [Wrong MCQs (Sbagliate) & Correct MCQs (Giuste) APIs](#9-wrong-mcqs-sbagliate--correct-mcqs-giuste-apis)
10. [Flutter Dart Implementation Examples](#10-flutter-dart-implementation-examples)

---

## 1. Core Architectural Rules & Problem Solutions

### Rule 1: Question Card Image vs Underline Vocabulary Image Isolation
> [!CRITICAL]
> **UNDER NO CIRCUMSTANCES should a vocabulary image (`question.vocabulary[i].image`) ever be rendered on the main Question Card.**
- `question.image` (or `img`) is the **ONLY** image that belongs to the question card / road sign.
- `question.vocabulary` is an array of dictionary definitions for underlined words. Its `image` must **ONLY** appear inside the **Vocabulary Popup / BottomSheet modal** when the user taps on the specific underlined word.

---

### Rule 2: Left Image Box Rule - NO Empty Placeholder Box
> [!IMPORTANT]
> **If `question.image` is null or empty, DO NOT render an empty container / SizedBox / whitespace.**
- When `question.image == null`: The Italian text must start from the very left edge naturally.
- When `question.image != null`: Render a fixed thumbnail (e.g. 90-100px) on the left or top based on `image_position`.

```dart
// Flutter Implementation Pattern:
Widget buildMcqCard(McqQuestion q) {
  final hasImage = q.image != null && q.image!.trim().isNotEmpty;

  return Card(
    child: Padding(
      padding: const EdgeInsets.all(12.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // CONDITIONAL IMAGE: Render ONLY if hasImage is TRUE
              if (hasImage) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    q.image!,
                    width: 90,
                    height: 90,
                    fit: BoxFit.contain,
                  ),
                ),
                const SizedBox(width: 12),
              ],
              
              // TEXT EXPANDS NATURALLY
              Expanded(
                child: Text(
                  q.italian,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          // Action Buttons (TTS, Bangla, Save, Note)...
        ],
      ),
    ),
  );
}
```

---

### Rule 3: 2-Way Real-time Synchronization (Web & Mobile App)
All user progress data (Saved Questions, Notes, Wrong MCQs, Correct MCQs, Quiz History) is unified on the backend database via the user's **Phone Number** (`phone` parameter and `X-Client-Phone` header).
- **Rule**: Whenever the Flutter App makes any API call (e.g., getting saved items, saving a question, submitting an answer), it must always supply the active user's phone in both the query/body and the `X-Client-Phone` header.
- This guarantees that actions performed in the Web PWA immediately reflect in the Flutter Mobile App and vice versa.

---

### Rule 4: QR Code Scan & Active License Security Verification
- **Flow**:
  1. User enters First Name, Last Name, and Phone Number to register in the App or Web.
  2. Admin assigns and activates a **License Key** for that customer (`is_active = 1`).
  3. When the user opens the Web PWA, the website displays a dynamic Login QR Code.
  4. The user scans the QR code using the Flutter mobile app's built-in QR Scanner.
  5. The mobile app sends a POST request to `/api/v1/qr-verification/verify` containing the scanned QR data + the mobile user's `phone` / `license_key`.
  6. **Security Rule**: The backend verifies if the user's license is active.
     - **If Active (`is_active == 1`)**: Backend returns `200 OK`, unlocks the Web browser session in real-time via Cache/Session.
     - **If Inactive / No License**: Backend returns `403 Forbidden` (`{"status": "error", "message": "License inactive"}`). The website **MUST NOT** unlock.

---

### Rule 5: Official Scheda Esame / Practice Quiz 30-Question Limit & Result Redirection
- An official Italian Driving License Scheda Esame consists of **exactly 30 questions**.
- Practice quizzes and Exam Simulations must load 30 questions.
- When the user answers question 30 and presses "Avanti" or "Concludi Esame", the app must calculate the final score (Pass: `<= 3 errors`, Fail: `>= 4 errors`), submit results to `/api/v1/user-mcq-results`, and navigate to the Exam Result Summary Screen.

---

## 2. Authentication, Registration & License Management

### 2.1 Customer Registration & License Activation
- **Endpoint:** `POST /api/v1/app-clients/register`
- **Description:** Registers a student / app client or submits an activation request.
- **Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+393510000000",
  "device_id": "unique-device-uuid-1234",
  "activation_key": "MB-2026-XXXX-YYYY" // Optional: if student already has a key
}
```
- **Response (`200 OK` / `201 Created`):**
```json
{
  "success": true,
  "status": "success",
  "message": "Activation successful / Registration submitted",
  "data": {
    "session_id": "client_session_abc123",
    "phone": "+393510000000",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": 1,
    "expires_at": "2027-09-23 20:00:00"
  }
}
```

### 2.2 Check Client License Status
- **Endpoint:** `GET /api/v1/app-clients/status`
- **Query Params:** `phone=+393510000000` or `session_id=client_session_abc123`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "is_active": true,
  "status": "active",
  "client": {
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+393510000000",
    "is_active": 1,
    "expires_at": "2027-09-23 20:00:00"
  }
}
```

---

## 3. QR Code Website Unlock & Verification

### 3.1 Mobile QR Scan Verification
- **Endpoint:** `POST /api/v1/qr-verification/verify`
- **Description:** Called by the Flutter mobile app after scanning the QR code displayed on the website.
- **Request Body:**
```json
{
  "qr_data": "https://mbanglapatenteb.com/?session_id=web_session_xyz789", // or raw session string
  "phone": "+393510000000",
  "first_name": "John",
  "last_name": "Doe"
}
```
- **Response If Active (`200 OK`):**
```json
{
  "success": true,
  "status": "success",
  "license_status": "active",
  "message": "Website Full Access Granted! আপনার লাইসেন্স সফলভাবে যাচাই করা হয়েছে।",
  "session_id": "web_session_xyz789",
  "user": {
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+393510000000"
  }
}
```
- **Response If Inactive (`403 Forbidden`):**
```json
{
  "success": false,
  "status": "error",
  "license_status": "inactive",
  "message": "License inactive. Please contact support to activate your account."
}
```

### 3.2 Web Polling Endpoint (Checks if QR was scanned)
- **Endpoint:** `GET /api/v1/qr-verification/check-status?session_id=web_session_xyz789`
- **Response:** `{"unlocked": true, "user": {...}}` or `{"unlocked": false}`

---

## 4. Chapters, Topics & Pagina Content APIs

### 4.1 Get All Chapters
- **Endpoint:** `GET /api/v1/chapters`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "chapter_number": 1,
      "name_italian": "Capitolo 1) DEFINIZIONI STRADALI E DEI VEICOLI",
      "name_bangla": "অধ্যায় ১) রাস্তা এবং যানবাহনের সংজ্ঞা",
      "topics_count": 12
    }
  ]
}
```

### 4.2 Get Chapter Details with Pages & MCQs
- **Endpoint:** `GET /api/v1/chapters/{id}`
- **Query Params:** `with_mcqs=true`

---

## 5. MCQs & Cartelli (Road Signs) APIs

### 5.1 Get MCQ Questions by Page / Topic
- **Endpoint:** `GET /api/v1/mcqs`
- **Query Params:**
  - `page_id`: ID of the page/pagina
  - `chapter_id`: ID of chapter (optional)
  - `limit`: number of questions (default 30)
- **Response Schema:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1052,
      "chapter_id": 1,
      "page_id": 4,
      "italian": "La strada può essere suddivisa in carreggiate",
      "bangla": "রাস্তা একাধিক ক্যারেজওয়েতে বিভক্ত হতে পারে",
      "is_vero": 1,
      "image": "https://mbanglapatenteb.com/uploads/mcqs/images/img_1052.webp", // CAN BE NULL!
      "image_position": "left",
      "audio": "https://mbanglapatenteb.com/uploads/mcqs/audio/audio_1052.mp3",
      "explanation_it": "...",
      "explanation_bn": "...",
      "vocabulary": [
        {
          "word": "suddivisa",
          "bangla": "বিভক্ত",
          "image": "https://mbanglapatenteb.com/uploads/vocab/suddivisa.webp" // ONLY FOR VOCABULARY POPUP!
        },
        {
          "word": "carreggiate",
          "bangla": "যানবাহন চলার রাস্তা / ক্যারেজওয়ে",
          "image": null
        }
      ]
    }
  ]
}
```

### 5.2 Cartelli (Road Signs) Master List
- **Endpoint:** `GET /api/v1/cartelli`
- **Response:** Returns list of road sign categories, figures, and associated quiz questions.

---

## 6. Practice Quiz & Official Scheda Esame APIs

### 6.1 Generate Official Scheda Esame (30 Questions)
- **Endpoint:** `GET /api/v1/exam/generate-scheda`
- **Description:** Generates a randomized official standard exam simulation of exactly **30 questions** distributed across all official ministerial chapters.
- **Response (`200 OK`):**
```json
{
  "success": true,
  "total_questions": 30,
  "duration_minutes": 20,
  "max_allowed_errors": 3,
  "data": [
    /* Exact array of 30 question objects */
  ]
}
```

### 6.2 Submit Exam / Quiz Results
- **Endpoint:** `POST /api/v1/user-mcq-results`
- **Request Body:**
```json
{
  "phone": "+393510000000",
  "quiz_type": "scheda_esame", // or "topic_quiz", "error_review"
  "total_questions": 30,
  "correct_count": 28,
  "wrong_count": 2,
  "blank_count": 0,
  "is_passed": true,
  "answers": [
    { "mcq_id": 1052, "selected_answer": "vero", "is_correct": true },
    { "mcq_id": 1053, "selected_answer": "falso", "is_correct": false }
  ]
}
```

---

## 7. Saved MCQs (2-Way Sync) APIs

### 7.1 Get User's Saved MCQs
- **Endpoint:** `GET /api/v1/saved-mcqs`
- **Query Params:** `phone=+393510000000`
- **Headers:** `X-Client-Phone: +393510000000`
- **Response:** Array of questions saved with their full details.

### 7.2 Save / Bookmark an MCQ
- **Endpoint:** `POST /api/v1/saved-mcqs`
- **Request Body:**
```json
{
  "phone": "+393510000000",
  "mcq_id": 1052
}
```

### 7.3 Remove MCQ from Saved
- **Endpoint:** `DELETE /api/v1/saved-mcqs/{mcq_id}`
- **Query Params:** `phone=+393510000000`

---

## 8. Noted MCQs (2-Way Sync) APIs

### 8.1 Get User's Personal Notes
- **Endpoint:** `GET /api/v1/noted-mcqs`
- **Query Params:** `phone=+393510000000`
- **Headers:** `X-Client-Phone: +393510000000`

### 8.2 Save or Update Note for an MCQ
- **Endpoint:** `POST /api/v1/noted-mcqs`
- **Request Body:**
```json
{
  "phone": "+393510000000",
  "mcq_id": 1052,
  "note_text": "মনে রাখতে হবে: ক্যারেজওয়ে একাধিক হতে পারে কিন্তু রাস্তা এক বা একাধিক হতে পারে।"
}
```

### 8.3 Delete Note
- **Endpoint:** `DELETE /api/v1/noted-mcqs/{mcq_id}`
- **Query Params:** `phone=+393510000000`

---

## 9. Wrong MCQs (Sbagliate) & Correct MCQs (Giuste) APIs

### 9.1 Get Wrong MCQs (Scheda Errori)
- **Endpoint:** `GET /api/v1/wrong-mcqs`
- **Query Params:** `phone=+393510000000`
- **Headers:** `X-Client-Phone: +393510000000`
- **Response:** All questions where the user made mistakes, along with error count (`wrong_count`, `correct_count`).

### 9.2 Get Correct MCQs
- **Endpoint:** `GET /api/v1/correct-mcqs`
- **Query Params:** `phone=+393510000000`
- **Headers:** `X-Client-Phone: +393510000000`

### 9.3 Clear / Reset Error History
- **Endpoint:** `POST /api/v1/wrong-mcqs/reset`
- **Request Body:** `{"phone": "+393510000000", "mcq_ids": [1052, 1053]}`

---

## 10. Flutter Dart Implementation Examples

### Complete Model & Card Widget
```dart
import 'package:flutter/material.dart';

class VocabularyItem {
  final String word;
  final String bangla;
  final String? image;

  VocabularyItem({required this.word, required this.bangla, this.image});

  factory VocabularyItem.fromJson(Map<String, dynamic> json) {
    return VocabularyItem(
      word: json['word'] ?? '',
      bangla: json['bangla'] ?? '',
      image: json['image'],
    );
  }
}

class McqQuestion {
  final int id;
  final String italian;
  final String? bangla;
  final bool isVero;
  final String? image; // Question road sign image (can be null!)
  final String? audio;
  final List<VocabularyItem> vocabulary;

  McqQuestion({
    required this.id,
    required this.italian,
    this.bangla,
    required this.isVero,
    this.image,
    this.audio,
    required this.vocabulary,
  });

  factory McqQuestion.fromJson(Map<String, dynamic> json) {
    return McqQuestion(
      id: json['id'],
      italian: json['italian'] ?? '',
      bangla: json['bangla'],
      isVero: json['is_vero'] == 1 || json['is_vero'] == true,
      image: (json['image'] != null && json['image'].toString().isNotEmpty)
          ? json['image']
          : null,
      audio: json['audio'],
      vocabulary: (json['vocabulary'] as List? ?? [])
          .map((v) => VocabularyItem.fromJson(v))
          .toList(),
    );
  }
}

class McqCardWidget extends StatelessWidget {
  final McqQuestion question;
  final VoidCallback? onPlayAudio;
  final VoidCallback? onToggleSave;
  final VoidCallback? onOpenNote;

  const McqCardWidget({
    Key? key,
    required this.question,
    this.onPlayAudio,
    this.onToggleSave,
    this.onOpenNote,
  }) : super(key: key);

  void _showVocabularyModal(BuildContext context, VocabularyItem vocab) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                vocab.word,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.blueAccent),
              ),
              const SizedBox(height: 8),
              Text(
                vocab.bangla,
                style: const TextStyle(fontSize: 18, color: Colors.black87),
              ),
              if (vocab.image != null && vocab.image!.isNotEmpty) ...[
                const SizedBox(height: 14),
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.network(
                    vocab.image!,
                    maxHeight: 120,
                    fit: BoxFit.contain,
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final hasImage = question.image != null && question.image!.trim().isNotEmpty;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade300, width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Question image slot (Rendered ONLY if hasImage is true)
                if (hasImage) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      question.image!,
                      width: 90,
                      height: 90,
                      fit: BoxFit.contain,
                      errorBuilder: (ctx, err, stack) => const SizedBox.shrink(),
                    ),
                  ),
                  const SizedBox(width: 12),
                ],

                // 2. Question Text with Underlined Interactive Vocabulary
                Expanded(
                  child: Text(
                    question.italian,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Action Toolbar (Pronounce, Translation, Bookmark, Notes)
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                IconButton(
                  icon: const Icon(Icons.mic, color: Colors.green),
                  onPressed: onPlayAudio,
                  tooltip: 'Italian TTS',
                ),
                IconButton(
                  icon: const Icon(Icons.bookmark_border, color: Colors.orange),
                  onPressed: onToggleSave,
                  tooltip: 'Save MCQ',
                ),
                IconButton(
                  icon: const Icon(Icons.edit_note, color: Colors.blue),
                  onPressed: onOpenNote,
                  tooltip: 'Add Note',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```
