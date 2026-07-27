// ==========================================
// mbanglapatenteb (Community Feed) Module
// ==========================================

let socialPostsData = [];
let selectedSocialPhotoFile = null;

function getSocialUserIdentity() {
    let name = localStorage.getItem('user_profile_name') || sessionUserProfileName() || 'ব্যবহারকারী';
    let phone = localStorage.getItem('user_profile_phone') || sessionUserProfilePhone() || '';
    let avatar = localStorage.getItem('user_profile_avatar') || sessionUserProfileAvatar() || '';

    if (!avatar || avatar.startsWith('data:') || avatar.length > 500) {
        avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366F1&color=fff`;
    }

    return { name, phone, avatar };
}

function sessionUserProfileName() {
    const el = document.getElementById('profile-user-name');
    return el ? el.innerText.trim() : '';
}

function sessionUserProfilePhone() {
    const el = document.getElementById('profile-user-phone');
    return el ? el.innerText.trim() : '';
}

function sessionUserProfileAvatar() {
    const el = document.getElementById('profile-user-avatar');
    return el ? el.src : '';
}

function initSocialModule() {
    const user = getSocialUserIdentity();
    const nameEl = document.getElementById('social-my-name');
    const avatarEl = document.getElementById('social-my-avatar');
    if (nameEl) nameEl.innerText = user.name;
    if (avatarEl) avatarEl.src = user.avatar;

    fetchSocialFeed();
    fetchPatenteSocialCards();
    fetchPatenteSocialBanners();
}

function fetchPatenteSocialCards() {
    return fetch('/api/v1/patente-social/cards')
        .then(res => res.json())
        .then(resData => {
            return resData.data || [];
        })
        .catch(err => console.error('Error fetching social cards:', err));
}

function fetchPatenteSocialBanners() {
    return fetch('/api/v1/patente-social/banners')
        .then(res => res.json())
        .then(resData => {
            return resData.data || [];
        })
        .catch(err => console.error('Error fetching social banners:', err));
}

function fetchPatenteSocialSettings() {
    return fetch('/api/v1/patente-social/settings')
        .then(res => res.json())
        .then(resData => {
            return resData.data || null;
        })
        .catch(err => console.error('Error fetching social settings:', err));
}

function fetchSocialFeed() {
    const container = document.getElementById('social-feed-container');
    if (!container) return;

    const user = getSocialUserIdentity();
    const url = `/api/social/posts?user_phone=${encodeURIComponent(user.phone)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.data) {
                socialPostsData = data.data;
                renderSocialFeed(socialPostsData);
            } else {
                container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-secondary);">কোনো সোশ্যাল পোস্ট পাওয়া যায়নি</div>';
            }
        })
        .catch(err => {
            console.error('Error fetching social posts:', err);
            container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-secondary);">সোশ্যাল ফিড লোড করতে সমস্যা হয়েছে</div>';
        });
}

