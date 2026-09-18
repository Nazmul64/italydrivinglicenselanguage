# Problem Solving & Complete RESTful API Documentation

## 1. Executive Summary of Solved Issues

### 1.1 "404 Not Found" on `/argomenti-schede` Image Loading
* **Root Cause**: When navigating to sub-routes such as `https://mbanglapatenteb.com/argomenti-schede` or `https://mbanglapatenteb.com/page-details`, images stored as relative paths (e.g. `uploads/chapters/thumb.webp`) were resolved by the browser relative to the current subpath URL (e.g. `https://mbanglapatenteb.com/argomenti-schede/uploads/...`), causing HTTP 404 errors.
* **Fix Applied**: 
  1. Updated `ImageHelper::formatImageUrl()` and Eloquent model accessors (`Chapter`, `Page`, `Question`, `CartelloChapter`, `CartelloPage`, `CartelloMcq`, `Manuale`, `Dizionario`) to automatically prepend the full HTTPS domain and format all image/media URLs into fully-qualified absolute URLs.
  2. Updated frontend `window.sanitizeAppImageUrl()` in `01_core_config.js` to ensure any relative path is guaranteed to resolve against `window.location.origin`.

---

### 1.2 Flutter Mobile App Not Displaying Chapter, Page, and MCQ Images
* **Root Cause**: Flutter's native `Image.network(url)` requires a complete URI with scheme and host (e.g., `https://mbanglapatenteb.com/uploads/...`). When the API returned relative paths (`/uploads/chapters/...`), Flutter failed to parse and render them.
* **Fix Applied**:
  1. Standardized all API responses (both `/api/...` and `/api/v1/...`) to serialize fully-qualified HTTPS URLs for `image`, `cover_image`, `audio`, `video`, and nested `vocabulary` item images.
  2. Implemented fallback inheritance: if an individual Question does not have its own unique image, it automatically falls back to its parent Page's image.

---

### 1.3 High Loading Time / Latency on Live Server
* **Root Cause**:
  1. Sequential N+1 SQL queries executing `Question::where('chapter', $ch->id)->count()` inside loops.
  2. The frontend data cache in `routes/web.php` (`getFrontendViewData()`) was previously loading all chapters, pages, and tens of thousands of questions into PHP memory on every web request.
* **Fix Applied**:
  1. Converted chapter question counts to single aggregated queries using Eloquent `withCount(['pages', 'questions'])`.
  2. Optimized `getFrontendViewData()` to load only chapter metadata + page count + question count without hydrating thousands of heavy Question models into memory. Questions now load instantly and dynamically on demand via fast RESTful endpoints.

---

## 2. API Base URLs & Authentication

* **Production Base URL**: `https://mbanglapatenteb.com/api`
* **Versioned Base URL**: `https://mbanglapatenteb.com/api/v1`
* **Supported Protocols**: HTTPS (HTTP auto-redirects to HTTPS)
* **Default Data Format**: `application/json`

### Client Identification Headers (Optional but Recommended)
* `X-Client-Phone`: User's registered phone number (e.g. `+393510000000`)
* `X-Session-ID`: Unique client device UUID or session ID
* `Authorization`: `Bearer {sanctum_token}` (for protected routes)

---

## 3. RESTful API Endpoints Reference

### 3.1 Argomenti (Theory Chapters & Pages)

#### `GET /api/v1/chapters` or `GET /api/chapters`
Retrieve all active theory chapters with page count, question count, and absolute image URLs.

* **Query Parameters**:
  * `category_id` (optional): Filter chapters by category ID.
* **Response Sample (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "chapter_number": 1,
      "name": "DEFINIZIONI STRADALI E DEI VEICOLI",
      "bn_name": "রাস্তা ও যানবাহনের সংজ্ঞা",
      "description": "Introduzione ai concetti fondamentali del codice della strada",
      "image": "https://mbanglapatenteb.com/uploads/chapters/chapter_thumb_1.webp",
      "cover_image": "https://mbanglapatenteb.com/uploads/chapters/chapter_cover_1.webp",
      "pages_count": 12,
      "questions_count": 180,
      "totale": 180,
      "corrette": 0,
      "errori": 0,
      "non_risposte": 180
    }
  ]
}
```

---

#### `GET /api/v1/chapters/{id}/pages` or `GET /api/chapters/{id}/pages`
Retrieve all pages belonging to a specific chapter.

* **Response Sample (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "chapter_id": 1,
      "sort_order": 1,
      "title": "Classificazione delle strade",
      "bn_title": "রাস্তার শ্রেণীবিন্যাস",
      "content": "Descrizione approfondita...",
      "image": "https://mbanglapatenteb.com/uploads/pages/images/page_1.webp",
      "audio": "https://mbanglapatenteb.com/uploads/pages/audios/page_1.mp3",
      "video": "https://www.youtube.com/watch?v=xyz",
      "questions_count": 15,
      "totale": 15
    }
  ]
}
```

---

#### `GET /api/v1/pages/{id}` or `GET /api/pages/{id}`
Retrieve full page details along with all associated MCQs (questions), translations, audios, and vocabulary.

