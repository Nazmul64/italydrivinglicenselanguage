<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Profile & Chat - {{ $customer->first_name }} {{ $customer->last_name }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .card { border-radius: 12px; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .chat-box { height: 400px; overflow-y: auto; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .msg-bubble { max-width: 75%; padding: 10px 14px; border-radius: 12px; margin-bottom: 10px; }
        .msg-user { background: #e0f2fe; color: #0369a1; margin-right: auto; }
        .msg-admin { background: #dcfce7; color: #15803d; margin-left: auto; text-align: right; }
        .msg-card { background: #fff3cd; color: #856404; border: 1px solid #ffeeba; }
    </style>
</head>
<body>
<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>👤 Customer Detail & Support Chat</h2>
        <a href="{{ route('admin.customers.index') }}" class="btn btn-outline-secondary">← Back to Customers List</a>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="row">
        <!-- Customer Info & License Column -->
        <div class="col-md-5">
            <div class="card p-3 mb-4">
                <h5 class="card-title text-primary border-bottom pb-2">📋 Customer Information</h5>
                <p class="mb-1"><strong>First Name:</strong> {{ $customer->first_name ?: $customer->name }}</p>
                <p class="mb-1"><strong>Last Name:</strong> {{ $customer->last_name }}</p>
                <p class="mb-1"><strong>Phone Number:</strong> <code>{{ $customer->phone }}</code></p>
                <p class="mb-1"><strong>Unique User ID:</strong></p>
                <input type="text" class="form-control form-control-sm mb-2" readonly value="{{ $customer->uuid }}">
                <p class="mb-1"><strong>Created At:</strong> {{ $customer->created_at ? $customer->created_at->format('Y-m-d H:i') : 'N/A' }}</p>
            </div>

            <div class="card p-3 mb-4">
                <h5 class="card-title text-success border-bottom pb-2">🔑 License Management</h5>
                
                @if($customer->licenses->count() > 0)
                    <div class="mb-3">
                        @foreach($customer->licenses as $lic)
                            <div class="p-2 border rounded mb-2 bg-light">
                                <div><strong>Key:</strong> <code>{{ $lic->license_key }}</code></div>
                                <div><strong>Status:</strong> <span class="badge bg-info text-dark text-uppercase">{{ $lic->status }}</span></div>
                                @if($lic->activated_at)
                                    <div><small class="text-muted">Activated: {{ $lic->activated_at->format('Y-m-d H:i') }}</small></div>
                                @endif
                                <form method="POST" action="{{ route('admin.licenses.updateStatus', $lic->id) }}" class="d-flex gap-2 mt-2">
                                    @csrf
                                    <select name="status" class="form-select form-select-sm">
                                        <option value="inactive" {{ $lic->status == 'inactive' ? 'selected' : '' }}>Inactive</option>
                                        <option value="pending" {{ $lic->status == 'pending' ? 'selected' : '' }}>Pending</option>
                                        <option value="active" {{ $lic->status == 'active' ? 'selected' : '' }}>Active</option>
                                        <option value="expired" {{ $lic->status == 'expired' ? 'selected' : '' }}>Expired</option>
                                        <option value="revoked" {{ $lic->status == 'revoked' ? 'selected' : '' }}>Revoked</option>
                                    </select>
                                    <button type="submit" class="btn btn-sm btn-outline-success">Update</button>
                                </form>
                            </div>
                        @endforeach
                    </div>
                @else
                    <p class="text-muted">No license assigned yet.</p>
                @endif

                <h6 class="mt-3">Assign New License Key</h6>
                <form method="POST" action="{{ route('admin.customers.assignLicense', $customer->uuid) }}">
                    @csrf
                    <div class="mb-2">
                        <input type="text" name="license_key" class="form-control" placeholder="Leave empty for auto-generated key">
                    </div>
                    <button type="submit" class="btn btn-success w-100">🔑 Assign License & Send Activation Card</button>
                </form>
            </div>
        </div>

        <!-- Chat Column -->
        <div class="col-md-7">
            <div class="card p-3">
                <h5 class="card-title text-dark border-bottom pb-2">💬 Live Support Chat History</h5>
                <div class="chat-box d-flex flex-column" id="chatBox">
                    @forelse($messages as $msg)
                        @if($msg->is_license_card)
                            <div class="msg-bubble msg-card align-self-center w-100 text-center shadow-sm">
                                <strong>🔑 License Key Available</strong><br>
                                {{ $msg->message }}<br>
                                <small class="text-muted">{{ $msg->created_at ? $msg->created_at->format('H:i, M d') : '' }}</small>
                            </div>
                        @elseif($msg->sender === 'user' || $msg->sender_type === 'user')
                            <div class="msg-bubble msg-user align-self-start">
                                <strong>{{ $msg->sender_name ?: 'Customer' }}:</strong><br>
                                {{ $msg->message }}<br>
                                <small class="text-muted" style="font-size:0.75rem;">{{ $msg->created_at ? $msg->created_at->format('H:i') : '' }}</small>
                            </div>
                        @else
                            <div class="msg-bubble msg-admin align-self-end">
                                <strong>{{ $msg->sender_name ?: 'Admin' }}:</strong><br>
                                {{ $msg->message }}<br>
                                <small class="text-muted" style="font-size:0.75rem;">{{ $msg->created_at ? $msg->created_at->format('H:i') : '' }}</small>
                            </div>
                        @endif
                    @empty
                        <p class="text-center text-muted my-auto">No chat history found.</p>
                    @endforelse
                </div>

                <form method="POST" action="{{ route('admin.customers.sendMessage', $customer->uuid) }}" class="mt-3">
                    @csrf
                    <div class="input-group">
                        <input type="text" name="message" class="form-control" placeholder="Type reply to customer..." required>
                        <button type="submit" class="btn btn-primary">Send Message 🚀</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<script>
    var chatBox = document.getElementById('chatBox');
    if (chatBox) { chatBox.scrollTop = chatBox.scrollHeight; }
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
