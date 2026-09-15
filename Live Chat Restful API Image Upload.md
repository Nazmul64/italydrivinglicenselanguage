# 💬 Live Chat Image & Screenshot Upload RESTful API Documentation

**File Name**: `Live Chat Restful API Image Upload.md`  
**API Version**: `v1`  
**Storage Directory**: `public/uploads/live_chat/`  
**Base URL (Local Dev)**: `http://127.0.0.1:8000/api/v1` (or `http://localhost:8000/api/v1`, `http://192.168.0.102:8000/api/v1`)  
**Target Clients**: Mobile App (Flutter / Dart), Web Client, Admin Panel

---

## 📌 1. Overview & Directory Architecture

In the Live Chat system, customers (both **Guest Users** without registration and **Registered Users**) can send messages along with screenshots / photos of questions, problem screens, or receipts.

All uploaded images and screenshots are automatically processed, compressed, and stored in:
```text
f:/mbanglabatentebmainsite/public/uploads/live_chat/
```
The public web URL is returned as:
```text
/uploads/live_chat/live_chat_1726381234_567.webp (or .jpg, .png)
```

---

## 🌐 2. Standard Base URL & Headers

- **Base URL**: `http://127.0.0.1:8000/api/v1` (or `http://localhost:8000/api/v1`)
- **Headers**:
  ```http
  Accept: application/json
  Authorization: Bearer <sanctum_token> (Optional/Logged in user)
  X-Session-ID: <session_id> (Optional for Guest)
  X-Client-Phone: <phone_number> (Optional for Guest)
  ```

---

## 🚀 3. RESTful API Endpoints

### 3.1 Direct Image Upload Endpoint (`POST /api/v1/chat/upload-image`)

Use this endpoint to upload an image/screenshot first and obtain the public `image_url`.

- **Endpoints**:
  - `POST /api/v1/chat/upload-image`
  - `POST /api/v1/support/upload-image`
  - `POST /api/chat/upload-image`
  - `POST /api/support/upload-image`

- **Content-Type**: `multipart/form-data`

- **Request Parameters (Form-Data)**:
  | Field Name | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `image` (or `file`, `screenshot`, `attachment`) | `File` | **Yes** | Image binary file (`jpg`, `jpeg`, `png`, `webp`, `gif`) |

- **Response (`200 OK`)**:
  ```json
  {
    "status": "success",
    "success": true,
    "message": "Image uploaded successfully.",
    "image_url": "/uploads/live_chat/live_chat_1726381234_567.webp",
    "attachment_path": "/uploads/live_chat/live_chat_1726381234_567.webp",
    "url": "http://127.0.0.1:8000/uploads/live_chat/live_chat_1726381234_567.webp"
  }
  ```

- **Error Response (`422 Unprocessable Entity`)**:
  ```json
  {
    "status": "error",
    "success": false,
    "message": "No image file uploaded or invalid format. Please upload JPG, PNG, WEBP, or GIF image."
  }
  ```

---

### 3.2 Send Chat Message with Image Attachment (`POST /api/v1/chat/messages`)

Sends a chat message with an optional text and/or image attachment. Works seamlessly for **Guests** and **Registered Users**.

- **Endpoints**:
  - `POST /api/v1/chat/messages`
  - `POST /api/v1/support/messages`
  - `POST /api/chat/messages`

- **Content-Type**: `multipart/form-data` or `application/json`

- **Request Parameters**:
  | Field Name | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `session_id` | `String` | **Yes** | Guest UUID or device session ID (e.g. `guest_uuid_12345`) |
  | `phone` | `String` | Optional | Customer phone number (e.g. `01706640864`) |
  | `first_name` | `String` | Optional | Customer first name |
  | `last_name` | `String` | Optional | Customer last name |
  | `message` | `String` | Optional* | Text message (*Optional if image is attached; defaults to `"ছবি পাঠানো হয়েছে"`) |
  | `image` / `file` | `File` | Optional | Multipart file attachment (Saved to `public/uploads/live_chat/`) |
  | `attachment_path` | `String` | Optional | URL or path from prior upload (e.g. `/uploads/live_chat/...`) |

