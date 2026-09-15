# 📱 Drag & Drop Home Cards RESTful API Documentation

**File Name**: `Drag and Drop Restful Api.md`  
**API Version**: `v1`  
**Environment**: Local Development Mode (`http://127.0.0.1:8000/api/v1`, `http://localhost:8000/api/v1`, `http://192.168.0.102:8000/api/v1`)  
**Target Clients**: Mobile App (Flutter / Dart), Frontend Web Client, Admin Panel

---

## 🌐 1. Base URL & Standard Headers

- **Base URL (Local Dev)**: 
  - Emulator / Local: `http://127.0.0.1:8000/api/v1`
  - Android Emulator: `http://10.0.2.2:8000/api/v1`
  - Physical Device on WiFi: `http://192.168.0.102:8000/api/v1`
  - Alias root: `http://127.0.0.1:8000/api`

- **Standard Headers**:
  ```http
  Accept: application/json
  Content-Type: application/json
  Authorization: Bearer <sanctum_token> (Optional/Admin)
  ```

---

## 🎴 2. RESTful API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/home-cards` | Get all active home cards sorted by `order_index ASC` | No (Public) |
| `POST` | `/api/v1/home-cards/reorder` | Bulk reorder cards (Drag & Drop sync) | No / Admin |
| `POST` | `/api/v1/home-cards` | Create a new home card | Optional / Admin |
| `PUT` / `POST` | `/api/v1/home-cards/{id}` | Update an existing card | Optional / Admin |
| `POST` | `/api/v1/home-cards/toggle-status/{id}` | Toggle active / inactive status | Optional / Admin |
| `DELETE` / `POST`| `/api/v1/home-cards/{id}` | Delete a card | Optional / Admin |

---

## 📖 3. Detailed Endpoint Specifications

### 3.1 Get All Active Home Cards (For Mobile App & Web Homepage)

Fetches all active navigation cards ordered strictly by `order_index ASC`.

