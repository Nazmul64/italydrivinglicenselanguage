# 🖱️ Drag and Drop Home Navigation Cards System & RESTful API

**Document Version**: 1.0.0  
**Environment**: Local Development Mode (`http://127.0.0.1:8000`, `http://localhost:8000`, `http://192.168.0.102:8000`)  
**Target Clients**: Admin Panel Web, Frontend Website, Mobile App (Flutter)

---

## 📌 1. Overview

This system provides a full **Drag & Drop** reordering interface in the Admin Panel for homepage service navigation cards (`HomeCard`), with real-time database synchronization and automatic cache invalidation. 

Reordering cards in the Admin Panel immediately updates:
1. **The Website Homepage** (`resources/views/frontend/screens/home.blade.php`)
2. **The Mobile App (Flutter)** via the RESTful API endpoints (`/api/v1/home-cards` / `/api/v1/dashboard/cards`)

---

## 🌐 2. Base URL & Standard Headers

- **Local Base URL**: `http://127.0.0.1:8000/api/v1` (or `http://localhost:8000/api/v1`)
- **Standard Headers**:
  ```http
  Accept: application/json
  Content-Type: application/json
  Authorization: Bearer <sanctum_token> (Optional/Admin)
  ```

---

## 🎴 3. RESTful API Endpoints

### 3.1 Get All Active Home Cards (Sorted by `order_index ASC`)

Returns all active navigation cards in the exact order configured in the Admin Panel.

- **Endpoints**:
  - `GET /api/v1/home-cards`
  - `GET /api/home-cards`
  - `GET /api/v1/dashboard/cards`
  - `GET /api/dashboard/cards`

- **Response Status**: `200 OK`
- **Response JSON**:
  ```json
  {
    "status": "success",
    "total": 17,
    "data": [
      {
        "id": 1,
        "title": "LEZIONI",
        "subtitle": "ক্লাস ভিডিও",
        "description": "ভিডিও ক্লাস লেকচার",
        "screen_key": "lezioni",
        "icon_class": "fa-solid fa-video",
        "icon_color": "#3B82F6",
        "color": "#3B82F6",
        "icon_url": "",
        "link": null,
        "order_index": 1,
        "status": 1,
        "created_at": "2026-09-15T05:00:00.000000Z",
        "updated_at": "2026-09-15T05:45:00.000000Z"
      },
      {
        "id": 2,
        "title": "TEST",
        "subtitle": "অনুশীলন টেস্ট",
        "description": "প্র্যাকটিস টেস্ট",
        "screen_key": "test",
        "icon_class": "fa-solid fa-laptop-code",
        "icon_color": "#475569",
        "color": "#475569",
        "icon_url": "",
        "link": null,
        "order_index": 2,
        "status": 1,
        "created_at": "2026-09-15T05:00:00.000000Z",
        "updated_at": "2026-09-15T05:45:00.000000Z"
      }
    ]
  }
  ```

---

### 3.2 Reorder Home Cards (Drag & Drop Reordering API)

Updates the sequential `order_index` (1, 2, 3...) of all cards in bulk, invalidates cached view data, and returns the updated card list.

- **Endpoints**:
  - `POST /api/v1/home-cards/reorder`
  - `POST /api/home-cards/reorder`
  - `POST /admin/api/home-cards/reorder`
  - `POST /api/v1/dashboard/cards/reorder`

#### Request Payload Formats Supported:

##### Option A: Array of IDs in New Order (Recommended)
```json
{
  "orders": [5, 2, 8, 1, 3, 4, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17]
}
```

##### Option B: Array of Card Objects with Specific `order_index`
```json
{
  "items": [
    { "id": 5, "order_index": 1 },
    { "id": 2, "order_index": 2 },
    { "id": 8, "order_index": 3 },
    { "id": 1, "order_index": 4 }
  ]
}
```

##### Option C: Raw Array of IDs
```json
[5, 2, 8, 1, 3, 4, 6, 7]
```

- **Response Status**: `200 OK`
- **Response JSON**:
  ```json
  {
    "status": "success",
    "message": "Home cards reordered successfully",
    "total": 17,
    "data": [
      {
        "id": 5,
        "title": "SFIDA",
        "subtitle": "চ্যালেঞ্জ",
        "screen_key": "sfida",
        "order_index": 1,
        "status": 1
      },
      {
        "id": 2,
        "title": "TEST",
        "subtitle": "অনুশীলন টেস্ট",
        "screen_key": "test",
        "order_index": 2,
        "status": 1
      }
    ]
  }
  ```

- **Error Response (`422 Unprocessable Entity`)**:
  ```json
  {
    "status": "error",
    "message": "Invalid order data provided. Please provide an array of card IDs (orders) or items with order_index."
  }
  ```

---

## 🎨 4. Admin Panel Drag & Drop Mechanics