function renderSocialFeed(posts) {
    const container = document.getElementById('social-feed-container');
    if (!container) return;

    container.innerHTML = '';

    if (!posts || posts.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-secondary);">এখনো কোনো পোস্ট করা হয়নি। প্রথম পোস্টটি আপনিই করুন!</div>';
        return;
    }

    const currentUser = getSocialUserIdentity();

    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'content-card';
        postCard.style.cssText = 'padding: 16px; border-radius: 18px; background: var(--bg-card); border: 1px solid var(--border-card); box-shadow: 0 4px 12px rgba(0,0,0,0.04);';

        // Check if current user is author of this post
        const isOwner = currentUser.phone !== '' && post.author_phone === currentUser.phone;

        const ownerActionBtns = isOwner ? `
            <div style="display: flex; gap: 8px; align-items: center;">
                <button type="button" onclick="openSocialEditModal(${post.id})" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 13px; padding: 4px;" title="Edit Post">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" onclick="deleteSocialPost(${post.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 13px; padding: 4px;" title="Delete Post">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        ` : '';

        const imageHtml = post.image_path ? `
            <div style="width: 100%; max-height: 320px; border-radius: 12px; overflow: hidden; margin-bottom: 12px; background: #000;">
                <img src="${post.image_path}" style="width: 100%; height: 100%; object-fit: contain; display: block;" alt="Post Photo">
            </div>
        ` : '';

        const likeColor = post.is_liked ? '#ef4444' : 'var(--text-secondary)';
        const likeIcon = post.is_liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';

        // Render Comments HTML
        let commentsHtml = '';
        if (post.comments && post.comments.length > 0) {
            post.comments.forEach(c => {
                const cAvatar = c.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author_name)}&background=6366F1&color=fff`;
                commentsHtml += `
                    <div style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px; font-size: 13px;">
                        <img src="${cAvatar}" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover;">
                        <div style="background: var(--bg-page); border-radius: 12px; padding: 6px 12px; flex: 1; border: 1px solid var(--border-card);">
                            <div style="font-weight: 800; color: var(--text-primary); font-size: 12px;">${escapeHtml(c.author_name)}</div>
                            <div style="color: var(--text-primary); margin-top: 2px;">${escapeHtml(c.comment)}</div>
                        </div>
                    </div>
                `;
            });
        }

        postCard.innerHTML = `
            <!-- Post Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; gap: 10px; align-items: center;">
                    <img src="${post.author_avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1.5px solid #2563EB;">
                    <div>
                        <div style="font-weight: 800; font-size: 14px; color: var(--text-primary);">${escapeHtml(post.author_name)}</div>
                        <div style="font-size: 11px; color: var(--text-secondary);">${post.created_at_formatted}</div>
                    </div>
                </div>
                ${ownerActionBtns}
            </div>

            <!-- Post Content Text -->
            <div style="font-size: 14px; color: var(--text-primary); line-height: 1.6; margin-bottom: 10px; font-weight: 500;">
                ${escapeHtml(post.content)}
            </div>

            <!-- Post Photo Attachment -->
            ${imageHtml}

            <!-- Interaction Bar (Like, Comment, Share) -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-card); border-bottom: 1px solid var(--border-card); padding: 8px 4px; margin-bottom: 10px;">
                <button type="button" onclick="toggleSocialPostLike(${post.id})" style="background: none; border: none; color: ${likeColor}; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="${likeIcon}" style="font-size: 16px;"></i> <span id="like-count-${post.id}">${post.likes_count}</span> Likes
                </button>
                <button type="button" onclick="toggleSocialCommentBox(${post.id})" style="background: none; border: none; color: var(--text-secondary); font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-regular fa-comment" style="font-size: 16px;"></i> <span id="comment-count-${post.id}">${post.comments_count}</span> Comments
                </button>
                <button type="button" onclick="shareSocialPost(${post.id})" style="background: none; border: none; color: var(--text-secondary); font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-share" style="font-size: 16px;"></i> Share
                </button>
            </div>

            <!-- Comments Container -->
            <div id="comments-box-${post.id}" style="display: block;">
                <div id="comments-list-${post.id}">${commentsHtml}</div>

                <!-- Add Comment Input Row -->
                <div style="display: flex; gap: 8px; margin-top: 10px;">
                    <input type="text" id="comment-input-${post.id}" placeholder="কমেন্ট লিখুন..." style="flex: 1; border-radius: 18px; border: 1px solid var(--border-card); background: var(--bg-page); color: var(--text-primary); padding: 6px 14px; font-size: 13px; outline: none;" onkeypress="if(event.key==='Enter') submitSocialComment(${post.id})">
                    <button type="button" onclick="submitSocialComment(${post.id})" style="background: #2563EB; color: #fff; border: none; padding: 6px 14px; border-radius: 18px; font-size: 12px; font-weight: 700; cursor: pointer;">
                        কমেন্ট
                    </button>
                </div>
            </div>
        `;

        container.appendChild(postCard);
    });
}

function handleSocialPhotoSelect(input) {
    if (input.files && input.files[0]) {
        selectedSocialPhotoFile = input.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('social-photo-preview');
            const box = document.getElementById('social-photo-preview-box');
            if (preview && box) {
                preview.src = e.target.result;
                box.style.display = 'block';
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function clearSocialPhotoSelection() {
    selectedSocialPhotoFile = null;
    const input = document.getElementById('social-post-photo');
    if (input) input.value = '';
    const box = document.getElementById('social-photo-preview-box');
    if (box) box.style.display = 'none';
}

function submitSocialPost() {
    const contentInput = document.getElementById('social-post-input');
    const content = contentInput ? contentInput.value.trim() : '';

    if (!content && !selectedSocialPhotoFile) {
        if (typeof showToast === 'function') showToast('অনুগ্রহ করে কিছু লিখুন অথবা একটি ছবি সিলেক্ট করুন');
        return;
    }

    const user = getSocialUserIdentity();
    const formData = new FormData();
    formData.append('author_name', user.name);
    formData.append('author_phone', user.phone);
    formData.append('author_avatar', user.avatar);
    formData.append('content', content);

    if (selectedSocialPhotoFile) {
        formData.append('photo', selectedSocialPhotoFile);
    }

    fetch('/api/social/posts/store', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                if (typeof showToast === 'function') showToast(data.message || 'পোস্ট পাবলিশ হয়েছে!');
                if (contentInput) contentInput.value = '';
                clearSocialPhotoSelection();
                fetchSocialFeed();
            } else {
                if (typeof showToast === 'function') showToast(data.message || 'পোস্ট করতে ব্যর্থ হয়েছে');
            }
        })
        .catch(err => {
            console.error('Error submitting social post:', err);
            if (typeof showToast === 'function') showToast('পোস্ট পাবলিশ করতে সমস্যা হয়েছে');
        });
}

function toggleSocialPostLike(postId) {
    const user = getSocialUserIdentity();
    if (!user.phone) {
        // Fallback user identifier if no profile phone set
        user.phone = localStorage.getItem('guest_social_phone') || ('guest_' + Date.now());
        localStorage.setItem('guest_social_phone', user.phone);
    }

    const formData = new FormData();
    formData.append('user_phone', user.phone);

    fetch(`/api/social/posts/like/${postId}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                const countEl = document.getElementById(`like-count-${postId}`);
                if (countEl) countEl.innerText = data.likes_count;
                fetchSocialFeed();
            }
        })
        .catch(err => console.error('Error liking post:', err));
}