* **Response Sample (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "chapter_id": 1,
    "title": "Classificazione delle strade",
    "image": "https://mbanglapatenteb.com/uploads/pages/images/page_1.webp",
    "chapter": {
      "id": 1,
      "chapter_number": 1,
      "name": "DEFINIZIONI STRADALI E DEI VEICOLI"
    },
    "questions": [
      {
        "id": 101,
        "page_id": 1,
        "sort_order": 1,
        "italian": "La strada può essere suddivisa in carreggiate",
        "bangla": "রাস্তা একাধিক ক্যারেজওয়েতে বিভক্ত হতে পারে",
        "is_vero": true,
        "image": "https://mbanglapatenteb.com/uploads/questions/images/q_101.webp",
        "image_position": "left",
        "audio": "https://mbanglapatenteb.com/uploads/questions/audios/q_101.mp3",
        "vocabulary": [
          {
            "word": "carreggiate",
            "meaning": "ক্যারেজওয়ে / চলাচলের লেন",
            "image": "https://mbanglapatenteb.com/uploads/vocabulary/carreggiata.webp"
          }
        ]
      }
    ]
  }
}
```

---

### 3.2 Cartelli (Road Signs) System

#### `GET /api/v1/cartelli/categories`
Get all active road sign categories (Segnali di Pericolo, Divieto, Obbligo, Precedenza, etc.).

#### `GET /api/v1/cartelli/chapters/{categoryId?}`
Get road sign chapters under a category.

#### `GET /api/v1/cartelli/pages/{chapterId}`
Get road sign pages with image and descriptions.

#### `GET /api/v1/cartelli/page-mcqs/{pageId}`
Get MCQs for a specific road sign page.

#### `GET /api/v1/cartelli/chapter-mcqs/{chapterId}`
Get all MCQs across all pages in a Cartelli chapter.

---

### 3.3 Official Exam Simulation (Scheda Esame)

#### `GET /api/v1/scheda-esame/generate` (or `/api/quiz/exam`)
Generate an official 30-question Scheda Esame (20 Argomenti questions + 10 Cartelli questions).

* **Response Sample (200 OK)**:
```json
{
  "status": "success",
  "duration_minutes": 20,
  "max_allowed_errors": 3,
  "total_questions": 30,
  "data": [
    {
      "id": 105,
      "type": "argomenti",
      "italian": "...",
      "bangla": "...",
      "is_vero": true,
      "image": "https://mbanglapatenteb.com/uploads/questions/images/105.webp"
    }
  ]
}
```

#### `POST /api/v1/scheda-esame/submit`
Submit exam answers and receive pass/fail verdict (Pass: <= 3 errors, Fail: > 3 errors).

* **Request Body**:
```json
{
  "session_id": "device-uuid-12345",
  "total_questions": 30,
  "correct_count": 28,
  "wrong_count": 2,
  "answers": [
    {"question_id": 105, "user_answer": true, "is_correct": true}
  ]
}
```

---

### 3.4 Bookmarks, Notes & History Tracking

#### `GET /api/v1/saved-mcqs`
Retrieve list of bookmarked questions for the active user/device.

#### `POST /api/v1/saved-mcqs/toggle`
Toggle bookmark status for a question.
* **Request Body**: `{"question_id": 105, "type": "argomenti"}`

#### `GET /api/v1/noted-mcqs` (or `/api/v1/notes`)
Retrieve user's personal notes on MCQs.

#### `POST /api/v1/noted-mcqs/save` (or `/api/v1/notes`)
Save or update a personal note for an MCQ.

#### `POST /api/v1/user-mcq-results/log`
Log individual or bulk quiz practice results into `user_mcq_results` for accuracy analytics.

---

### 3.5 Dictionary & Vocabulary System

#### `GET /api/v1/dictionary` or `GET /api/v1/words`
Search Italian-Bangla dictionary keywords.
* **Query Parameters**: `search=strada`

#### `GET /api/v1/manuale/chapters`
Get theory manual chapters.

#### `GET /api/v1/manuale/pages/{chapterId}`
Get theory manual pages for study.

---

### 3.6 Live Chat & Customer Support

#### `GET /api/v1/chat/messages`
Retrieve message history between the client and admin support.
* **Query Parameters**: `phone=+393510000000` or `session_id=xxx`

#### `POST /api/v1/chat/messages`
Send text message and/or image attachment.

#### `POST /api/v1/chat/upload-image`
Upload image attachment for chat (`image` multipart file).

---

## 4. Verification & Testing

| Feature / Endpoint | Test Result |
| :--- | :--- |
| `GET /api/v1/chapters` | **200 OK** (Instant response, full image URLs) |
| `GET /api/v1/chapters/1/pages` | **200 OK** (Full image & audio URLs) |
| `GET /api/v1/pages/1` | **200 OK** (Questions with vocabulary & images) |
| `GET /api/v1/scheda-esame/generate` | **200 OK** (30 questions generated) |
| Web PWA Subroutes (`/argomenti-schede`) | **200 OK** (No 404 relative path failures) |
| Mobile App Image Rendering | **100% Fixed** (Full HTTPS scheme provided) |
