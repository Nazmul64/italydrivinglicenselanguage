# 📚 RESTful API Documentation: Notes, Dictionary & Translation System

Complete RESTful API specifications for the Mobile App (Flutter) and Web Client.

---

## 🌐 Base URL & Headers

- **Base URL (Local Dev)**: `http://127.0.0.1:8000/api/v1` or `http://192.168.0.102:8000/api/v1`
- **Standard Headers**:
  ```http
  Accept: application/json
  Content-Type: application/json
  X-Client-Phone: 017XXXXXXXX
  X-Session-ID: <session_uuid_or_client_session_id>
  Authorization: Bearer <sanctum_token> (Optional/if logged in)
  ```

---

## 📝 1. Notes Management API (Noted MCQs)

### 1.1 List All User Notes
- **Endpoint**: `GET /api/v1/noted-mcqs` (or `/api/v1/notes`, `/api/noted-mcqs`)
- **Query Parameters**:
  - `session_id` (string, optional)
  - `phone` / `user_phone` (string, optional)
  - `user_id` (integer, optional)
- **Response**: `200 OK`
```json
{
  "status": "success",
  "total": 1,
  "data": [
    {
      "id": 12,
      "session_id": "sess_abc123",
      "user_id": 1,
      "question_id": 105,
      "page_id": 4,
      "type": "argomenti",
      "note_text": "মনে রাখতে হবে হাইওয়েতে গতিসীমা ১৩০ কিমি/ঘণ্টা",
      "created_at": "2026-09-15T04:20:00.000000Z",
      "updated_at": "2026-09-15T04:20:00.000000Z",
      "question": {
        "id": 105,
        "chapter_id": 1,
        "chapter_name": "Definizioni Generali",
        "italian": "Il limite massimo di velocità in autostrada è di 130 km/h",
        "bangla": "হাইওয়েতে সর্বোচ্চ গতিসীমা ১৩০ কিমি/ঘণ্টা",
        "is_vero": true,
        "image": "https://domain.com/uploads/questions/images/q_105.webp",
        "audio": "/uploads/questions/audios/q_105.mp3",
        "video": null,
        "vocabulary": [
          {"italian": "limite", "bangla": "সীমা"},
          {"italian": "velocità", "bangla": "গতি"}
        ],
        "type": "argomenti",
        "note_id": 12,
        "note_text": "মনে রাখতে হবে হাইওয়েতে গতিসীমা ১৩০ কিমি/ঘণ্টা",
        "page": {
          "id": 4,
          "title": "Strada e sue definizioni",
          "chapter": {
            "id": 1,
            "chapter_number": 1,
            "name": "Definizioni Generali"
          }
        }
      }
    }
  ]
}
```

### 1.2 Save / Update a Note
- **Endpoint**: `POST /api/v1/noted-mcqs/save` (or `/api/v1/noted-mcqs`, `/api/v1/notes`, `/api/notes`)
- **Request Body**:
```json
{
  "question_id": 105,
  "page_id": 4,
  "type": "argomenti",
  "note_text": "মনে রাখতে হবে হাইওয়েতে গতিসীমা ১৩০ কিমি/ঘণ্টা",
  "session_id": "sess_abc123",
  "phone": "017XXXXXXXX"
}
```
*(Accepted aliases for `note_text`: `note`, `text`, `content`, `body`)*
- **Response**: `200 OK`
```json
{
  "status": "success",
  "message": "নোট সফলভাবে সংরক্ষণ করা হয়েছে",
  "data": {
    "id": 12,
    "question_id": 105,
    "note_text": "মনে রাখতে হবে হাইওয়েতে গতিসীমা ১৩০ কিমি/ঘণ্টা",
    "type": "argomenti"
  }
}
```

### 1.3 Delete a Note
- **Endpoint**: `DELETE /api/v1/noted-mcqs/{id}` (or `POST /api/v1/noted-mcqs/delete` with `{"id": 12}`)
- **Response**: `200 OK`
```json
{
  "status": "success",
  "message": "নোটটি মুছে ফেলা হয়েছে"
}
```

---

## 📖 2. Dictionary & Vocabulary Search API

### 2.1 Search Vocabulary Across All Modules
Searches in real-time across Dizionario DB, Argomenti MCQs, Cartelli signs, and Manuale.
- **Endpoint**: `GET /api/v1/dictionary/search` (or `/api/v1/dictionary`, `/api/v1/words`)
- **Query Parameters**:
  - `q` / `search` / `word` (string, optional) - e.g. `autostrada`, `strada`, `গতি`
  - `letter` (char A-Z, optional) - e.g. `A`
