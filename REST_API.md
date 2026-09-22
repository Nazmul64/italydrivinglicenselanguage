# 🚀 Italy Driving License Platform - RESTful API v1 Documentation

## 🌐 Base URL
- **Production URL**: `https://mbanglapatenteb.com/api/v1`
- **Interactive Documentation**: `https://mbanglapatenteb.com/documentation.php`

---

## 🔒 Cross-Platform Synchronization & User Identity Architecture
All user activities (Noted MCQs, Saved/Bookmarked MCQs, Wrong/Incorrect MCQs, Correct MCQs, Support Chat Messages, Progress Stats) are 100% seamlessly synchronized between the **Flutter Mobile App** and the **Web Browser PWA**.

### 📱 User Identification Priority
The backend automatically resolves user context from:
1. **Bearer Token** (`Authorization: Bearer <token>` via Laravel Sanctum)
2. **Phone Number Headers & Parameters**:
   - Headers: `X-Client-Phone: 01706640864`
   - Parameters: `?phone=01706640864` or `?user_phone=01706640864`
   - Cookie / Web Session: `app_client_phone`
3. **Session ID Headers & Parameters**:
   - Headers: `X-Session-ID: <session_uuid_or_id>` or `X-Client-Session-ID: <session_id>`
   - Parameters: `?session_id=<session_id>`
   - Cookie: `app_client_session_id`, `qr_session_id`
4. **Active Client Auto-Fallback**:
   - For web visitors where phone is resolving, automatically links to the verified/active client record.

---

## 📖 Endpoints Reference

### 1. 📚 Chapters & Pages with Progress Statistics (চ্যাপ্টার এবং প্রোগ্রেস ডাটা)
- **Get All Chapters with Full Progress Stats**: `GET /api/v1/chapters`
  - **Headers**: `X-Client-Phone: 01706640864`, `X-Session-ID: <session_id>`
  - **Query Params**: `?phone=01706640864&session_id=<session_id>`
  - **Response**:
    ```json
    {
      "status": "success",
      "data": [
        {
          "id": 1,
          "chapter_number": 1,
          "name": "DOVERI NELL'USO DELLA STRADA",
          "bn_name": "রাস্তা ব্যবহারের নিয়মাবলী",
          "cover_image": "https://mbanglapatenteb.com/uploads/chapters/...",
          "pages_count": 12,
          "question_count": 535,
          "questions_count": 535,
          "totale": 535,
          "corrette": 149,
          "errori": 40,
          "non_risposte": 346
        }
      ]
    }
    ```
- **Get Pages for Chapter with Progress**: `GET /api/v1/chapters/{id}/pages`
  - **Headers**: `X-Client-Phone: 01706640864`, `X-Session-ID: <session_id>`
  - **Response**:
    ```json
    {
      "status": "success",
      "data": [
        {
          "id": 1,
          "chapter_id": 1,
          "title": "DEFINIZIONE DI STRADA",
          "bn_title": "রাস্তার সংজ্ঞা",
          "image": "https://mbanglapatenteb.com/uploads/pages/...",
          "questions_count": 25,
          "question_count": 25,
          "totale": 25,
          "corrette": 15,
          "errori": 2,
          "non_risposte": 8
        }
      ]
    }
    ```
- **Get Page Details with Questions**: `GET /api/v1/pages/{id}`

---

### 2. 📝 Noted MCQs (নোট করা প্রশ্ন)
- **Get Noted MCQs**: `GET /api/v1/noted-mcqs`
  - **Headers**: `X-Client-Phone: 01706640864`, `X-Session-ID: <session_id>`
  - **Query Params**: `?phone=01706640864&session_id=<session_id>`
  - **Response**:
    ```json
    {
      "status": "success",
      "total": 2,
      "data": [
        {
          "id": 1,
          "question_id": 105,
          "type": "argomenti",
          "note_text": "Important speed limit rule for autostrada",
          "created_at": "2026-09-18T22:43:00.000000Z",
          "question": {
            "id": 105,
            "chapter_id": 1,
            "chapter_name": "Definizioni Generali",
            "italian": "Il limite massimo di velocita in autostrada e di 130 km/h",
            "bangla": "হাইওয়েতে সর্বোচ্চ গতিসীমা ১৩০ কিমি/ঘণ্টা",
            "is_vero": true,
            "image": "https://mbanglapatenteb.com/uploads/...",
            "audio": "https://mbanglapatenteb.com/audios/...",
            "note_text": "Important speed limit rule for autostrada"
          }
        }
      ]
    }
    ```