- **Response (`200 OK`)**:
  ```json
  {
    "status": "success",
    "success": true,
    "data": {
      "id": 842,
      "conversation_id": 15,
      "session_id": "01706640864",
      "sender": "user",
      "sender_type": "user",
      "sender_id": "01706640864",
      "sender_name": "Nazmul Hossain",
      "message": "ছবি পাঠানো হয়েছে",
      "attachment_path": "/uploads/live_chat/live_chat_1726381234_567.webp",
      "created_at": "2026-09-15T06:10:00.000000Z",
      "updated_at": "2026-09-15T06:10:00.000000Z"
    }
  }
  ```

---

### 3.3 Fetch Chat Messages (`GET /api/v1/support/messages`)

- **Endpoint**: `GET /api/v1/support/messages?session_id={session_id}&phone={phone}`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 841,
        "session_id": "01706640864",
        "sender": "user",
        "sender_name": "Nazmul Hossain",
        "message": "হ্যালো! আমি অ্যাপ থেকে চ্যাটে যুক্ত হয়েছি",
        "attachment_path": null,
        "created_at": "2026-09-15T06:05:00.000000Z"
      },
      {
        "id": 842,
        "session_id": "01706640864",
        "sender": "user",
        "sender_name": "Nazmul Hossain",
        "message": "ছবি পাঠানো হয়েছে",
        "attachment_path": "/uploads/live_chat/live_chat_1726381234_567.webp",
        "created_at": "2026-09-15T06:10:00.000000Z"
      }
    ]
  }
  ```

---

## 📱 4. Flutter (Dart) Mobile App Implementation

### 4.1 Chat Service (`lib/services/live_chat_service.dart`)

```dart
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

class LiveChatService {
  static const String baseUrl = 'http://127.0.0.1:8000/api/v1';
  // For Android Emulator use: 'http://10.0.2.2:8000/api/v1'
  // For Physical Device on WiFi use: 'http://192.168.0.102:8000/api/v1'

  /// 1. Direct Image Upload to public/uploads/live_chat/
  static Future<String?> uploadChatImage(File imageFile) async {
    final uri = Uri.parse('$baseUrl/chat/upload-image');
    final request = http.MultipartRequest('POST', uri);

    request.headers.addAll({
      'Accept': 'application/json',
    });

    final extension = imageFile.path.split('.').last.toLowerCase();
    final mimeType = extension == 'png' ? 'image/png' : 'image/jpeg';

    request.files.add(
      await http.MultipartFile.fromPath(
        'image',
        imageFile.path,
        contentType: MediaType.parse(mimeType),
      ),
    );

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['image_url'] ?? data['attachment_path'];
    }
    return null;
  }

  /// 2. Send Message with Image (Direct Multipart)
  static Future<Map<String, dynamic>?> sendMessageWithImage({
    required String sessionId,
    String? phone,
    String? firstName,
    String? lastName,
    String? messageText,
    File? imageFile,
    String? attachmentPath,
  }) async {
    final uri = Uri.parse('$baseUrl/chat/messages');
    final request = http.MultipartRequest('POST', uri);

    request.headers.addAll({
      'Accept': 'application/json',
    });

    request.fields['session_id'] = sessionId;
    if (phone != null && phone.isNotEmpty) request.fields['phone'] = phone;
    if (firstName != null) request.fields['first_name'] = firstName;
    if (lastName != null) request.fields['last_name'] = lastName;
    
    // Set text or fallback to "ছবি পাঠানো হয়েছে"
    request.fields['message'] = (messageText != null && messageText.trim().isNotEmpty)
        ? messageText.trim()
        : (imageFile != null || attachmentPath != null ? 'ছবি পাঠানো হয়েছে' : '');

    if (attachmentPath != null) {
      request.fields['attachment_path'] = attachmentPath;
    }

    if (imageFile != null) {
      final ext = imageFile.path.split('.').last.toLowerCase();
      final mime = ext == 'png' ? 'image/png' : 'image/jpeg';
      request.files.add(
        await http.MultipartFile.fromPath(
          'image',
          imageFile.path,
          contentType: MediaType.parse(mime),
        ),
      );
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to send message: ${response.body}');
    }
  }
}
```

---

### 4.2 Flutter UI Image Bubble Widget

```dart
import 'package:flutter/material.dart';

