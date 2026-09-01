# mBanglaPatenteB REST API Documentation (v1)

Comprehensive API reference for the **mBanglaPatenteB** platform. All API endpoints follow RESTful standards and return JSON responses.

---

## 🌐 Base URL & Common Headers

**Base URL:**  
`https://yourdomain.com/api/v1` (or local `http://127.0.0.1:8000/api/v1`)

**Headers:**
```http
Accept: application/json
Content-Type: application/json
X-Client-Phone: {user_phone}         (optional customer identifier)
X-Session-ID: {session_id}           (optional customer session UUID)
X-CSRF-TOKEN: {csrf_token}           (for POST/PUT/DELETE web requests)
Authorization: Bearer {sanctum_token} (for authenticated user endpoints)
```

---

## 📌 1. Sliders & Banners API

### `GET /api/v1/sliders`
Retrieves all active promotional banners and home screen sliders.

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "Welcome to mBanglaPatenteB",
      "image_url": "https://example.com/uploads/banner1.png",
      "target_url": "/lezioni",
      "is_active": true
    }
  ]
}
```

---

## 📌 2. Test & Practice Quiz API

### `GET /api/v1/test/questions`
Fetches randomized or chapter-filtered practice quiz questions.

**Query Parameters:**
- `chapter_id` (optional): Filter questions by chapter ID.
- `limit` (optional, default 30): Number of questions.

**Response `200 OK`:**
```json
{
  "status": "success",
  "count": 30,
  "data": [
    {
      "id": 101,
      "chapter_id": 1,
      "page_id": 5,
      "italian": "Il segnale raffigurato vieta il transito ai veicoli a motore.",
      "bangla": "প্রদর্শিত সাইনটি মোটর যানবাহনের চলাচল নিষিদ্ধ করে।",
      "is_vero": 1,
      "image": "https://example.com/images/sign101.jpg",
      "audio": "https://example.com/audio/q101.mp3",
      "vocabulary": [
        {"term": "segnale", "bangla": "সাইন / সংকেত"}
      ]
    }
  ]
}
```

### `POST /api/v1/test/submit`
Submits quiz answers and records performance statistics.

**Payload:**
```json
{
  "answers": [
    {"question_id": 101, "user_answer": true},
    {"question_id": 102, "user_answer": false}
  ]
}
```

---

## 📌 3. Argomenti API (Theory Chapters & Pages)

### `GET /api/v1/chapters`
Returns all 25 official Patente B theory chapters.

### `GET /api/v1/chapters/{id}/pages`
Returns all pages under a specific chapter.

### `GET /api/v1/pages/all`
Returns all theory pages across all chapters.

### `GET /api/v1/pages/{id}`
Returns details for a single page along with associated MCQs and vocabulary terms.

---

## 📌 4. E-Class & Lezioni Video API

### `GET /api/v1/eclass`
Returns live and recorded e-learning class schedules and stream links.

### `GET /api/v1/lezioni`
Returns list of structured video lessons with timestamps.

### `GET /api/v1/lezioni/{id}`
Returns video player metadata, Bangla explanation notes, and chapter quizzes for lesson `{id}`.

---

## 📌 5. Cartelli API (Traffic Signs Catalog)

### `GET /api/v1/cartelli/categories`
Returns all traffic sign categories (Pericolo, Obbligo, Divieto, Indicazione, etc.).

### `GET /api/v1/cartelli/chapters/{categoryId?}`
Returns sign chapters under a category.

### `GET /api/v1/cartelli/pages/{chapterId}`
Returns individual traffic sign pages under a chapter.

### `GET /api/v1/cartelli/page-mcqs/{pageId}`
Returns all MCQs specifically associated with a traffic sign.

### `GET /api/v1/cartelli/chapter-mcqs/{chapterId}`
Returns all MCQs under all pages of a traffic sign chapter.

---

## 📌 6. Dizionario API (Italian-Bangla Dictionary)

### `GET /api/v1/dizionario`
Returns full searchable dictionary of Italian driving terms translated to Bangla.

**Query Parameters:**
- `query` or `search` (optional): Search string in Italian or Bangla.

---

## 📌 7. Scheda Esame API (Official 30 MCQs Exam Simulation)

### `GET /api/v1/scheda-esame/generate`
Generates an official 30-question exam sheet adhering to the real Italian Ministry matrix distribution.

### `POST /api/v1/scheda-esame/submit`
Submits exam answers. Returns pass/fail result (max 3 errors allowed for passing).

---

## 📌 8. Sfida Speed Challenge API

### `GET /api/v1/sfida/questions`
Fetches rapid-fire questions for the timed speed challenge game mode.

---

## 📌 9. Noted MCQs & Notes API

### `GET /api/v1/noted-mcqs`
Fetches all MCQs that have user personal study notes attached, complete with full question details and personal note text.

**Query Parameters / Headers:**
- `phone` / `X-Client-Phone`: Customer phone number.
- `session_id` / `X-Session-ID`: Customer session UUID.

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 5,
      "session_id": "app_1788257000",
      "question_id": 101,
      "type": "argomenti",
      "note_text": "Important rule about motor vehicles on highways",
      "question": {
        "id": 101,
        "italian": "Il segnale raffigurato vieta il transito ai veicoli a motore.",
        "bangla": "প্রদর্শিত সাইনটি মোটর যানবাহনের চলাচল নিষিদ্ধ করে।",
        "is_vero": true,
        "image": "https://example.com/images/sign101.jpg",
        "note_text": "Important rule about motor vehicles on highways"
      }
    }
  ]
}
```