### 4.1 UI Features
1. **Grip Handle Column**: Dedicated `<i class="fa-solid fa-grip-vertical"></i>` handle on every row for intuitive mouse drag.
2. **Visual Insertion Indicators**: Blue insertion bar (`drag-over-top` / `drag-over-bottom`) shows the exact target drop position.
3. **Ghost / Dragging State**: Active dragging row becomes translucent (`opacity: 0.45`, blue highlight).
4. **Real-time Order Badge Update**: Badge `<span class="order-index-badge">` immediately reflects the new sequential position (1, 2, 3...) upon dropping.
5. **Auto-saving Indicator**: Displays `<i class="fa-solid fa-spinner fa-spin"></i> সেভ হচ্ছে...` while persisting to backend.
6. **Live Step Arrows**: Up and Down arrows (`fa-arrow-up`, `fa-arrow-down`) for quick one-click step swaps.
7. **Cache Busting**: Automatically invalidates `frontend_cached_view_data` and `home_cards_list` so changes appear instantly without clearing browser storage.

### 4.2 Admin Panel JavaScript Workflow
```javascript
// Triggered on Drop or Arrow Move
function persistHomeCardsOrder() {
    const tbody = document.getElementById('home-cards-table-body');
    const rows = Array.from(tbody.querySelectorAll('tr[data-id]'));
    
    const cardIds = rows.map((row, idx) => {
        const id = parseInt(row.getAttribute('data-id'));
        const badge = row.querySelector('.order-index-badge');
        if (badge) badge.textContent = idx + 1;
        return id;
    }).filter(Boolean);

    fetch('/admin/api/home-cards/reorder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ orders: cardIds })
    })
    .then(res => res.json())
    .then(res => {
        showToast('হোম কার্ডের অবস্থান সফলভাবে পরিবর্তন করা হয়েছে');
    });
}
```

---

## 📱 5. Mobile App (Flutter / Dart) Integration

### 5.1 Fetching Reordered Home Cards
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class HomeCardService {
  static const String baseUrl = 'http://127.0.0.1:8000/api/v1';

  static Future<List<HomeCardModel>> fetchHomeCards() async {
    final response = await http.get(
      Uri.parse('$baseUrl/home-cards'),
      headers: {
        'Accept': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final jsonBody = json.decode(response.body);
      final List cardsJson = jsonBody['data'] ?? [];
      return cardsJson.map((e) => HomeCardModel.fromJson(e)).toList();
    } else {
      throw Exception('Failed to load home cards');
    }
  }
}
```

### 5.2 HomeCard Dart Model
```dart
class HomeCardModel {
  final int id;
  final String title;
  final String? subtitle;
  final String? description;
  final String screenKey;
  final String? iconClass;
  final String? iconUrl;
  final String? color;
  final int orderIndex;
  final bool isActive;

  HomeCardModel({
    required this.id,
    required this.title,
    this.subtitle,
    this.description,
    required this.screenKey,
    this.iconClass,
    this.iconUrl,
    this.color,
    required this.orderIndex,
    required this.isActive,
  });

  factory HomeCardModel.fromJson(Map<String, dynamic> json) {
    return HomeCardModel(
      id: json['id'],
      title: json['title'] ?? '',
      subtitle: json['subtitle'],
      description: json['description'],
      screenKey: json['screen_key'] ?? '',
      iconClass: json['icon_class'],
      iconUrl: json['icon_url'],
      color: json['color'] ?? json['icon_color'] ?? '#3B82F6',
      orderIndex: json['order_index'] ?? 0,
      isActive: json['status'] == 1 || json['status'] == true,
    );
  }
}
```

---

## 💻 6. cURL Verification Examples

### 6.1 Reorder Cards via cURL (Local)
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/home-cards/reorder" \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{"orders": [7, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]}'
```

### 6.2 Fetch Cards via cURL (Local)
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/home-cards" \
     -H "Accept: application/json"
```

---

## 🗄️ 7. Database Schema Reference

Table: `home_cards`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | Primary Key |
| `title` | `VARCHAR(255)` | Card display title (e.g. `LEZIONI`, `TEST`) |
| `subtitle` | `VARCHAR(255)` | Bengali subtitle (e.g. `ক্লাস ভিডিও`, `অনুশীলন টেস্ট`) |
| `description` | `TEXT` | Detailed card description |
| `screen_key` | `VARCHAR(255)` | Frontend & App router key (e.g. `lezioni`, `test`, `argomenti`) |
| `icon_class` | `VARCHAR(255)` | FontAwesome 6 icon class (e.g. `fa-solid fa-video`) |
| `icon_url` | `VARCHAR(255)` | Custom uploaded icon image URL |
| `color` | `VARCHAR(7)` | Primary accent HEX color (e.g. `#3B82F6`) |
| `order_index` | `INT` | Reorder sorting sequence (**Drag & Drop Order**) |
| `status` | `TINYINT(1)` / `BOOLEAN` | Active (`1`) or Inactive (`0`) |
| `created_at` | `TIMESTAMP` | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | Record update timestamp |
