# 🚗 MBanglaPatenteB - Official Master RESTful API & Flutter Integration Documentation

> **Base URL (Local/Development):** `http://127.0.0.1:8000/api/v1`  
> **Base URL (Production):** `https://mbanglapatenteb.com/api/v1`  
> **Headers Required for all API Calls:**  
> - `Accept: application/json`  
> - `Content-Type: application/json`  
> - `X-Client-Phone: <User_Phone_Number>` *(Mandatory for 2-Way Synchronization)*  
> - `Authorization: Bearer <Sanctum_Token>` *(Optional / If user is logged in)*

---

## 📋 Table of Contents
1. [Core Architectural Rules & Problem Solutions (Must Follow for App & Web)](#1-core-architectural-rules--problem-solutions)
   - [Rule 1: Fixed 100px Left Image Area (ALWAYS Blank/Empty if No Image)](#rule-1-fixed-100px-left-image-area-always-blankempty-if-no-image)
   - [Rule 2: Vocabulary Underline Image Isolation (NEVER in Question Card)](#rule-2-vocabulary-underline-image-isolation-never-in-question-card)
   - [Rule 3: 2-Way Real-time Cross-Platform Sync (Web & Mobile App)](#rule-3-2-way-real-time-cross-platform-sync-web--mobile-app)
   - [Rule 4: QR Code Scan & Active License Security Verification](#rule-4-qr-code-scan--active-license-security-verification)
   - [Rule 5: Quiz Progression & Scheda Esame 30-Question Limit](#rule-5-quiz-progression--scheda-esame-30-question-limit)
2. [Authentication, Registration & License Management](#2-authentication-registration--license-management)
3. [QR Code Website Unlock & Verification](#3-qr-code-website-unlock--verification)
4. [Chapters, Topics & Pagina Content APIs](#4-chapters-topics--pagina-content-apis)
5. [MCQs & Cartelli (Road Signs) APIs](#5-mcqs--cartelli-road-signs-apis)
6. [Practice Quiz & Official Scheda Esame APIs](#6-practice-quiz--official-scheda-esame-apis)
7. [Saved MCQs (2-Way Sync) APIs](#7-saved-mcqs-2-way-sync-apis)
8. [Noted MCQs (2-Way Sync) APIs](#8-noted-mcqs-2-way-sync-apis)
9. [Wrong MCQs (Sbagliate) & Correct MCQs (Giuste) APIs](#9-wrong-mcqs-sbagliate--correct-mcqs-giuste-apis)
10. [Flutter Dart Production-Ready Code Examples](#10-flutter-dart-production-ready-code-examples)

---

## 1. Core Architectural Rules & Problem Solutions

### Rule 1: Fixed 100px Left Image Area (ALWAYS Blank/Empty if No Image)
> [!CRITICAL]
> **All MCQ Cards (Saved, Noted, Correct, Wrong, Test Questions, Cartelli) across Web & Flutter Mobile App MUST maintain a fixed 100px left slot for consistency.**
- **If Question has Image (`question.image != null`):** Render the image thumbnail in the left 100px container.
- **If Question has NO Image (`question.image == null`):** **The 100px left slot MUST REMAIN EMPTY / BLANK (`faka thakbe`).** The Italian question text must NEVER expand or shift into the left image area. It must ALWAYS stay aligned on the right column!

```dart
// Flutter Layout Structure:
Row(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    // 1. FIXED 100px LEFT SLOT: Always exists, contains image if available, else blank SizedBox
    Container(
      width: 100,
      height: 100,
      alignment: Alignment.topCenter,
      child: (question.image != null && question.image!.isNotEmpty)
          ? ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                question.image!,
                width: 100,
                height: 100,
                fit: BoxFit.contain,
              ),
            )
          : const SizedBox(width: 100, height: 100), // Blank empty slot!
    ),
    const SizedBox(width: 12),

    // 2. RIGHT TEXT COLUMN: Question text strictly stays on the right
    Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            question.italian,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
          ),
          // Translation, Action Buttons...
        ],
      ),
    ),
  ],
)
```

---

### Rule 2: Vocabulary Underline Image Isolation (NEVER in Question Card)
> [!IMPORTANT]
> **Underline Dictionary Vocabulary images (`question.vocabulary[i].image`) belong ONLY inside the Vocabulary BottomSheet / Popup Modal.**
- Under no circumstance should `vocabulary.image` ever be shown in the main Question Card or in the left 100px slot.
- `question.image` (or `img`) is the ONLY official question image.

---

### Rule 3: 2-Way Real-time Cross-Platform Sync (Web & Mobile App)
Both the Web PWA and Flutter Mobile App connect to the same central Laravel database. All user progress is keyed by the user's **Phone Number**.
- **Saved MCQs**: If user saves an MCQ on Web -> it immediately shows in the Mobile App. If saved on App -> immediately shows on Web.
- **Noted MCQs**: If user adds/edits a note on Web -> instantly synced to App. If edited on App -> instantly synced to Web.
- **Test Results (Correct / Wrong MCQs)**: When a test is taken on Web or App, the backend records each answer to `user_mcq_results` and updates `correct_count` / `wrong_count`. Both Web and App display the same error review list (`/api/v1/wrong-mcqs`) and correct list (`/api/v1/correct-mcqs`).
- **Sync Header**: Always pass `X-Client-Phone: <phone>` with all requests.

---

### Rule 4: QR Code Scan & Active License Security Verification
- **Flow**:
  1. Student enters First Name, Last Name, and Phone Number.
  2. Admin assigns a license key and activates the customer (`is_active = 1`).
  3. When student opens Web PWA, a dynamic QR code is displayed on the screen.
  4. Student opens Flutter Mobile App, taps "Scan Web QR", and scans the QR code.
  5. App sends `POST /api/v1/qr-verification/verify` with `{ qr_data, phone, first_name, last_name }`.
  6. **Security Validation**:
     - If the user's account has an **active license (`is_active == 1`)**: Backend returns `200 OK` and unlocks the Web browser session in real-time.
     - If the user's account is **inactive (`is_active == 0`) or no license**: Backend returns `403 Forbidden` (`License inactive`). The website **WILL NOT UNLOCK**.

---

### Rule 5: Quiz Progression & Scheda Esame 30-Question Limit
- **Official Scheda Esame (Practice Exam)**:
  - Consists of **exactly 30 questions** randomly picked across all official ministerial chapters.
  - The exam progresses sequentially through questions 1 to 30.
  - Upon completing question 30 (or clicking "Concludi Esame"), the app calculates results and presents the **Risultato** summary screen (Passed: `<= 3 errors`, Failed: `>= 4 errors`).
- **Topic / Cartelli / Custom Quiz**:
  - If a topic or cartello has $N$ questions (e.g. 2 questions, 5 questions, 10 questions), the quiz MUST iterate through all $N$ questions ($1, 2, \dots, N$).
  - It **MUST NOT** exit or show the result modal prematurely after just 1 question.

---

## 2. Authentication, Registration & License Management

### 2.1 Customer Registration & License Activation Request
- **Endpoint:** `POST /api/v1/app-clients/register`
- **Request Body:**
```json
{
  "first_name": "Tarikul",
  "last_name": "Islam",
  "phone": "+393510000000",
  "device_id": "device-uuid-123456",
  "activation_key": "MB-2026-ABCD-1234" // Optional
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "status": "success",
  "message": "Activation successful / Registration submitted",
  "data": {
    "session_id": "client_session_abc123",
    "phone": "+393510000000",
    "first_name": "Tarikul",
    "last_name": "Islam",
    "is_active": 1,
    "expires_at": "2027-09-23 20:00:00"
  }
}
```

### 2.2 Check Client License Status
- **Endpoint:** `GET /api/v1/app-clients/status`
- **Query Params:** `phone=+393510000000`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "is_active": true,
  "status": "active",
  "client": {
    "first_name": "Tarikul",
    "last_name": "Islam",
    "phone": "+393510000000",
    "is_active": 1,
    "expires_at": "2027-09-23 20:00:00"
  }
}
```

---

## 3. QR Code Website Unlock & Verification

### 3.1 Mobile QR Code Scan Verification
- **Endpoint:** `POST /api/v1/qr-verification/verify`
- **Description:** Called by the Flutter mobile app when scanning the Web QR code.
- **Request Body:**
```json
{
  "qr_data": "https://mbanglapatenteb.com/?session_id=web_session_xyz789",
  "phone": "+393510000000",
  "first_name": "Tarikul",
  "last_name": "Islam"
}
```
- **Response If Active (`200 OK`):**
```json
{
  "success": true,
  "status": "success",
  "license_status": "active",
  "message": "🎉 Website Full Access Granted! আপনার লাইসেন্স সফলভাবে যাচাই করা হয়েছে।",
  "session_id": "web_session_xyz789",
  "user": {
    "first_name": "Tarikul",
    "last_name": "Islam",
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

---

## 4. Chapters, Topics & Pagina Content APIs

### 4.1 Get All Chapters List
- **Endpoint:** `GET /api/v1/chapters`
- **Response (`200 OK`):** Returns all 25 official Patente B chapters.

### 4.2 Get Chapter Details with Pages & MCQs
- **Endpoint:** `GET /api/v1/chapters/{id}`
- **Query Params:** `with_mcqs=true`

---

## 5. MCQs & Cartelli (Road Signs) APIs

### 5.1 Get MCQ Questions by Page / Topic
- **Endpoint:** `GET /api/v1/mcqs`
- **Query Params:** `page_id=4`, `limit=30`
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
        }
      ]
    }
  ]
}
```

### 5.2 Cartelli (Road Signs) Master List
- **Endpoint:** `GET /api/v1/cartelli`
- **Response:** Returns categories, road sign figures, and associated quiz questions.

---

## 6. Practice Quiz & Official Scheda Esame APIs

### 6.1 Generate Official Scheda Esame (30 Questions)
- **Endpoint:** `GET /api/v1/exam/generate-scheda`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "total_questions": 30,
  "duration_minutes": 20,
  "max_allowed_errors": 3,
  "data": [
    /* Exact array of 30 randomized official question objects */
  ]
}
```

### 6.2 Submit Exam / Quiz Results
- **Endpoint:** `POST /api/v1/user-mcq-results`
- **Request Body:**
```json
{
  "phone": "+393510000000",
  "quiz_type": "scheda_esame",
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

### 8.1 Get User's Noted MCQs
- **Endpoint:** `GET /api/v1/noted-mcqs`
- **Query Params:** `phone=+393510000000`
- **Headers:** `X-Client-Phone: +393510000000`

### 8.2 Save or Update Note
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

### 9.2 Get Correct MCQs
- **Endpoint:** `GET /api/v1/correct-mcqs`
- **Query Params:** `phone=+393510000000`
- **Headers:** `X-Client-Phone: +393510000000`

### 9.3 Reset Wrong MCQs
- **Endpoint:** `POST /api/v1/wrong-mcqs/reset`
- **Request Body:**
```json
{
  "phone": "+393510000000",
  "mcq_ids": [1052, 1053]
}
```

---

## 10. Flutter Dart Production-Ready Code Examples

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
  final String? image; // Question official image (can be null!)
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
  final int index;
  final VoidCallback? onPlayAudio;
  final VoidCallback? onToggleSave;
  final VoidCallback? onOpenNote;

  const McqCardWidget({
    Key? key,
    required this.question,
    required this.index,
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
            // Top Bar: Question Number + Action Eye
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${index + 1}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Question Content Row (Fixed 100px Left Image Area)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. FIXED 100px LEFT SLOT: Renders image if present, otherwise remains BLANK/EMPTY!
                Container(
                  width: 100,
                  height: 100,
                  alignment: Alignment.topCenter,
                  child: hasImage
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            question.image!,
                            width: 100,
                            height: 100,
                            fit: BoxFit.contain,
                            errorBuilder: (ctx, err, stack) => const SizedBox(width: 100, height: 100),
                          ),
                        )
                      : const SizedBox(width: 100, height: 100), // Reserved empty space!
                ),
                const SizedBox(width: 12),

                // 2. Question Text on Right (Never invades left 100px area)
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        question.italian,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          height: 1.4,
                        ),
                      ),
                      if (question.bangla != null && question.bangla!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          question.bangla!,
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade700,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Action Toolbar
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