class ChatMessageBubble extends StatelessWidget {
  final String? message;
  final String? attachmentPath;
  final bool isMe;
  final String baseUrl; // e.g. "http://127.0.0.1:8000"

  const ChatMessageBubble({
    Key? key,
    this.message,
    this.attachmentPath,
    required this.isMe,
    this.baseUrl = 'http://127.0.0.1:8000',
  }) : super(key: key);

  String get fullImageUrl {
    if (attachmentPath == null) return '';
    if (attachmentPath!.startsWith('http')) return attachmentPath!;
    final cleanPath = attachmentPath!.startsWith('/') ? attachmentPath! : '/$attachmentPath';
    return '$baseUrl$cleanPath';
  }

  @override
  Widget build(BuildContext context) {
    final hasImage = attachmentPath != null && attachmentPath!.isNotEmpty;
    final showText = message != null && 
                     message!.isNotEmpty && 
                     message != 'ছবি পাঠানো হয়েছে';

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 12),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isMe ? const Color(0xFF3B82F6) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 4, offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: isMe ? CrossEndAlignment : CrossAxisAlignment.start,
          children: [
            if (hasImage) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: GestureDetector(
                  onTap: () {
                    // Open full screen preview
                  },
                  child: Image.network(
                    fullImageUrl,
                    width: 220,
                    height: 180,
                    fit: BoxFit.cover,
                    errorBuilder: (ctx, err, stack) => Container(
                      width: 220,
                      height: 100,
                      color: Colors.grey.shade200,
                      child: const Center(child: Icon(Icons.broken_image, color: Colors.grey)),
                    ),
                  ),
                ),
              ),
              if (showText) const SizedBox(height: 6),
            ],
            if (showText || (!hasImage && message != null))
              Text(
                message!,
                style: TextStyle(
                  color: isMe ? Colors.white : Colors.black87,
                  fontSize: 14,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
```

---

## 💻 5. cURL Test Commands (Local Mode)

### 5.1 Direct Image Upload Test
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/chat/upload-image" \
     -H "Accept: application/json" \
     -F "image=@/path/to/screenshot.png"
```

### 5.2 Send Message With Multipart Image Attachment
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/chat/messages" \
     -H "Accept: application/json" \
     -F "session_id=01706640864" \
     -F "phone=01706640864" \
     -F "first_name=Nazmul" \
     -F "last_name=Hossain" \
     -F "message=ছবি পাঠানো হয়েছে" \
     -F "image=@/path/to/screenshot.png"
```

---

## 🛡️ 6. Guarantees & Safeguards

1. **Auto Folder Creation**: `public/uploads/live_chat/` is automatically created with `0755` permissions if not present.
2. **WebP Optimization**: Images are automatically resized and compressed to WebP (with fallback to JPEG/PNG) via `ImageHelper`.
3. **Multiple Field Name Support**: Accepts `image`, `file`, `screenshot`, or `attachment`.
4. **Base64 String Support**: Automatically parses base64 data URIs (`data:image/png;base64,...`) into physical files in `public/uploads/live_chat/`.
5. **No Broken Images**: Admin Panel Chat Room and Web Chat sanitize all paths and display clean images with full-size click preview.