- **Response**: `200 OK`
```json
{
  "status": "success",
  "query": "autostrada",
  "letter": "",
  "total": 1,
  "data": [
    {
      "word": "Autostrada",
      "bn": "মহাসড়ক / হাইওয়ে",
      "desc_it": "Strada extraurbana a carreggiate indipendenti o separate da spartitraffico invalicabile",
      "desc_bn": "দ্রুতগতির যানবাহন চলাচলের জন্য বিশেষ প্রশস্ত সড়ক",
      "image": "https://domain.com/uploads/dizionario/images/dict_img_1.webp",
      "audio": "/uploads/dizionario/audios/dict_aud_1.mp3",
      "video": "",
      "source": "Dizionario",
      "target_type": "argomenti",
      "page_id": 1,
      "question_id": 105,
      "chapter": "Definizioni Generali",
      "examples": [
        {
          "it": "Il limite massimo di velocità in autostrada è di 130 km/h",
          "bn": "হাইওয়েতে সর্বোচ্চ গতিসীমা ১৩০ কিমি/ঘণ্টা",
          "chapter": "Definizioni Generali",
          "page_id": 1,
          "question_id": 105,
          "target_type": "argomenti",
          "source": "Argomenti MCQ"
        }
      ]
    }
  ]
}
```

---

## 🌐 3. Bidirectional Italian <-> Bangla Translation API

High-performance translation engine backed by database caching, local dictionary mapping, and online translation fallbacks.

### 3.1 Text Translation
- **Endpoint**: `POST /api/v1/translate` (or `GET /api/v1/translate?text=strada`)
- **Request Body (Italian to Bangla)**:
```json
{
  "text": "La carreggiata può essere a senso unico o a doppio senso di circolazione",
  "from_lang": "it",
  "to_lang": "bn"
}
```
*(If `from_lang` / `to_lang` are omitted, language is automatically detected)*
- **Response**: `200 OK`
```json
{
  "status": "success",
  "translated_text": "ক্যারেজওয়ে একমুখী বা দ্বিমুখী ট্রাফিকের জন্য হতে পারে",
  "translation": "ক্যারেজওয়ে একমুখী বা দ্বিমুখী ট্রাফিকের জন্য হতে পারে",
  "source_text": "La carreggiata può essere a senso unico o a doppio senso di circolazione",
  "from_lang": "it",
  "to_lang": "bn",
  "cached": true
}
```

- **Request Body (Bangla to Italian)**:
```json
{
  "text": "রাস্তা পারাপারের সময় পথচারীদের অগ্রাধিকার দিন",
  "from_lang": "bn",
  "to_lang": "it"
}
```
- **Response**: `200 OK`
```json
{
  "status": "success",
  "translated_text": "Dare la precedenza ai pedoni durante l'attraversamento della strada",
  "translation": "Dare la precedenza ai pedoni durante l'attraversamento della strada",
  "source_text": "রাস্তা পারাপারের সময় পথচারীদের অগ্রাধিকার দিন",
  "from_lang": "bn",
  "to_lang": "it",
  "cached": false
}
```

### 3.2 Question Translation Popup Details
- **Endpoint**: `GET /api/v1/translation?question_id=105`
- **Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "id": 105,
    "italian": "Il limite massimo di velocità in autostrada è di 130 km/h",
    "bangla": "হাইওয়েতে সর্বোচ্চ গতিসীমা ১৩০ কিমি/ঘণ্টা",
    "vocabulary": [
      {"italian": "limite", "bangla": "সীমা"},
      {"italian": "velocità", "bangla": "গতি"}
    ],
    "image": "https://domain.com/uploads/questions/images/q_105.webp"
  }
}
```

---

## 📌 4. Other Key Mobile Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/saved-mcqs` | `GET` | Get user saved (bookmarked) MCQs |
| `/api/v1/saved-mcqs/toggle` | `POST` | Toggle save/unsave MCQ (`question_id`, `type`) |
| `/api/v1/correct-mcqs` | `GET` | List of MCQs answered correctly |
| `/api/v1/wrong-mcqs` | `GET` | List of MCQs answered incorrectly |
| `/api/v1/user-mcq-results/log` | `POST` | Log MCQ practice answer result |
| `/api/v1/chapters` | `GET` | Theory chapters with page & question counts |
| `/api/v1/cartelli/categories` | `GET` | Road signs categories & sign lists |
| `/api/v1/support/register` | `POST` | User registration & initial token |
| `/api/v1/qr/verify` | `POST` | QR token & license verification |

---