function toggleSocialCommentBox(postId) {
    const box = document.getElementById(`comments-box-${postId}`);
    if (box) {
        box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }
}

function submitSocialComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const commentText = input ? input.value.trim() : '';
    if (!commentText) return;

    const user = getSocialUserIdentity();
    const formData = new FormData();
    formData.append('post_id', postId);
    formData.append('author_name', user.name);
    formData.append('author_phone', user.phone);
    formData.append('author_avatar', user.avatar);
    formData.append('comment', commentText);

    fetch('/api/social/posts/comments/store', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                if (input) input.value = '';
                fetchSocialFeed();
            }
        })
        .catch(err => console.error('Error submitting comment:', err));
}

function openSocialEditModal(postId) {
    const post = socialPostsData.find(p => p.id === postId);
    if (!post) return;

    document.getElementById('social-edit-post-id').value = post.id;
    document.getElementById('social-edit-content').value = post.content || '';

    const photoBox = document.getElementById('social-edit-photo-container');
    const photoImg = document.getElementById('social-edit-photo-preview');
    if (post.image_path) {
        photoImg.src = post.image_path;
        photoBox.style.display = 'block';
    } else {
        photoBox.style.display = 'none';
    }

    const modal = document.getElementById('social-edit-modal');
    if (modal) modal.style.display = 'flex';
}

function closeSocialEditModal() {
    const modal = document.getElementById('social-edit-modal');
    if (modal) modal.style.display = 'none';
}

function saveSocialPostEdit() {
    const postId = document.getElementById('social-edit-post-id').value;
    const content = document.getElementById('social-edit-content').value;
    const user = getSocialUserIdentity();

    const formData = new FormData();
    formData.append('content', content);
    formData.append('author_phone', user.phone);

    fetch(`/api/social/posts/update/${postId}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                if (typeof showToast === 'function') showToast(data.message || 'পোস্ট আপডেট করা হয়েছে');
                closeSocialEditModal();
                fetchSocialFeed();
            } else {
                if (typeof showToast === 'function') showToast(data.message || 'পোস্ট এডিট করতে ব্যর্থ হয়েছে');
            }
        })
        .catch(err => {
            console.error('Error updating post:', err);
            if (typeof showToast === 'function') showToast('পোস্ট এডিট করতে সমস্যা হয়েছে');
        });
}

function deleteSocialPost(postId) {
    if (!confirm('আপনি কি নিশ্চিত যে এই পোস্টটি মুছে ফেলতে চান?')) return;

    const user = getSocialUserIdentity();
    const formData = new FormData();
    formData.append('author_phone', user.phone);

    fetch(`/api/social/posts/delete/${postId}`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                if (typeof showToast === 'function') showToast(data.message || 'পোস্ট ডিলিট করা হয়েছে');
                fetchSocialFeed();
            } else {
                if (typeof showToast === 'function') showToast(data.message || 'পোস্ট ডিলিট করতে ব্যর্থ হয়েছে');
            }
        })
        .catch(err => {
            console.error('Error deleting post:', err);
            if (typeof showToast === 'function') showToast('পোস্ট ডিলিট করতে সমস্যা হয়েছে');
        });
}

function shareSocialPost(postId) {
    const postUrl = window.location.origin + '#social-post-' + postId;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(postUrl).then(() => {
            if (typeof showToast === 'function') showToast('পোস্ট লিংক কপি করা হয়েছে!');
        });
    } else {
        if (typeof showToast === 'function') showToast('পোস্ট লিংক শেয়ার করা হয়েছে!');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Hook into openScreen for screen key 'social'
window.addEventListener('DOMContentLoaded', () => {
    // Also trigger initial load if open
    initSocialModule();
});
