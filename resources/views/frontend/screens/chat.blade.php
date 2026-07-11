<!-- 7. Floating Chat Widget Overlay -->
<div class="chat-widget-container" id="guest-chat-widget">
    <div class="chat-widget-header">
        <span>M Rahman (Online Support)</span>
        <button class="chat-widget-close" onclick="toggleGuestChat(false)"><i class="fa-solid fa-xmark"></i></button>
    </div>
    
    <!-- Verification Form Container -->
    <div class="chat-widget-verify-container" id="guest-chat-verify-form" style="display: none; padding: 20px; flex-direction: column; gap: 12px; justify-content: center; height: calc(100% - 50px); overflow-y: auto;">
        <div style="text-align: center; margin-bottom: 10px;">
            <i class="fa-solid fa-user-shield" style="font-size: 32px; color: var(--accent-green); margin-bottom: 8px;"></i>
            <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary);">ভেরিফিকেশন ফরম</h4>
            <p style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">অ্যাপ্লিকেশনটি সক্রিয় করতে আপনার নাম ও মোবাইল নাম্বার দিন</p>
        </div>
        <div class="form-group-chat">
            <input type="text" id="verify-first-name" class="chat-input-verify" placeholder="নাম (First Name)" required>
        </div>
        <div class="form-group-chat">
            <input type="text" id="verify-last-name" class="chat-input-verify" placeholder="পদবী (Last Name)" required>
        </div>
        <div class="form-group-chat">
            <input type="text" id="verify-phone" class="chat-input-verify" placeholder="মোবাইল নাম্বার" required>
        </div>
        <button type="button" class="chat-verify-submit-btn" onclick="submitClientVerification()">ভেরিফাই করুন</button>
    </div>

    <!-- Active Chat Messages area -->
    <div class="chat-widget-messages" id="guest-chat-messages" style="display: none;">
        <!-- Chat history loaded dynamically -->
    </div>
    
    <!-- Waiting Activation Message -->
    <div class="chat-widget-waiting-container" id="guest-chat-waiting-msg" style="display: none; padding: 20px; text-align: center; color: var(--text-secondary); font-size: 12px; height: calc(100% - 50px); flex-direction: column; justify-content: center; align-items: center; gap: 10px;">
        <i class="fa-solid fa-clock-rotate-left" style="font-size: 32px; color: var(--accent-orange); margin-bottom: 8px;"></i>
        <h4 style="font-weight: 800; color: var(--text-primary);">অ্যাক্টিভেশন পেন্ডিং</h4>
        <p>আপনার তথ্য পাঠানো হয়েছে। অ্যাডমিন কর্তৃক অ্যাকাউন্ট সক্রিয় করার জন্য অনুগ্রহ করে অপেক্ষা করুন।</p>
        <button type="button" class="chat-verify-submit-btn" onclick="showChatAfterVerification()" style="background-color: var(--accent-green); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-size: 12px; font-weight: bold; cursor: pointer; margin-top: 10px; width: auto; max-width: 150px; display: inline-flex; align-items: center; justify-content: center;">মেসেজ করুন</button>
    </div>

    <!-- Chat input area -->
    <div class="chat-widget-input-area" id="guest-chat-input-area" style="display: none; align-items: center; gap: 8px;">
        <button type="button" class="chat-widget-camera" onclick="triggerChatAttachment()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 16px; padding: 0 4px;"><i class="fa-solid fa-camera"></i></button>
        <input type="file" id="guest-chat-file" style="display: none;" accept="image/*" onchange="uploadChatAttachment(this)">
        <input type="text" id="guest-chat-input" placeholder="Type Something..." onkeydown="if(event.key === 'Enter') sendGuestChatMessage()" style="flex: 1;">
        <button class="chat-widget-send" onclick="sendGuestChatMessage()"><i class="fa-solid fa-paper-plane" style="font-size: 11px;"></i></button>
    </div>
</div>