### `POST /api/v1/noted-mcqs/save` (or `POST /api/v1/notes`)
Saves or updates a custom personal study note attached to an MCQ or page.

**Payload:**
```json
{
  "question_id": 101,
  "type": "argomenti",
  "note_text": "Remember this exception for trucks"
}
```

### `DELETE /api/v1/noted-mcqs/{id}` (or `DELETE /api/v1/notes/{id}`)
Deletes a saved note by note ID.

---

## 📌 10. Saved MCQs (Bookmarks) API

### `GET /api/v1/saved-mcqs`
Returns user's bookmarked questions across Argomenti and Cartelli.

### `POST /api/v1/saved-mcqs/toggle`
Toggles bookmark/saved state for a question in the database.

**Payload:**
```json
{
  "question_id": 101,
  "type": "argomenti"
}
```

---

## 📌 11. Correct & Wrong MCQs API

### `GET /api/v1/correct-mcqs`
Returns questions answered correctly by the user.

### `GET /api/v1/wrong-mcqs`
Returns questions answered incorrectly by the user for revision.

### `POST /api/v1/user-mcq-results/log`
Logs user answer attempts (correct/wrong) for tracking question statistics.

---

## 📌 12. Support & Live Chat API

### `GET /api/v1/chat/messages` (or `GET /api/v1/support/messages`)
Fetches live customer chat history with admin/tutors.

**Query Parameters:**
- `session_id`: User session UUID.
- `phone`: Customer phone number.

### `POST /api/v1/chat/messages` (or `POST /api/v1/support/messages`)
Sends a message from customer or admin in live chat.

**Payload:**
```json
{
  "message": "Hello tutor, I have a question about chapter 3.",
  "phone": "+393281234567",
  "first_name": "Nazmul",
  "last_name": "Hasan"
}
```

---

## 📌 13. Translation API

### `GET /api/v1/translation`
Returns full Italian sentence translation and word breakdown for a question.

---

## 📌 14. Patente Social API

### `GET /api/v1/patente-social/cards`
Fetches dynamic home dashboard cards.

### `GET /api/v1/patente-social/banners`
Fetches top banners and announcements.

### `GET /api/v1/patente-social/settings`
Fetches application configuration, layouts, and feature flags.

---

## 📌 15. Manuale API (Theory Study Manual)

### `GET /api/v1/manuale/chapters`
Fetches study manual chapter outline.

### `GET /api/v1/manuale/pages/{chapterId}`
Fetches manual pages for a chapter.

### `GET /api/v1/manuale/page/{id}`
Fetches complete formatted manual page content.

---

## 📌 16. Leaderboard API (Top Members & Rank)

### `GET /api/v1/leaderboard`
Fetches top member rankings based on exam score accuracy and practice points.

---

## 📌 17. Client Verification & App Licensing API

### `GET /api/v1/client/status`
Checks user device license and subscription state.

### `POST /api/v1/client/verify` (or `POST /api/v1/support/register`)
Verifies user credentials (First Name, Last Name, Phone Number) and links/registers customer device.

**Payload:**
```json
{
  "first_name": "Nazmul",
  "last_name": "Hasan",
  "phone": "+393281234567",
  "session_id": "app_1788257000"
}
```

### `POST /api/v1/client/activate`
Activates client license for premium access (e.g. 365 days).

**Payload:**
```json
{
  "phone": "+393281234567",
  "days": 365
}
```