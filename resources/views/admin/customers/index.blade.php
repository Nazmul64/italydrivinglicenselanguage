<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer & License Management - mBanglaPatenteB</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .card { border-radius: 12px; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .table th { background: #1e293b; color: #fff; }
        .badge-active { background-color: #10b981; }
        .badge-inactive { background-color: #6b7280; }
        .badge-pending { background-color: #f59e0b; }
        .badge-revoked { background-color: #ef4444; }
    </style>
</head>
<body>
<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>👥 Customer & License Management</h2>
        <a href="/" class="btn btn-outline-secondary">Back to Dashboard</a>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="card p-3 mb-4">
        <form method="GET" action="{{ route('admin.customers.index') }}" class="row g-2">
            <div class="col-md-10">
                <input type="text" name="search" class="form-control" placeholder="Search by Phone, Name, Unique User ID, or License Key..." value="{{ request('search') }}">
            </div>
            <div class="col-md-2">
                <button type="submit" class="btn btn-primary w-100">🔍 Search</button>
            </div>
        </form>
    </div>

    <div class="card">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Phone Number</th>
                            <th>Unique User ID</th>
                            <th>License Status</th>
                            <th>Last Message</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($customers as $customer)
                            @php
                                $status = $customer->license ? $customer->license->status : 'inactive';
                                $badgeClass = match($status) {
                                    'active' => 'badge-active',
                                    'pending' => 'badge-pending',
                                    'revoked', 'expired' => 'badge-revoked',
                                    default => 'badge-inactive',
                                };
                            @endphp
                            <tr>
                                <td><strong>{{ $customer->first_name ?: $customer->name }}</strong></td>
                                <td>{{ $customer->last_name }}</td>
                                <td><code>{{ $customer->phone ?: 'N/A' }}</code></td>
                                <td><small class="text-muted" style="font-family: monospace;">{{ $customer->uuid }}</small></td>
                                <td><span class="badge {{ $badgeClass }} text-uppercase">{{ $status }}</span></td>
                                <td>
                                    <small class="text-truncate d-inline-block" style="max-width: 180px;">
                                        {{ optional(optional($customer->conversation)->latestMessage)->message ?: 'No messages yet' }}
                                    </small>
                                </td>
                                <td>
                                    <a href="{{ route('admin.customers.show', $customer->uuid) }}" class="btn btn-sm btn-primary">
                                        💬 Support & License
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-4 text-muted">No customers found.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        <div class="card-footer">
            {{ $customers->links() }}
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
