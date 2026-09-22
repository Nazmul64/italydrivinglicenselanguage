# 🚀 Italy Driving License Platform - RESTful API v1 Documentation

## 🌐 Base URL
- **Production Base URL**: `https://mbanglapatenteb.com/api/v1`
- **Root-level Alias Base URL**: `https://mbanglapatenteb.com/api`
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

---

## 🎴 1. Home Navigation Cards API (হোম সার্ভিসেস কার্ড / আইকন / ইমেজ / Lottie JSON)

Admin প্যানেল থেকে হোম পেজের কার্ডগুলোর নাম, আইকন, ছবি, Lottie অ্যানিমেশন JSON বা ক্রম পরিবর্তন করলে Flutter অ্যাপেও যেন স্বয়ংক্রিয়ভাবে রিয়েল-টাইমে আপডেট হয়ে যায়, তার জন্য এই RESTful API ব্যবহার করা হয়।

### 📡 Get Active Home Cards
- **Endpoint**: `GET /api/v1/home-cards` (or `GET /api/home-cards`)
- **Ordering**: Automatically sorted by `order_index` ASC.
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
      "media_type": "icon",
      "icon_class": "fa-solid fa-video",
      "icon_color": "#3B82F6",
      "color": "#3B82F6",
      "icon_url": null,
      "image_url": null,
      "lottie_url": null,
      "order_index": 1,
      "status": true
    },
    {
      "id": 2,
      "title": "Argomenti",
      "subtitle": "অধ্যায় ভিত্তিক কুইজ",
      "screen_key": "argomenti",
      "media_type": "image",
      "icon_class": "fa-solid fa-book-open",
      "icon_color": "#10B981",
      "color": "#10B981",
      "icon_url": "https://mbanglapatenteb.com/uploads/cards/argomenti.png",
      "image_url": "https://mbanglapatenteb.com/uploads/cards/argomenti.png",
      "lottie_url": null,
      "order_index": 2,
      "status": true
    },
    {
      "id": 3,
      "title": "Test",
      "subtitle": "অনুশীলন টেস্ট",
      "screen_key": "test",
      "media_type": "lottie",
      "icon_class": "fa-solid fa-laptop-code",
      "icon_color": "#3B82F6",
      "color": "#3B82F6",
      "icon_url": null,
      "image_url": null,
      "lottie_url": "https://mbanglapatenteb.com/uploads/cards/lottie/test_anim.json",
      "order_index": 3,
      "status": true
    }
  ]
}
```

### 📱 Flutter Integration Example (Dart)
```dart
class HomeCardModel {
  final int id;
  final String title;
  final String? subtitle;
  final String screenKey;
  final String mediaType; // 'icon' | 'image' | 'lottie'
  final String? iconClass;
  final String? iconColor;
  final String? imageUrl;
  final String? lottieUrl;
  final int orderIndex;

  HomeCardModel({
    required this.id,
    required this.title,
    this.subtitle,
    required this.screenKey,
    required this.mediaType,
    this.iconClass,
    this.iconColor,
    this.imageUrl,
    this.lottieUrl,
    required this.orderIndex,
  });

  factory HomeCardModel.fromJson(Map<String, dynamic> json) {
    return HomeCardModel(
      id: json['id'],
      title: json['title'] ?? '',
      subtitle: json['subtitle'],
      screenKey: json['screen_key'] ?? 'custom',
      mediaType: json['media_type'] ?? 'icon',
      iconClass: json['icon_class'],
      iconColor: json['icon_color'] ?? json['color'] ?? '#3B82F6',
      imageUrl: json['image_url'] ?? json['icon_url'],
      lottieUrl: json['lottie_url'],
      orderIndex: json['order_index'] ?? 0,
    );
  }
}

// Widget rendering logic
Widget buildCardMedia(HomeCardModel card) {
  if (card.mediaType == 'lottie' && card.lottieUrl != null && card.lottieUrl!.isNotEmpty) {
    return Lottie.network(card.lottieUrl!, width: 44, height: 44, fit: BoxFit.contain);
  } else if (card.mediaType == 'image' && card.imageUrl != null && card.imageUrl!.isNotEmpty) {
    return Image.network(card.imageUrl!, width: 44, height: 44, fit: BoxFit.contain);
  } else {
    return Icon(getIconFromClass(card.iconClass), color: hexToColor(card.iconColor));
  }
}
```

---

## 📚 2. Chapters & Pages with Progress Statistics (অধ্যায় ও প্রোগ্রেস ডাটা)

### 📖 Get All Chapters with User Progress
- **Endpoint**: `GET /api/v1/chapters` (or `GET /api/chapters`)
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

### 📄 Get Pages for a Chapter
- **Endpoint**: `GET /api/v1/chapters/{id}/pages` (or `GET /api/chapters/{id}/pages`)
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

### 📝 Get Page Details & Questions
- **Endpoint**: `GET /api/v1/pages/{id}` (or `GET /api/pages/{id}`)

---

## 📝 3. Noted MCQs (নোট করা প্রশ্ন)
- **Get Noted MCQs**: `GET /api/v1/noted-mcqs`
- **Save / Update Note**: `POST /api/v1/noted-mcqs/save`
  - **Body**: `{"question_id": 105, "type": "argomenti", "note_text": "Speed limit rule", "phone": "01706640864", "session_id": "<session_id>"}`
- **Delete Note**: `DELETE /api/v1/noted-mcqs/{id}` or `POST /api/v1/noted-mcqs/delete`

---

## 🔖 4. Saved / Bookmarked MCQs (সেভ করা প্রশ্ন)
- **Get Bookmarks**: `GET /api/v1/saved-mcqs`
- **Toggle Bookmark (Save/Unsave)**: `POST /api/v1/saved-mcqs/toggle`
  - **Body**: `{"question_id": 105, "type": "argomenti", "phone": "01706640864", "session_id": "<session_id>"}`

---

## ❌ 5. Wrong MCQs (ভুল উত্তরের প্রশ্ন)
- **Get Wrong MCQs**: `GET /api/v1/wrong-mcqs`
  - **Headers**: `X-Client-Phone: 01706640864`
  - **Query Params**: `?phone=01706640864&chapter_id=&page_id=&date=&search=`

---

## ✔ 6. Correct MCQs (সঠিক উত্তরের প্রশ্ন)
- **Get Correct MCQs**: `GET /api/v1/correct-mcqs`
  - **Headers**: `X-Client-Phone: 01706640864`
  - **Query Params**: `?phone=01706640864&chapter_id=&page_id=&date=&search=`

---

## 📊 7. Submit Quiz / MCQ Results (লগ রেজাল্ট)
- **Log MCQ Results**: `POST /api/v1/user-mcq-results/log` (or `POST /api/user-mcq-results`)
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

## 🚸 8. Cartelli (Road Signs) API
- `GET /api/v1/cartelli/categories`
- `GET /api/v1/cartelli/chapters/{categoryId?}`
- `GET /api/v1/cartelli/pages/{chapterId}`
- `GET /api/v1/cartelli/page-mcqs/{pageId}`
- `GET /api/v1/cartelli/chapter-mcqs/{chapterId}`

---

## 📖 9. Dictionary & Translation
- **Dictionary Search**: `GET /api/v1/dictionary/search?q=autostrada`
- **Translate Text**: `POST /api/v1/translate` (Body: `{"text": "strada", "from_lang": "it", "to_lang": "bn"}`)