- **Save / Update Note**: `POST /api/v1/noted-mcqs/save`
  - **Body**:
    ```json
    {
      "question_id": 105,
      "type": "argomenti",
      "note_text": "Important speed limit rule for autostrada",
      "phone": "01706640864",
      "session_id": "<session_id>"
    }
    ```
- **Delete Note**: `DELETE /api/v1/noted-mcqs/{id}` or `POST /api/v1/noted-mcqs/delete`

---

### 3. 🔖 Saved / Bookmarked MCQs (সেভ করা প্রশ্ন)
- **Get Bookmarks**: `GET /api/v1/saved-mcqs`
  - **Headers**: `X-Client-Phone: 01706640864`
  - **Query Params**: `?phone=01706640864&session_id=<session_id>`
- **Toggle Bookmark (Save/Unsave)**: `POST /api/v1/saved-mcqs/toggle`
  - **Body**:
    ```json
    {
      "question_id": 105,
      "type": "argomenti",
      "phone": "01706640864",
      "session_id": "<session_id>"
    }
    ```
  - **Response**:
    ```json
    {
      "status": "success",
      "saved": true,
      "message": "Question added to bookmarks",
      "data": { }
    }
    ```

---

### 4. ❌ Wrong MCQs (ভুল উত্তরের প্রশ্ন)
- **Get Wrong MCQs**: `GET /api/v1/wrong-mcqs`
  - **Headers**: `X-Client-Phone: 01706640864`
  - **Query Params**: `?phone=01706640864&chapter_id=&page_id=&date=&search=`
  - **Response**:
    ```json
    {
      "status": "success",
      "total_wrong": 2,
      "data": [
        {
          "id": 102,
          "chapter_id": 1,
          "chapter_name": "Definizioni Generali",
          "italian": "Bisogna sempre dare la precedenza a destra e a sinistra",
          "bangla": "সর্বদা ডানে এবং বামে অগ্রাধিকার দিতে হবে",
          "is_vero": false,
          "image": "https://mbanglapatenteb.com/uploads/..."
        }
      ]
    }
    ```

---

### 5. ✔ Correct MCQs (সঠিক উত্তরের প্রশ্ন)
- **Get Correct MCQs**: `GET /api/v1/correct-mcqs`
  - **Headers**: `X-Client-Phone: 01706640864`
  - **Query Params**: `?phone=01706640864&chapter_id=&page_id=&date=&search=`

---

### 6. 📊 Submit Quiz / MCQ Results (লগ রেজাল্ট)
- **Log MCQ Results**: `POST /api/v1/user-mcq-results/log`
  - **Body**:
    ```json
    {
      "phone": "01706640864",
      "session_id": "<session_id>",
      "results": [
        {
          "question_id": 105,
          "user_answer": "V",
          "is_correct": 1
        },
        {
          "question_id": 102,
          "user_answer": "V",
          "is_correct": 0
        }
      ]
    }
    ```

---

### 7. 📱 Client Registration & Status
- **Customer Registration**: `POST /api/v1/support/register`
  - **Body**:
    ```json
    {
      "first_name": "Nazmul",
      "last_name": "Hossain",
      "phone": "01706640864",
      "session_id": "<session_id>"
    }
    ```
- **Check Status / License**: `GET /api/v1/client/status`
  - **Query Params**: `?phone=01706640864&session_id=<session_id>`

---

### 8. 🚸 Cartelli (Road Signs) API
- `GET /api/v1/cartelli/categories`
- `GET /api/v1/cartelli/chapters/{categoryId?}`
- `GET /api/v1/cartelli/pages/{chapterId}`
- `GET /api/v1/cartelli/page-mcqs/{pageId}`
- `GET /api/v1/cartelli/chapter-mcqs/{chapterId}`

---

### 9. 📖 Dictionary & Translation
- **Dictionary Search**: `GET /api/v1/dictionary/search?q=autostrada`
- **Translate Text**: `POST /api/v1/translate` (Body: `{"text": "strada", "from_lang": "it", "to_lang": "bn"}`)
