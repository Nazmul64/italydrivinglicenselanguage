# 🚗 MBanglaPatenteB - Official Master RESTful API & Flutter Integration Documentation

> **Base URL (Local/Development):** `http://127.0.0.1:8000/api/v1`  
> **Base URL (Production):** `https://mbanglapatenteb.com/api/v1`  
> **Headers Required for all API Calls:**  
> - `Accept: application/json`  
> - `Content-Type: application/json`  
> - `X-Client-Phone: <User_Phone_Number>` *(Mandatory for 2-Way Synchronization)*  
> - `X-Session-ID: <Session_Or_Device_UUID>` *(Optional / Client Tracking)*  
> - `Authorization: Bearer <Sanctum_Token>` *(Optional / If user is logged in)*

---

## 📋 Table of Contents
1. [Core Architectural Rules & UI Guidelines (Must Follow for App & Web)](#1-core-architectural-rules--ui-guidelines)
   - [Rule 1: Fixed 100px Left Image Area (ALWAYS Blank/Empty if No Image)](#rule-1-fixed-100px-left-image-area-always-blankempty-if-no-image)
   - [Rule 2: User Answer Stats `(TU) Hai risposto: Giusto X / Sbagliato Y` (Blank if Unanswered)](#rule-2-user-answer-stats-tu-hai-risposto-giusto-x--sbagliato-y)
   - [Rule 3: Vocabulary Underline Image Isolation (NEVER in Question Card)](#rule-3-vocabulary-underline-image-isolation-never-in-question-card)
   - [Rule 4: 2-Way Real-time Cross-Platform Sync (Web & Mobile App)](#rule-4-2-way-real-time-cross-platform-sync-web--mobile-app)
   - [Rule 5: QR Code Scan & Active License Security Verification](#rule-5-qr-code-scan--active-license-security-verification)
   - [Rule 6: Quiz Progression & Non-Premature Termination](#rule-6-quiz-progression--non-premature-termination)
2. [Authentication, Registration & License Management](#2-authentication-registration--license-management)
3. [QR Code Website Unlock & Verification](#3-qr-code-website-unlock--verification)
4. [Chapters, Topics & Pagina Content APIs](#4-chapters-topics--pagina-content-apis)
5. [MCQs & Cartelli (Road Signs) APIs with User Progress](#5-mcqs--cartelli-road-signs-apis-with-user-progress)
6. [Practice Quiz & Official Scheda Esame APIs](#6-practice-quiz--official-scheda-esame-apis)
7. [Saved MCQs (2-Way Sync) APIs](#7-saved-mcqs-2-way-sync-apis)
8. [Noted MCQs (2-Way Sync) APIs](#8-noted-mcqs-2-way-sync-apis)
9. [Wrong MCQs (Sbagliate) & Correct MCQs (Giuste) APIs](#9-wrong-mcqs-sbagliate--correct-mcqs-giuste-apis)
10. [MCQ Answer Result Logging API (Real-time Sync)](#10-mcq-answer-result-logging-api-real-time-sync)
11. [Flutter Dart Production-Ready Models & UI Widget](#11-flutter-dart-production-ready-models--ui-widget)

---

## 1. Core Architectural Rules & UI Guidelines

### Rule 1: Fixed 100px Left Image Area (ALWAYS Blank/Empty if No Image)
> [!CRITICAL]
> **All MCQ Cards (Argomenti, Cartelli, Saved, Noted, Correct, Wrong, Test Questions) across Web & Flutter Mobile App MUST maintain a fixed 100px left slot.**
- **If Question has Image (`question.image != null`):** Render the image thumbnail in the left 100px container.
- **If Question has NO Image (`question.image == null`):** **The 100px left slot MUST REMAIN EMPTY / BLANK (`faka thakbe`).** The Italian question text must NEVER expand or shift into the left image area. It must ALWAYS stay aligned on the right column.

```dart
// Fixed 100px Left Image Area Structure:
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
)
```

---

### Rule 2: User Answer Stats `(TU) Hai risposto: Giusto X / Sbagliato Y`
> [!IMPORTANT]
> **Every MCQ card in Argomenti (Vere e False), Cartelli, and Topics displays the user's historical answer count directly below the audio player / action bar:**
- **If user has answered (`question.has_answered == true` OR `correct_count > 0 || wrong_count > 0`):**
  Show the capsule container:
  ```text
  (TU) Hai risposto:
  Giusto X volte        Sbagliato Y volte
  ```
  *(Green text for `Giusto ${question.correct_count} volte`, Red text for `Sbagliato ${question.wrong_count} volte`)*
- **If user has NOT answered (`question.has_answered == false` AND `correct_count == 0 && wrong_count == 0`):**
  **The bottom section remains BLANK / EMPTY (`faka thakbe`)** (i.e. `const SizedBox.shrink()`).

```dart
// User Response Stats Widget Structure:
if (question.hasAnswered || (question.correctCount > 0 || question.wrongCount > 0)) ...[
  Container(
    width: double.infinity,
    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
    margin: const EdgeInsets.only(top: 8),
    decoration: BoxDecoration(
      color: const Color(0xFFF8FAFC),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: const Color(0xFFE2E8F0)),
    ),
    child: Column(
      children: [
        const Text(
          '(TU) Hai risposto:',
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Giusto ${question.correctCount} volte',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF16A34A)),
            ),
            const SizedBox(width: 18),
            Text(
              'Sbagliato ${question.wrongCount} volte',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFEF4444)),
            ),
          ],
        ),
      ],
    ),
  ),
]
```

---

### Rule 3: Vocabulary Underline Image Isolation (NEVER in Question Card)
> [!IMPORTANT]
> **Underline Dictionary Vocabulary images (`question.vocabulary[i].image`) belong ONLY inside the Vocabulary BottomSheet / Popup Modal.**
- Under no circumstance should `vocabulary.image` ever be shown in the main Question Card or in the left 100px slot.
- `question.image` (or `img`) is the ONLY official question image.

---

### Rule 4: 2-Way Real-time Cross-Platform Sync (Web & Mobile App)
Both the Web PWA and Flutter Mobile App connect to the same central Laravel database. All user progress is keyed by the user's **Phone Number**.
- **Saved MCQs**: If user saves an MCQ on Web -> it immediately shows in the Mobile App. If saved on App -> immediately shows on Web.
- **Noted MCQs**: If user adds/edits a note on Web -> instantly synced to App. If edited on App -> instantly synced to Web.
- **Answer Statistics & Error Review**:
  - `GET /api/v1/wrong-mcqs` returns all MCQs where user made errors (`wrong_count > 0` or `is_correct == 0`).
  - `GET /api/v1/correct-mcqs` returns all MCQs where user answered correctly (`correct_count > 0` or `is_correct == 1`).
  - `POST /api/v1/user-mcq-results/log` logs answer attempts in real time and updates stats.
- **Sync Header**: Always pass `X-Client-Phone: <phone>` with all requests.

---

### Rule 5: QR Code Scan & Active License Security Verification
- **Flow**:
  1. Student registers or logs in with their Phone Number.
  2. When student opens Web PWA, a dynamic QR code is displayed on the screen.
  3. Student opens Flutter Mobile App, taps "Scan Web QR", and scans the QR code.
  4. App sends `POST /api/v1/qr-verification/verify` with `{ qr_data, phone, first_name, last_name }`.
  5. **Security Validation**:
     - If the user has an **active license (`is_active == 1`)**: Backend returns `200 OK` and unlocks the Web browser session in real-time.
     - If the user is **inactive (`is_active == 0`)**: Backend returns `403 Forbidden` (`License inactive`). The website **WILL NOT UNLOCK**.

---

### Rule 6: Quiz Progression & Non-Premature Termination
- **Official Scheda Esame**:
  - Consists of **exactly 30 questions** randomly selected across chapters.
  - Progresses sequentially through questions 1 to 30.
  - Submits upon completing question 30 or clicking "Concludi Esame".
- **Topic / Custom Practice Quiz**:
  - If a topic or custom selection has $N$ questions (e.g. 2 questions or 30 questions), the quiz MUST present all $N$ questions.
  - It **MUST NOT** exit or trigger result submission prematurely after 1 question.
  - When clicking Back (`<`) during a test, the app prompts for confirmation rather than auto-submitting incomplete answers.

---

### Rule 7: Note Text Isolation (NEVER Render Note Banner on Main MCQ Card)
> [!CRITICAL]
> **Do NOT render any inline yellow banner / note text box (e.g. `📝 code`) directly inside or above the MCQ card.**
- **The Main MCQ Card MUST Remain Clean**: The note text belongs strictly inside the **Note Popup Dialog / Modal** and in the dedicated **Noted MCQs** screen (`/api/v1/noted-mcqs`).
- **Visual Feedback on Card**:
  - If the question has a note (`question.userNote != null && question.userNote!.isNotEmpty`):
    - Highlight the **Note icon button** (e.g., `color: Colors.amber.shade800` / filled `Icons.note` icon).
  - Tapping the Note icon button opens the `showNoteDialog(context, question)` modal to view, edit, or delete the note.
  - **No inline note box should ever appear between the question text and action buttons on the card.**

---

## 2. Authentication, Registration & License Management

### 2.1 Customer Registration & License Activation Request
- **Endpoint:** `POST /api/v1/support/register`
- **Request Body:**
```json
{
  "first_name": "Tarikul",
  "last_name": "Islam",
  "phone": "+393510000000",
  "device_id": "device-uuid-123456",
  "activation_key": "MB-2026-ABCD-1234"
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
- **Endpoint:** `GET /api/v1/client/status`
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

### 4.1 Get All Chapters with Progress Counts
- **Endpoint:** `GET /api/v1/chapters`
- **Headers:** `X-Client-Phone: +393510000000`
- **Response (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "chapter_number": 1,
      "name": "DOVERI NELL'USO DELLA STRADA",
      "bn_name": "রাস্তা ব্যবহারের নিয়মাবলী",
      "questions_count": 120,
      "corrette": 45,
      "errori": 5,
      "non_risposte": 70,
      "pages_count": 12
    }
  ]
}
```

### 4.2 Get Pages for a Chapter
- **Endpoint:** `GET /api/v1/chapters/{chapter_id}/pages`
- **Headers:** `X-Client-Phone: +393510000000`
- **Response (`200 OK`):** Returns all pages within the chapter with question and error progress counts.

---

## 5. MCQs & Cartelli (Road Signs) APIs with User Progress

### 5.1 Get Page Details & MCQs (with Answer History & Stats)
- **Endpoint:** `GET /api/v1/pages/{page_id}`
- **Headers:** `X-Client-Phone: +393510000000`
- **Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "chapter_id": 1,
    "title": "Definizioni stradali: la strada",
    "bn_title": "রাস্তার সংজ্ঞা ও পরিচিতি",
    "questions": [
      {
        "id": 2,
        "chapter": 1,
        "page_id": 1,
        "sort_order": 2,
        "italian": "La strada può comprendere le piste ciclabili",
        "bangla": "রাস্তায় সাইকেল লেন অন্তর্ভুক্ত থাকতে পারে",
        "is_vero": true,
        "image": null,
        "image_position": "left",
        "audio": "/uploads/audio/q2.mp3",
        "video": null,
        "vocabulary": [
          { "word": "strada", "bangla": "রাস্তা", "image": null },
          { "word": "piste ciclabili", "bangla": "সাইকেল লেন", "image": "/uploads/vocab/pista.webp" }
        ],
        "user_answer": "F",
        "is_correct": false,
        "correct_count": 0,
        "wrong_count": 1,
        "has_answered": true,
        "is_saved": false,
        "user_note": null
      },
      {
        "id": 3,
        "chapter": 1,
        "page_id": 1,
        "sort_order": 3,
        "italian": "La strada può essere a senso unico di circolazione",
        "bangla": "রাস্তা একমুখী চলাচলের হতে পারে",
        "is_vero": true,
        "image": null,
        "image_position": "left",
        "audio": "/uploads/audio/q3.mp3",
        "video": null,
        "vocabulary": [],
        "user_answer": null,
        "is_correct": null,
        "correct_count": 0,
        "wrong_count": 0,
        "has_answered": false,
        "is_saved": false,
        "user_note": null
      }
    ]
  }
}
```

### 5.2 Get Cartelli (Road Signs) Page MCQs
- **Endpoint:** `GET /api/v1/cartelli/page-mcqs/{pageId}`
- **Headers:** `X-Client-Phone: +393510000000`
- **Response (`200 OK`):** Returns road sign MCQs with `correct_count`, `wrong_count`, `has_answered`, `user_answer`, `is_saved`, `user_note`.

### 5.3 Get Cartelli Chapter MCQs
- **Endpoint:** `GET /api/v1/cartelli/chapter-mcqs/{chapterId}`
- **Headers:** `X-Client-Phone: +393510000000`

---

## 6. Practice Quiz & Official Scheda Esame APIs

### 6.1 Generate Official Scheda Esame (30 Questions)
- **Endpoint:** `GET /api/v1/quiz/exam` or `GET /api/v1/scheda-esame/generate`
- **Response (`200 OK`):** Returns 30 randomized official ministerial questions.

### 6.2 Submit Exam Simulation Result
- **Endpoint:** `POST /api/v1/scheda-esame/submit`
- **Request Body:**
```json
{
  "total_questions": 30,
  "correct_count": 28,
  "wrong_count": 2,
  "unanswered_count": 0,
  "is_passed": true,
  "answers": [
    { "question_id": 2, "user_answer": "V", "is_correct": true },
    { "question_id": 3, "user_answer": "F", "is_correct": false }
  ]
}
```

---

## 7. Saved MCQs (2-Way Sync) APIs

### 7.1 Get User's Saved MCQs
- **Endpoint:** `GET /api/v1/saved-mcqs`
- **Headers:** `X-Client-Phone: +393510000000`

### 7.2 Toggle Save/Bookmark an MCQ
- **Endpoint:** `POST /api/v1/saved-mcqs/toggle`
- **Request Body:**
```json
{
  "question_id": 2,
  "type": "argomenti"
}
```

---

## 8. Noted MCQs (2-Way Sync) APIs

### 8.1 Get User's Noted MCQs
- **Endpoint:** `GET /api/v1/noted-mcqs`
- **Headers:** `X-Client-Phone: +393510000000`

### 8.2 Save or Update Note
- **Endpoint:** `POST /api/v1/noted-mcqs`
- **Request Body:**
```json
{
  "question_id": 2,
  "page_id": 1,
  "type": "argomenti",
  "note_text": "রাস্তায় সাইকেল লেন থাকতে পারে।"
}
```

### 8.3 Delete Note
- **Endpoint:** `DELETE /api/v1/noted-mcqs/{id}`

---

## 9. Wrong MCQs (Sbagliate) & Correct MCQs (Giuste) APIs

### 9.1 Get Wrong Answered MCQs
- **Endpoint:** `GET /api/v1/wrong-mcqs`
- **Headers:** `X-Client-Phone: +393510000000`
- **Query Params:** `chapter_id=1`, `page_id=1`, `search=strada`

### 9.2 Get Correct Answered MCQs
- **Endpoint:** `GET /api/v1/correct-mcqs`
- **Headers:** `X-Client-Phone: +393510000000`
- **Query Params:** `chapter_id=1`, `page_id=1`, `search=strada`

---

## 10. MCQ Answer Result Logging API (Real-time Sync)

### 10.1 Log Single or Multiple MCQ Answers
- **Endpoint:** `POST /api/v1/user-mcq-results/log`
- **Headers:** `X-Client-Phone: +393510000000`
- **Request Body (Single MCQ or Batch Array):**
```json
{
  "results": [
    {
      "question_id": 2,
      "type": "argomenti",
      "user_answer": "F",
      "is_correct": false
    }
  ]
}
```
- **Response (`200 OK`):**
```json
{
  "status": "success",
  "success": true,
  "count": 1,
  "logged": [
    {
      "question_id": 2,
      "correct_count": 0,
      "wrong_count": 1,
      "is_correct": 0,
      "user_answer": "F"
    }
  ]
}
```

---

## 11. Flutter Dart Production-Ready Models & UI Widget

### 11.1 MCQ Model (`mcq_question.dart`)
```dart
class VocabularyItem {
  final String word;
  final String bangla;
  final String? image;

  VocabularyItem({
    required this.word,
    required this.bangla,
    this.image,
  });

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
  final int? chapterId;
  final int? pageId;
  final String italian;
  final String? bangla;
  final bool isVero;
  final String? image;
  final String? audio;
  final List<VocabularyItem> vocabulary;
  
  // User historical statistics
  final String? userAnswer;
  final bool? isCorrect;
  final int correctCount;
  final int wrongCount;
  final bool hasAnswered;
  final bool isSaved;
  final String? userNote;

  McqQuestion({
    required this.id,
    this.chapterId,
    this.pageId,
    required this.italian,
    this.bangla,
    required this.isVero,
    this.image,
    this.audio,
    required this.vocabulary,
    this.userAnswer,
    this.isCorrect,
    this.correctCount = 0,
    this.wrongCount = 0,
    this.hasAnswered = false,
    this.isSaved = false,
    this.userNote,
  });

  factory McqQuestion.fromJson(Map<String, dynamic> json) {
    return McqQuestion(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      chapterId: json['chapter_id'] ?? json['chapter'],
      pageId: json['page_id'],
      italian: json['italian'] ?? json['question'] ?? '',
      bangla: json['bangla'] ?? json['bn_question'],
      isVero: json['is_vero'] == 1 || json['is_vero'] == true || json['correct_answer'] == 'vero' || json['correct_answer'] == '1',
      image: (json['image'] != null && json['image'].toString().isNotEmpty)
          ? json['image'].toString()
          : null,
      audio: json['audio'] ?? json['voice'],
      vocabulary: (json['vocabulary'] as List? ?? [])
          .map((v) => VocabularyItem.fromJson(v))
          .toList(),
      userAnswer: json['user_answer']?.toString(),
      isCorrect: json['is_correct'] == null ? null : (json['is_correct'] == 1 || json['is_correct'] == true),
      correctCount: json['correct_count'] is int ? json['correct_count'] : (int.tryParse(json['correct_count']?.toString() ?? '0') ?? 0),
      wrongCount: json['wrong_count'] is int ? json['wrong_count'] : (int.tryParse(json['wrong_count']?.toString() ?? '0') ?? 0),
      hasAnswered: json['has_answered'] == true || json['has_answered'] == 1,
      isSaved: json['is_saved'] == true || json['is_saved'] == 1,
      userNote: json['user_note']?.toString(),
    );
  }
}
```

### 11.2 MCQ Card Widget with Fixed 100px Left Slot & Stats Capsule
```dart
import 'package:flutter/material.dart';

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

  @override
  Widget build(BuildContext context) {
    final hasImage = question.image != null && question.image!.trim().isNotEmpty;
    final showStats = question.hasAnswered || (question.correctCount > 0 || question.wrongCount > 0);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade300, width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Row 1: Question Index & 'V' / 'F' Official Indicator
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${index + 1}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Text(
                  question.isVero ? 'V' : 'F',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: question.isVero ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Row 2: Question Content (Fixed 100px Left Slot)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. FIXED 100px LEFT SLOT: Always exists, contains image if available, else blank SizedBox
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

                // 2. Question Text on Right Column
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
            const SizedBox(height: 10),

            // Row 3: Action Toolbar (TTS Audio, Bookmark, Note)
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                IconButton(
                  icon: const Icon(Icons.volume_up, color: Colors.blue),
                  onPressed: onPlayAudio,
                  tooltip: 'Italian TTS',
                ),
                IconButton(
                  icon: Icon(
                    question.isSaved ? Icons.bookmark : Icons.bookmark_border,
                    color: question.isSaved ? Colors.green : Colors.grey,
                  ),
                  onPressed: onToggleSave,
                  tooltip: 'Save MCQ',
                ),
                IconButton(
                  icon: Icon(
                    question.userNote != null && question.userNote!.isNotEmpty ? Icons.note : Icons.note_add_outlined,
                    color: question.userNote != null ? Colors.amber.shade800 : Colors.grey,
                  ),
                  onPressed: onOpenNote,
                  tooltip: 'Note',
                ),
              ],
            ),

            // Row 4: (TU) Hai risposto Capsule (Render ONLY when answered, otherwise keep BLANK)
            if (showStats) ...[
              const Divider(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    const Text(
                      '(TU) Hai risposto:',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Giusto ${question.correctCount} volte',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF16A34A)),
                        ),
                        const SizedBox(width: 20),
                        Text(
                          'Sbagliato ${question.wrongCount} volte',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFEF4444)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// 11.3 Clean Note Dialog (Opens on Note icon click - NOT rendered inside the card)
void showNoteDialog(BuildContext context, McqQuestion question, Function(String newNote) onSaveNote, VoidCallback onDeleteNote) {
  final controller = TextEditingController(text: question.userNote ?? '');

  showDialog(
    context: context,
    builder: (ctx) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Row(
        children: const [
          Icon(Icons.edit_note, color: Colors.amber),
          SizedBox(width: 8),
          Text('MCQ Note', style: TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
      content: TextField(
        controller: controller,
        maxLines: 4,
        decoration: InputDecoration(
          hintText: 'এখানে আপনার ব্যক্তিগত নোট লিখুন...',
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          filled: true,
          fillColor: const Color(0xFFF8FAFC),
        ),
      ),
      actions: [
        if (question.userNote != null && question.userNote!.isNotEmpty)
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              onDeleteNote();
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        TextButton(
          onPressed: () => Navigator.pop(ctx),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF16A34A),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          onPressed: () {
            final text = controller.text.trim();
            Navigator.pop(ctx);
            onSaveNote(text);
          },
          child: const Text('Save Note'),
        ),
      ],
    ),
  );
}
```

