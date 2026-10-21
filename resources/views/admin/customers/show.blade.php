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
                
                @if($customer->is_uninstalled)
                    <div class="alert alert-danger py-2 px-3 mb-3 small">
                        <strong>⚠️ অ্যাপ আনইনস্টল শনাক্ত হয়েছে!</strong><br>
                        এই গ্রাহক অ্যাপটি আনইনস্টল বা পুনরায় ইনস্টল করায় অ্যাকাউন্টটি লক রয়েছে। পুনরায় চালু করতে নিচে ক্লিক করুন:
                    </div>
                @endif

                <form method="POST" action="{{ route('admin.customers.quickActivate', $customer->uuid) }}" class="mb-3">
                    @csrf
                    <button type="submit" class="btn btn-success w-100 fw-bold shadow-sm">
                        ⚡ এক ক্লিকে সক্রিয় করুন ও চ্যাটে কার্ড পাঠান
                    </button>
                </form>
                @if($customer->licenses->count() > 0)
                    <div class="mb-3">
                        @foreach($customer->licenses as $lic)
                            @php
                                $isLicExpired = $lic->expires_at && now()->gt($lic->expires_at);
                                $statusClass = match($lic->status) {
                                    'active' => ($isLicExpired ? 'bg-danger text-white' : 'bg-success text-white'),
                                    'expired' => 'bg-danger text-white',
                                    'pending' => 'bg-warning text-dark',
                                    'inactive' => 'bg-secondary text-white',
                                    default => 'bg-info text-dark',
                                };
                                $displayStatus = ($lic->status === 'active' && $isLicExpired) ? 'EXPIRED' : strtoupper($lic->status);
                            @endphp
                            <div class="p-3 border rounded mb-3 bg-light shadow-sm">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <span class="fs-5"><strong>Key:</strong> <code>{{ $lic->license_key }}</code></span>
                                    <span class="badge {{ $statusClass }} px-2 py-1">{{ $displayStatus }}</span>
                                </div>
                                <div class="small text-muted mb-1">
                                    @if($lic->duration_seconds)
                                        @php
                                            $secs = $lic->duration_seconds;
                                            $durText = $secs < 60 ? "{$secs} Seconds" : ($secs < 3600 ? round($secs/60) . " Minutes" : ($secs < 86400 ? round($secs/3600) . " Hours" : round($secs/86400) . " Days"));
                                        @endphp
                                        <strong>Duration:</strong> {{ $durText }} |
                                    @endif
                                    @if($lic->activated_at)
                                        <strong>Activated:</strong> {{ $lic->activated_at->format('Y-m-d H:i:s') }}
                                    @else
                                        <em>Not yet activated</em>
                                    @endif
                                </div>
                                @if($lic->expires_at)
                                    <div class="small mb-2">
                                        <strong>Expires At:</strong> <code>{{ $lic->expires_at->format('Y-m-d H:i:s') }}</code>
                                        @if($isLicExpired)
                                            <span class="badge bg-danger ms-1">Expired {{ $lic->expires_at->diffForHumans() }}</span>
                                        @else
                                            <span class="badge bg-success ms-1">Valid (Expires {{ $lic->expires_at->diffForHumans() }})</span>
                                        @endif
                                    </div>
                                @endif

                                <form method="POST" action="{{ route('admin.licenses.updateStatus', $lic->id) }}" class="mt-2 pt-2 border-top">
                                    @csrf
                                    <div class="row g-2 align-items-center">
                                        <div class="col-4">
                                            <label class="form-label small fw-bold mb-0">Status</label>
                                            <select name="status" class="form-select form-select-sm" onchange="toggleDurationUpdate(this, '{{ $lic->id }}')">
                                                <option value="inactive" {{ $lic->status == 'inactive' ? 'selected' : '' }}>Inactive</option>
                                                <option value="pending" {{ $lic->status == 'pending' ? 'selected' : '' }}>Pending</option>
                                                <option value="active" {{ ($lic->status == 'active' && !$isLicExpired) ? 'selected' : '' }}>Active</option>
                                                <option value="expired" {{ ($lic->status == 'expired' || $isLicExpired) ? 'selected' : '' }}>Expired</option>
                                                <option value="revoked" {{ $lic->status == 'revoked' ? 'selected' : '' }}>Revoked</option>
                                            </select>
                                        </div>
                                        <div class="col-5">
                                            <label class="form-label small fw-bold mb-0">Extend / Duration</label>
                                            <select name="duration_preset" class="form-select form-select-sm" id="preset_{{ $lic->id }}" onchange="handlePresetChange(this, '{{ $lic->id }}')">
                                                <option value="60">⏱️ 1 Minute (Test)</option>
                                                <option value="300">5 Minutes</option>
                                                <option value="3600">1 Hour</option>
                                                <option value="86400">1 Day</option>
                                                <option value="604800">7 Days</option>
                                                <option value="2592000">30 Days</option>
                                                <option value="31536000" selected>365 Days (1 Yr)</option>
                                                <option value="custom">Custom...</option>
                                            </select>
                                        </div>
                                        <div class="col-3 d-flex align-items-end">
                                            <button type="submit" class="btn btn-sm btn-primary w-100 mt-3">Update</button>
                                        </div>
                                    </div>
                                    <div id="custom_inputs_{{ $lic->id }}" class="row g-2 mt-1" style="display: none;">
                                        <div class="col-6">
                                            <input type="number" name="custom_duration_value" class="form-control form-control-sm" placeholder="Value" min="1" value="1">
                                        </div>
                                        <div class="col-6">
                                            <select name="custom_duration_unit" class="form-select form-select-sm">
                                                <option value="seconds">Seconds</option>
                                                <option value="minutes" selected>Minutes</option>
                                                <option value="hours">Hours</option>
                                                <option value="days">Days</option>
                                            </select>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        @endforeach
                    </div>
                @else
                    <p class="text-muted">No license assigned yet.</p>
                @endif

                <h6 class="mt-3 border-top pt-3">Assign New License Key</h6>
                <form method="POST" action="{{ route('admin.customers.assignLicense', $customer->uuid) }}">
                    @csrf
                    <div class="mb-2">
                        <label class="form-label small fw-bold mb-1">License Key (Optional)</label>
                        <input type="text" name="license_key" class="form-control form-control-sm" placeholder="Leave blank to auto-generate">
                    </div>
                    <div class="row g-2 mb-2">
                        <div class="col-6">
                            <label class="form-label small fw-bold mb-1">Initial Status</label>
                            <select name="status" class="form-select form-select-sm">
                                <option value="pending" selected>Pending (User Activates)</option>
                                <option value="active">Active Immediately</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label class="form-label small fw-bold mb-1">Duration Validity</label>
                            <select name="duration_preset" class="form-select form-select-sm" id="new_lic_preset" onchange="handleNewPresetChange(this)">
                                <option value="60">⏱️ 1 Minute (Test)</option>
                                <option value="300">5 Minutes</option>
                                <option value="3600">1 Hour</option>
                                <option value="86400">1 Day</option>
                                <option value="604800">7 Days</option>
                                <option value="2592000">30 Days</option>
                                <option value="31536000" selected>365 Days (1 Year)</option>
                                <option value="custom">Custom...</option>
                            </select>
                        </div>
                    </div>
                    <div id="new_custom_inputs" class="row g-2 mb-2" style="display: none;">
                        <div class="col-6">
                            <input type="number" name="custom_duration_value" class="form-control form-control-sm" placeholder="Value (e.g. 1)" min="1" value="1">
                        </div>
                        <div class="col-6">
                            <select name="custom_duration_unit" class="form-select form-select-sm">
                                <option value="seconds">Seconds</option>
                                <option value="minutes" selected>Minutes</option>
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-success w-100">🔑 Assign License & Send Activation Card</button>
                </form>
            </div>

            <script>
                function handlePresetChange(selectEl, licId) {
                    var customDiv = document.getElementById('custom_inputs_' + licId);
                    if (customDiv) {
                        customDiv.style.display = selectEl.value === 'custom' ? 'flex' : 'none';
                    }
                }
                function handleNewPresetChange(selectEl) {
                    var customDiv = document.getElementById('new_custom_inputs');
                    if (customDiv) {
                        customDiv.style.display = selectEl.value === 'custom' ? 'flex' : 'none';
                    }
                }
                function toggleDurationUpdate(selectEl, licId) {
                    var presetEl = document.getElementById('preset_' + licId);
                    if (presetEl) {
                        presetEl.disabled = (selectEl.value === 'inactive' || selectEl.value === 'expired' || selectEl.value === 'revoked');
                    }
                }
            </script>
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