- **Endpoint**: `GET /api/v1/home-cards`  
- **Alternative Endpoints**: `GET /api/home-cards`, `GET /api/v1/dashboard/cards`, `GET /api/dashboard/cards`
- **Method**: `GET`
- **Headers**:
  ```http
  Accept: application/json
  ```
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
      },
      {
        "id": 3,
        "title": "ARGOMENTI",
        "subtitle": "অধ্যায়সমূহ",
        "description": "অধ্যায়ভিত্তিক কুইজ ও প্রস্তুতি",
        "screen_key": "argomenti",
        "icon_class": "fa-solid fa-graduation-cap",
        "icon_color": "#8B5CF6",
        "color": "#8B5CF6",
        "icon_url": "",
        "link": null,
        "order_index": 3,
        "status": 1,
        "created_at": "2026-09-15T05:00:00.000000Z",
        "updated_at": "2026-09-15T05:45:00.000000Z"
      }
    ]
  }
  ```

---

### 3.2 Reorder Cards via Drag & Drop (`/api/v1/home-cards/reorder`)

Updates the sequential `order_index` (1, 2, 3...) of all cards in bulk, invalidates cached view data, and returns the updated card list.

- **Endpoint**: `POST /api/v1/home-cards/reorder`
- **Method**: `POST`
- **Headers**:
  ```http
  Accept: application/json
  Content-Type: application/json
  ```

#### Request Payload Formats Supported:

##### Option A: Array of IDs in New Order (Recommended)
```json
{
  "orders": [3, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
}
```

##### Option B: Array of Objects with Custom `order_index`
```json
{
  "items": [
    { "id": 3, "order_index": 1 },
    { "id": 1, "order_index": 2 },
    { "id": 2, "order_index": 3 }
  ]
}
```

##### Option C: Raw Array of IDs
```json
[3, 1, 2, 4, 5, 6, 7]
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
        "id": 3,
        "title": "ARGOMENTI",
        "subtitle": "অধ্যায়সমূহ",
        "screen_key": "argomenti",
        "order_index": 1,
        "status": 1
      },
      {
        "id": 1,
        "title": "LEZIONI",
        "subtitle": "ক্লাস ভিডিও",
        "screen_key": "lezioni",
        "order_index": 2,
        "status": 1
      },
      {
        "id": 2,
        "title": "TEST",
        "subtitle": "অনুশীলন টেস্ট",
        "screen_key": "test",
        "order_index": 3,
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

### 3.3 Create New Home Card (`POST /api/v1/home-cards`)

- **Endpoint**: `POST /api/v1/home-cards`
- **Payload**:
  ```json
  {
    "title": "NEW FEATURE",
    "subtitle": "নতুন ফিচার",
    "description": "নতুন ফিচারের বিস্তারিত",
    "screen_key": "new-feature",
    "icon_class": "fa-solid fa-star",
    "color": "#10B981",
    "order_index": 18,
    "status": 1
  }
  ```
- **Response Status**: `200 OK`

---

### 3.4 Update Home Card (`PUT /api/v1/home-cards/{id}`)

- **Endpoint**: `PUT /api/v1/home-cards/1` or `POST /api/v1/home-cards/update/1`
- **Payload**:
  ```json
  {
    "title": "LEZIONI (UPDATED)",
    "subtitle": "ক্লাস ভিডিও লেকচার",
    "description": "ভিডিও ক্লাস লেকচার",
    "screen_key": "lezioni",
    "icon_class": "fa-solid fa-video",
    "color": "#3B82F6",
    "order_index": 1
  }
  ```
- **Response Status**: `200 OK`

---

### 3.5 Toggle Card Status (`POST /api/v1/home-cards/toggle-status/{id}`)

- **Endpoint**: `POST /api/v1/home-cards/toggle-status/1`
- **Response Status**: `200 OK`

---

### 3.6 Delete Card (`DELETE /api/v1/home-cards/{id}`)

- **Endpoint**: `DELETE /api/v1/home-cards/1` or `POST /api/v1/home-cards/delete/1`
- **Response Status**: `200 OK`
  ```json
  {
    "success": true
  }
  ```

---

## 📱 4. Flutter (Dart) Mobile App Implementation

### 4.1 HomeCard Dart Model (`lib/models/home_card_model.dart`)

```dart
class HomeCardModel {
  final int id;
  final String title;
  final String? subtitle;
  final String? description;
  final String screenKey;
  final String? link;
  final String iconClass;
  final String color;
  final String? iconUrl;
  final int orderIndex;
  final bool isActive;

  HomeCardModel({
    required this.id,
    required this.title,
    this.subtitle,
    this.description,
    required this.screenKey,
    this.link,
    this.iconClass = 'fa-solid fa-shapes',
    this.color = '#3B82F6',
    this.iconUrl,
    required this.orderIndex,
    required this.isActive,
  });

  factory HomeCardModel.fromJson(Map<String, dynamic> json) {
    return HomeCardModel(
      id: json['id'] is int ? json['id'] : int.tryParse('${json['id']}') ?? 0,
      title: json['title'] ?? '',
      subtitle: json['subtitle'],
      description: json['description'],
      screenKey: json['screen_key'] ?? '',
      link: json['link'],
      iconClass: json['icon_class'] ?? 'fa-solid fa-shapes',
      color: json['color'] ?? json['icon_color'] ?? '#3B82F6',
      iconUrl: json['icon_url'],
      orderIndex: json['order_index'] is int 
          ? json['order_index'] 
          : int.tryParse('${json['order_index']}') ?? 0,
      isActive: json['status'] == 1 || json['status'] == true || json['status'] == '1',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'subtitle': subtitle,
      'description': description,
      'screen_key': screenKey,
      'link': link,
      'icon_class': iconClass,
      'color': color,
      'icon_url': iconUrl,
      'order_index': orderIndex,
      'status': isActive ? 1 : 0,
    };
  }
}
```

---

### 4.2 Flutter API Service Methods (`lib/services/api_service.dart`)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/home_card_model.dart';

class ApiService {
  // Local Base URL (Adjust for Emulator or Physical Device)
  static const String baseUrl = 'http://127.0.0.1:8000/api/v1';
  // For Android Emulator use: 'http://10.0.2.2:8000/api/v1'
  // For Physical Device use: 'http://192.168.0.102:8000/api/v1'

  /// 1. Fetch All Active Home Cards (Sorted by order_index ASC)
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
      return cardsJson.map((item) => HomeCardModel.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load home cards: ${response.statusCode}');
    }
  }

  /// 2. Reorder Home Cards (Drag & Drop Reorder API)
  static Future<bool> reorderHomeCards(List<int> cardIds) async {
    final response = await http.post(
      Uri.parse('$baseUrl/home-cards/reorder'),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'orders': cardIds,
      }),
    );

    if (response.statusCode == 200) {
      final jsonBody = json.decode(response.body);
      return jsonBody['status'] == 'success';
    }
    return false;
  }
}
```

---

### 4.3 Flutter UI Example: Loading Cards on Dashboard

```dart
class DashboardHomeScreen extends StatefulWidget {
  const DashboardHomeScreen({Key? key}) : super(key: key);

  @override
  State<DashboardHomeScreen> createState() => _DashboardHomeScreenState();
}

class _DashboardHomeScreenState extends State<DashboardHomeScreen> {
  List<HomeCardModel> _cards = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCards();
  }

  Future<void> _loadCards() async {
    try {
      final cards = await ApiService.fetchHomeCards();
      setState(() {
        _cards = cards;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading cards: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: _loadCards,
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.1,
        ),
        itemCount: _cards.length,
        itemBuilder: (context, index) {
          final card = _cards[index];
          return Card(
            elevation: 3,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () {
                // Navigate based on screenKey
                // Navigator.pushNamed(context, '/${card.screenKey}');
              },
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    card.title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  if (card.subtitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      card.subtitle!,
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
```

---

## 💻 5. cURL Test Commands (Local Mode)

### 5.1 Fetch Home Cards
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/home-cards" \
     -H "Accept: application/json"
```

### 5.2 Reorder Home Cards (Drag & Drop Payload)
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/home-cards/reorder" \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{"orders": [5, 2, 8, 1, 3, 4, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17]}'
```

---

## 🔒 6. Summary of Key Guarantees

1. **Strict Ordering**: Every query applies `ORDER BY order_index ASC, id ASC`.
2. **Atomic DB Transactions**: Drag & Drop reorder requests update all card indexes within a single database transaction.
3. **Instant Website & App Synchronization**: Reordering cards immediately invalidates Laravel cache (`frontend_cached_view_data` & `home_cards_list`), ensuring that the mobile app and website homepage instantly reflect the exact new order.
