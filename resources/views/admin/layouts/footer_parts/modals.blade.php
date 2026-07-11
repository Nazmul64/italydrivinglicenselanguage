    <!-- Modals Layout -->
    <!-- 1. Add/Edit Question Modal -->
    <div class="modal-overlay" id="question-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title" id="question-modal-title">Add New Question</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeQuestionModal()"></i>
            </div>
            
            <form id="question-form" onsubmit="saveQuestion(event)">
                <input type="hidden" id="form-question-id">
                
                <div class="form-group">
                    <label class="form-label" for="form-chapter">Chapter Number</label>
                    <select class="form-control" id="form-chapter" required onchange="syncChapterName(this.value)">
                        <!-- Injected dynamically -->
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-chapter-name">Chapter Name</label>
                    <input type="text" class="form-control" id="form-chapter-name" readonly required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-page-id">Page / Subchapter</label>
                    <select class="form-control" id="form-page-id" required>
                        <option value="">Select Page...</option>
                        <!-- Injected dynamically based on chapter selection -->
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-italian">Italian Statement (Vero/Falso text)</label>
                    <textarea class="form-control" id="form-italian" rows="3" required></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-bangla">Bangla Meaning</label>
                    <textarea class="form-control" id="form-bangla" rows="3" required></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-is-vero">Correct Answer</label>
                    <select class="form-control" id="form-is-vero" required>
                        <option value="1">VERO (সঠিক)</option>
                        <option value="0">FALSO (ভুল)</option>
                    </select>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeQuestionModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Question</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 2. Edit Chapter Modal -->
    <div class="modal-overlay" id="chapter-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title">Edit Chapter Title</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeChapterModal()"></i>
            </div>
            
            <form id="chapter-form" onsubmit="saveChapter(event)" enctype="multipart/form-data">
                <input type="hidden" id="form-chapter-id-val">
                
                <div class="form-group">
                    <label class="form-label">Chapter ID</label>
                    <input type="text" class="form-control" id="form-chapter-num-display" readonly>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-chapter-title-val">Chapter Name (Italian)</label>
                    <input type="text" class="form-control" id="form-chapter-title-val" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-chapter-title-bn">Chapter Name (Bangla)</label>
                    <input type="text" class="form-control" id="form-chapter-title-bn">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-chapter-image">Cover Thumbnail</label>
                    <input type="file" class="form-control" id="form-chapter-image" accept="image/*">
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeChapterModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Chapter</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 2b. Add/Edit Page Modal -->
    <div class="modal-overlay" id="page-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title" id="page-modal-title">Add New Page</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closePageModal()"></i>
            </div>
            
            <form id="page-form" onsubmit="savePage(event)" enctype="multipart/form-data">
                <input type="hidden" id="form-page-id">
                <input type="hidden" id="form-page-chapter-id">
                
                <div class="form-group">
                    <label class="form-label" for="form-page-title">Page Title (Italian)</label>
                    <input type="text" class="form-control" id="form-page-title" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-page-title-bn">Page Title (Bangla)</label>
                    <input type="text" class="form-control" id="form-page-title-bn">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-page-content">Page Content / Text</label>
                    <textarea class="form-control" id="form-page-content" rows="4"></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-page-image">Upload Image</label>
                    <input type="file" class="form-control" id="form-page-image" accept="image/*">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-page-audio">Upload Audio / Voiceover</label>
                    <input type="file" class="form-control" id="form-page-audio" accept="audio/*">
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closePageModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Page</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 2c. Assign Questions Modal -->
    <div class="modal-overlay" id="assign-questions-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title">Assign Questions to Page</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeAssignQuestionsModal()"></i>
            </div>
            
            <form id="assign-questions-form" onsubmit="saveAssignedQuestions(event)">
                <input type="hidden" id="form-assign-page-id">
                
                <div class="form-group">
                    <label class="form-label">Page Title</label>
                    <input type="text" class="form-control" id="form-assign-page-title" readonly>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-assign-question-ids">Question IDs (Comma separated, e.g. 101, 102, 103)</label>
                    <textarea class="form-control" id="form-assign-question-ids" rows="4" placeholder="Enter question IDs to link..." required></textarea>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeAssignQuestionsModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Assign Questions</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 3. Add/Edit Category Modal -->
    <div class="modal-overlay" id="category-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title" id="category-modal-title">Add New Category</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeCategoryModal()"></i>
            </div>
            
            <form id="category-form" onsubmit="saveCategoryData(event)">
                <input type="hidden" id="form-category-id">
                
                <div class="form-group">
                    <label class="form-label" for="form-category-name">Category Name</label>
                    <input type="text" class="form-control" id="form-category-name" required placeholder="e.g. Patente B">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-category-desc">Description</label>
                    <textarea class="form-control" id="form-category-desc" rows="4" placeholder="Optional description..."></textarea>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeCategoryModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Category</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 3b. Add Scheduled Exam Modal -->
    <div class="modal-overlay" id="exam-sched-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title">Schedule New Candidate Exam</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeExamModal()"></i>
            </div>
            
            <form id="exam-sched-form" onsubmit="saveScheduledExam(event)">
                <div class="form-group">
                    <label class="form-label" for="form-exam-student-name">Student / Candidate Name</label>
                    <input type="text" class="form-control" id="form-exam-student-name" required placeholder="e.g. RAHIM RAYHAN">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-exam-motorizzazione">Motorizzazione Center</label>
                    <input type="text" class="form-control" id="form-exam-motorizzazione" required placeholder="e.g. GENOVA">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-exam-date">Exam Date</label>
                    <input type="text" class="form-control" id="form-exam-date" required placeholder="e.g. 16/06/2026">
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeExamModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Schedule Exam</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 7. Add/Edit Slider Modal -->
    <div class="modal-overlay" id="slider-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title" id="slider-modal-title">Add Banner Slider</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeSliderModal()"></i>
            </div>
            
            <form id="slider-form" onsubmit="saveSlider(event)" enctype="multipart/form-data">
                <input type="hidden" id="form-slider-id">
                
                <div class="form-group">
                    <label class="form-label" for="form-slider-title">Slider Title (Italian/Bangla)</label>
                    <input type="text" class="form-control" id="form-slider-title" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-slider-subtitle">Slider Subtitle</label>
                    <input type="text" class="form-control" id="form-slider-subtitle">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-slider-link">Link URL</label>
                    <input type="text" class="form-control" id="form-slider-link" placeholder="e.g. # or URL">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-slider-image">Slider Banner Image</label>
                    <input type="file" class="form-control" id="form-slider-image" accept="image/*">
                    <div id="slider-image-preview" style="margin-top: 10px; display: none;">
                        <img src="" id="slider-preview-img" style="max-width: 100%; height: 100px; border-radius: 8px; object-fit: cover;">
                    </div>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeSliderModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Slider</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 8. Add/Edit Home Card Modal -->
    <div class="modal-overlay" id="home-card-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title" id="home-card-modal-title">Add Home Card</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeHomeCardModal()"></i>
            </div>
            
            <form id="home-card-form" onsubmit="saveHomeCard(event)">
                <input type="hidden" id="form-home-card-id">
                
                <div class="form-group">
                    <label class="form-label" for="form-home-card-title">Card Title (Italian)</label>
                    <input type="text" class="form-control" id="form-home-card-title" required placeholder="e.g. Lezioni">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-home-card-subtitle">Card Subtitle (Bangla/English)</label>
                    <input type="text" class="form-control" id="form-home-card-subtitle" placeholder="e.g. Classes">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-home-card-screen">Target Screen Key</label>
                    <select class="form-control" id="form-home-card-screen" required>
                        <option value="lezioni">lezioni (Classes)</option>
                        <option value="test">test (Practice Test)</option>
                        <option value="argomenti">argomenti (Topics)</option>
                        <option value="eclass">eclass (E-Class)</option>
                        <option value="sfida">sfida (Challenge)</option>
                        <option value="scheda-esame">scheda-esame (Exam Simulation)</option>
                        <option value="dizionario">dizionario (Dictionary)</option>
                        <option value="cartelli">cartelli (Traffic Signs)</option>
                        <option value="saved-mcqs">saved-mcqs (Bookmarks)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-home-card-icon">FontAwesome Icon Class</label>
                    <input type="text" class="form-control" id="form-home-card-icon" required placeholder="e.g. fa-solid fa-video">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-home-card-color">Icon Theme Color (Hex)</label>
                    <input type="color" class="form-control" id="form-home-card-color" value="#3B82F6" style="height: 40px; padding: 2px;">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-home-card-order">Order Index</label>
                    <input type="number" class="form-control" id="form-home-card-order" required value="0">
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeHomeCardModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Card</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 9. Add/Edit Lecture Video Modal -->
    <div class="modal-overlay" id="class-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title" id="class-modal-title">Add Lecture Video</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeClassModal()"></i>
            </div>
            
            <form id="class-form" onsubmit="saveClass(event)" enctype="multipart/form-data">
                <input type="hidden" id="form-class-id">
                
                <div class="form-group">
                    <label class="form-label" for="form-class-title">Video Lesson Title</label>
                    <input type="text" class="form-control" id="form-class-title" required placeholder="e.g. Capitolo 1: Definizione della strada">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-class-duration">Duration</label>
                    <input type="text" class="form-control" id="form-class-duration" placeholder="e.g. ১২ মিনিট">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-class-url">Video Stream URL</label>
                    <input type="text" class="form-control" id="form-class-url" required placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-class-thumb">Thumbnail Image</label>
                    <input type="file" class="form-control" id="form-class-thumb" accept="image/*">
                    <div id="class-thumb-preview" style="margin-top: 10px; display: none;">
                        <img src="" id="class-preview-img" style="max-width: 100%; height: 90px; border-radius: 8px; object-fit: cover;">
                    </div>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeClassModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Video</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 10. Add/Edit Live Session Modal -->
    <div class="modal-overlay" id="live-class-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title" id="live-class-modal-title">Schedule Live Session</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeLiveClassModal()"></i>
            </div>
            
            <form id="live-class-form" onsubmit="saveLiveClass(event)">
                <input type="hidden" id="form-live-class-id">
                
                <div class="form-group">
                    <label class="form-label" for="form-live-class-title">Session Title</label>
                    <input type="text" class="form-control" id="form-live-class-title" required placeholder="e.g. পরবর্তী লাইভ ক্লাস আজ রাত ৯:০০ টায়">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-live-class-subtitle">Subject Subtitle</label>
                    <input type="text" class="form-control" id="form-live-class-subtitle" placeholder="e.g. অধ্যায় ৪: অগ্রাধিকার নিয়ম (Precedenza)">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-live-class-speaker">Speaker/Tutor Name</label>
                    <input type="text" class="form-control" id="form-live-class-speaker" placeholder="e.g. M Rahman">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-live-class-desc">Description</label>
                    <textarea class="form-control" id="form-live-class-desc" rows="3" placeholder="Enter session notes..."></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-live-class-date">Scheduled Date & Time</label>
                    <input type="datetime-local" class="form-control" id="form-live-class-date" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-live-class-link">Default Room Link (Fallback)</label>
                    <input type="text" class="form-control" id="form-live-class-link" placeholder="e.g. https://meet.google.com/abc-defg-hij">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-live-class-zoom">Zoom Meeting Link</label>
                    <input type="text" class="form-control" id="form-live-class-zoom" placeholder="e.g. https://zoom.us/j/meeting-id">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-live-class-meet">Google Meet Link</label>
                    <input type="text" class="form-control" id="form-live-class-meet" placeholder="e.g. https://meet.google.com/abc-defg-hij">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-live-class-live">Live Stream URL (YouTube Live / Facebook Live)</label>
                    <input type="text" class="form-control" id="form-live-class-live" placeholder="e.g. https://youtube.com/live/xxx">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-live-class-thumb">Thumbnail Upload</label>
                    <input type="file" class="form-control" id="form-live-class-thumb" accept="image/*">
                    <div id="live-thumb-preview-container" style="margin-top: 10px; display: none;">
                        <img src="" id="live-thumb-preview-img" style="height: 60px; border-radius: 6px; object-fit: cover;">
                    </div>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeLiveClassModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Schedule Session</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 11. Add/Edit Chapter Modal -->
    <div class="modal-overlay" id="chapter-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title" id="chapter-modal-title">Add Chapter</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeChapterModal()"></i>
            </div>
            <form id="chapter-form" onsubmit="saveChapter(event)">
                <input type="hidden" id="form-chapter-crud-id">
                
                <div class="form-group">
                    <label class="form-label" for="form-chapter-number">Chapter Number</label>
                    <input type="number" class="form-control" id="form-chapter-number" required placeholder="e.g. 1">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-chapter-name-it">Chapter Name (Italian)</label>
                    <input type="text" class="form-control" id="form-chapter-name-it" required placeholder="e.g. Definizione della strada">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-chapter-name-bn">Chapter Name (Bangla)</label>
                    <input type="text" class="form-control" id="form-chapter-name-bn" placeholder="e.g. রাস্তা এবং ট্রাফিকের ধারণা">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-chapter-desc">Description</label>
                    <textarea class="form-control" id="form-chapter-desc" rows="3" placeholder="Enter chapter explanation..."></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-chapter-thumb-file">Chapter Thumbnail</label>
                    <input type="file" class="form-control" id="form-chapter-thumb-file" accept="image/*">
                    <div id="chapter-thumb-preview-container" style="margin-top: 10px; display: none;">
                        <img src="" id="chapter-thumb-preview-img" style="height: 60px; border-radius: 6px; object-fit: cover;">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-chapter-cover-file">Chapter Cover Image</label>
                    <input type="file" class="form-control" id="form-chapter-cover-file" accept="image/*">
                    <div id="chapter-cover-preview-container" style="margin-top: 10px; display: none;">
                        <img src="" id="chapter-cover-preview-img" style="height: 60px; border-radius: 6px; object-fit: cover;">
                    </div>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeChapterModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Chapter</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 12. Add/Edit Page Modal -->
    <div class="modal-overlay" id="page-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title" id="page-modal-title">Add Page</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closePageModal()"></i>
            </div>
            <form id="page-form" onsubmit="savePage(event)">
                <input type="hidden" id="form-page-crud-id">
                <input type="hidden" id="form-page-chapter-id">
                
                <div class="form-group">
                    <label class="form-label" for="form-page-order">Sort Order</label>
                    <input type="number" class="form-control" id="form-page-order" required value="0">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-page-title-it">Page Title (Italian)</label>
                    <input type="text" class="form-control" id="form-page-title-it" required placeholder="e.g. La strada e le sue parti">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-page-title-bn">Page Title (Bangla)</label>
                    <input type="text" class="form-control" id="form-page-title-bn" placeholder="e.g. রাস্তা এবং এর অংশসমূহ">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-page-content">Page Content (Rich Text Description)</label>
                    <textarea class="form-control" id="form-page-content" rows="6" placeholder="Enter page text content..."></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-page-img-file">Page Image</label>
                    <input type="file" class="form-control" id="form-page-img-file" accept="image/*">
                    <div id="page-img-preview-container" style="margin-top: 10px; display: none;">
                        <img src="" id="page-img-preview-img" style="height: 60px; border-radius: 6px; object-fit: cover;">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-page-audio-file">Audio Voiceover</label>
                    <input type="file" class="form-control" id="form-page-audio-file" accept="audio/*">
                    <div id="page-audio-preview-container" style="margin-top: 10px; display: none;">
                        <audio src="" id="page-audio-preview-player" controls style="width: 100%; height: 35px;"></audio>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-page-video-file">Video File (MP4) or YouTube URL</label>
                    <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                        <input type="file" class="form-control" id="form-page-video-file" accept="video/*" style="flex: 1;">
                        <input type="text" class="form-control" id="form-page-video-url" placeholder="Or YouTube Video URL..." style="flex: 1;">
                    </div>
                    <div id="page-video-preview-container" style="margin-top: 10px; display: none;">
                        <video src="" id="page-video-preview-player" controls style="width: 100%; max-height: 150px; border-radius: 8px; background: #000;"></video>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-page-pdf-file">PDF File (Optional)</label>
                    <input type="file" class="form-control" id="form-page-pdf-file" accept="application/pdf">
                    <div id="page-pdf-preview-container" style="margin-top: 10px; display: none;">
                        <a href="" id="page-pdf-preview-link" target="_blank" style="color: var(--accent-teal); font-size: 12px; font-weight: bold;"><i class="fa-solid fa-file-pdf"></i> View PDF</a>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closePageModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Page</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 13. Rename Media File Modal -->
    <div class="modal-overlay" id="rename-media-modal">
        <div class="modal-card" style="max-width: 400px;">
            <div class="modal-header-row">
                <h3 class="modal-title">Rename File</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeRenameMediaModal()"></i>
            </div>
            <form id="rename-media-form" onsubmit="saveRenameMedia(event)">
                <input type="hidden" id="form-rename-media-id">
                <div class="form-group">
                    <label class="form-label" for="form-rename-media-name">Filename</label>
                    <input type="text" class="form-control" id="form-rename-media-name" required>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeRenameMediaModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Rename</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 14. System Error Details Modal -->
    <div class="modal-overlay" id="sys-error-detail-modal">
        <div class="modal-card" style="max-width: 800px; width: 90%;">
            <div class="modal-header-row">
                <h3 class="modal-title" style="color: var(--accent-orange);"><i class="fa-solid fa-bug"></i> Error Details: <span id="lbl-sys-error-ref" style="font-family: monospace;"></span></h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeSysErrorDetailModal()"></i>
            </div>
            <div style="max-height: 500px; overflow-y: auto; font-size: 13px; line-height: 1.8;">
                <div class="dashboard-grid" style="grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div>
                        <strong style="color: var(--text-secondary);">Exception Type:</strong>
                        <div id="lbl-sys-error-type" style="font-family: monospace; font-weight: 600; margin-bottom: 8px;"></div>
                        
                        <strong style="color: var(--text-secondary);">File & Line:</strong>
                        <div id="lbl-sys-error-file" style="font-family: monospace; margin-bottom: 8px;"></div>
                        
                        <strong style="color: var(--text-secondary);">Route & Controller:</strong>
                        <div id="lbl-sys-error-route" style="font-family: monospace; margin-bottom: 8px;"></div>

                        <strong style="color: var(--text-secondary);">Request URL:</strong>
                        <div id="lbl-sys-error-url" style="word-break: break-all; margin-bottom: 8px;"></div>
                    </div>
                    <div>
                        <strong style="color: var(--text-secondary);">Client User Agent:</strong>
                        <div id="lbl-sys-error-agent" style="margin-bottom: 8px;"></div>
                        
                        <strong style="color: var(--text-secondary);">IP Address:</strong>
                        <div id="lbl-sys-error-ip" style="font-family: monospace; margin-bottom: 8px;"></div>
                        
                        <strong style="color: var(--text-secondary);">Logged User:</strong>
                        <div id="lbl-sys-error-user" style="margin-bottom: 8px;"></div>

                        <strong style="color: var(--text-secondary);">Date & Time:</strong>
                        <div id="lbl-sys-error-time" style="margin-bottom: 8px;"></div>
                    </div>
                </div>

                <strong style="color: var(--text-secondary);">Exception Message:</strong>
                <pre id="lbl-sys-error-message" style="background-color: rgba(0,0,0,0.3); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; font-weight: bold; margin-bottom: 20px; color: var(--accent-red);"></pre>

                <!-- SQL Error Box -->
                <div id="sys-error-sql-box" style="display: none; background-color: rgba(225,29,72,0.1); border: 1px solid var(--accent-red); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: var(--accent-red); font-weight: bold;"><i class="fa-solid fa-triangle-exclamation"></i> SQL Query Failure</h4>
                    <div style="margin-bottom: 8px;"><strong>SQLSTATE:</strong> <code id="lbl-sys-sql-state"></code></div>
                    <div style="margin-bottom: 8px;"><strong>Query executed:</strong></div>
                    <pre id="lbl-sys-sql-query" style="background-color: rgba(0,0,0,0.5); padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; margin: 0 0 8px 0;"></pre>
                    <div><strong>Bindings:</strong></div>
                    <pre id="lbl-sys-sql-bindings" style="background-color: rgba(0,0,0,0.5); padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; margin: 0;"></pre>
                </div>

                <strong style="color: var(--text-secondary);">Stack Trace:</strong>
                <pre id="lbl-sys-error-trace" style="background-color: #0f172a; border: 1px solid #334155; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 11px; white-space: pre-wrap; overflow-x: auto; color: #e2e8f0; height: 250px;"></pre>
            </div>
            <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                <button class="btn btn-primary" onclick="copyModalErrorDetails()"><i class="fa-regular fa-copy"></i> Copy Error Details</button>
                <button class="btn btn-secondary" onclick="closeSysErrorDetailModal()">Close</button>
            </div>
        </div>
    </div>

    <!-- 15. API Log Details Modal -->
    <div class="modal-overlay" id="sys-api-payload-modal">
        <div class="modal-card" style="max-width: 700px; width: 90%;">
            <div class="modal-header-row">
                <h3 class="modal-title"><i class="fa-solid fa-network-wired"></i> API Request payload details</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeSysApiPayloadModal()"></i>
            </div>
            <div style="max-height: 480px; overflow-y: auto; font-size: 13px;">
                <strong style="color: var(--text-secondary);">API Request Payload parameters:</strong>
                <pre id="lbl-sys-api-request" style="background-color: #0f172a; border: 1px solid #334155; padding: 12px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; color: #38bdf8; margin: 8px 0 20px 0; max-height: 180px; overflow-y: auto;"></pre>

                <strong style="color: var(--text-secondary);">API Response body:</strong>
                <pre id="lbl-sys-api-response" style="background-color: #0f172a; border: 1px solid #334155; padding: 12px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; color: #10b981; margin: 8px 0 0 0; max-height: 220px; overflow-y: auto;"></pre>
            </div>
            <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="closeSysApiPayloadModal()">Close</button>
            </div>
        </div>
    </div>

    <!-- Toast notification Panel -->
    <div class="toast" id="toast-message">
        <i class="fa-solid fa-circle-info" style="color: var(--accent-teal);"></i>
        <span id="toast-text-content">মেসেজ</span>
    </div>

    <!-- ======================================================== -->
    <!-- CARTELLI MODULE MODALS                                   -->
    <!-- ======================================================== -->

    <!-- 1. CATEGORY MODAL -->
    <div class="modal-overlay" id="cartello-cat-modal">
        <div class="modal-card" style="max-width:500px;">
            <div class="modal-header-row">
                <h3 class="modal-title" id="cartello-cat-modal-title">নতুন ক্যাটাগরি তৈরি করুন</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeCartelloCatModal()"></i>
            </div>
            <form id="cartello-cat-form" onsubmit="saveCartelloCategory(event)">
                <div class="form-group">
                    <label class="form-label" for="ccat-name">Italian নাম <span style="color:var(--accent-red);">*</span></label>
                    <input type="text" class="form-control" id="ccat-name" name="name" placeholder="e.g. Pericolo" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="ccat-bn-name">বাংলা নাম <span style="color:var(--accent-red);">*</span></label>
                    <input type="text" class="form-control" id="ccat-bn-name" name="bn_name" placeholder="e.g. বিপদ চিহ্ন" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="ccat-description">Description (Italian)</label>
                    <textarea class="form-control" id="ccat-description" name="description" placeholder="Italian description..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="ccat-bn-description">বিবরণ (বাংলা)</label>
                    <textarea class="form-control" id="ccat-bn-description" name="bn_description" placeholder="বাংলা বিবরণ..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="ccat-sort-order">ক্রম (Sort Order)</label>
                    <input type="number" class="form-control" id="ccat-sort-order" name="sort_order" value="0" min="0">
                </div>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button type="submit" class="btn btn-primary" style="flex:1;"><i class="fa-solid fa-save"></i> সংরক্ষণ করুন</button>
                    <button type="button" class="btn" style="flex:1; background:var(--surface-2);" onclick="closeCartelloCatModal()">বাতিল</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 2. CHAPTER MODAL -->
    <div class="modal-overlay" id="cartello-chapter-modal">
        <div class="modal-card" style="max-width:500px;">
            <div class="modal-header-row">
                <h3 class="modal-title" id="cartello-chapter-modal-title">নতুন চ্যাপ্টার তৈরি করুন</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeCartelloChapterModal()"></i>
            </div>
            <form id="cartello-chapter-form" onsubmit="saveCartelloChapter(event)">
                <div class="form-group">
                    <label class="form-label" for="cch-category-id">অধ্যায় (Category) <span style="color:var(--accent-red);">*</span></label>
                    <select class="form-control" id="cch-category-id" name="category_id" required>
                        <option value="">ক্যাটাগরি নির্বাচন করুন...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cch-name">Chapter Name (Italian) <span style="color:var(--accent-red);">*</span></label>
                    <input type="text" class="form-control" id="cch-name" name="name" placeholder="e.g. Segnali di Pericolo" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cch-bn-name">চ্যাপ্টার নাম (বাংলা) <span style="color:var(--accent-red);">*</span></label>
                    <input type="text" class="form-control" id="cch-bn-name" name="bn_name" placeholder="e.g. বিপদজনক সাইনসমূহ" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cch-chapter-number">Chapter Number (সর্বোচ্চ ২৫) <span style="color:var(--accent-red);">*</span></label>
                    <input type="number" class="form-control" id="cch-chapter-number" name="chapter_number" placeholder="e.g. 1" min="1" max="25" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cch-sort-order">ক্রম (Sort Order)</label>
                    <input type="number" class="form-control" id="cch-sort-order" name="sort_order" value="0" min="0">
                </div>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button type="submit" class="btn btn-primary" style="flex:1;"><i class="fa-solid fa-save"></i> সংরক্ষণ করুন</button>
                    <button type="button" class="btn" style="flex:1; background:var(--surface-2);" onclick="closeCartelloChapterModal()">বাতিল</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 3. PAGE MODAL -->
    <div class="modal-overlay" id="cartello-page-modal">
        <div class="modal-card" style="max-width:550px;">
            <div class="modal-header-row">
                <h3 class="modal-title" id="cartello-page-modal-title">নতুন পেজ তৈরি করুন</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeCartelloPageModal()"></i>
            </div>
            <form id="cartello-page-form" onsubmit="saveCartelloPage(event)" enctype="multipart/form-data">
                <div class="form-group">
                    <label class="form-label" for="cpage-category-id">অধ্যায় (Category) <span style="color:var(--accent-red);">*</span></label>
                    <select class="form-control" id="cpage-category-id" onchange="handleCategoryChange('cpage-category-id', 'cpage-chapter-id')" required>
                        <option value="">ক্যাটাগরি নির্বাচন করুন...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cpage-chapter-id">Chapter <span style="color:var(--accent-red);">*</span></label>
                    <select class="form-control" id="cpage-chapter-id" name="chapter_id" required>
                        <option value="">প্রথমে ক্যাটাগরি সিলেক্ট করুন...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cpage-page-number">Page Number <span style="color:var(--accent-red);">*</span></label>
                    <input type="number" class="form-control" id="cpage-page-number" name="page_number" placeholder="e.g. 1" min="1" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cpage-title">Page Title (Italian) <span style="color:var(--accent-red);">*</span></label>
                    <input type="text" class="form-control" id="cpage-title" name="title" placeholder="Italian title..." required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cpage-bn-title">পেজ শিরোনাম (বাংলা) <span style="color:var(--accent-red);">*</span></label>
                    <input type="text" class="form-control" id="cpage-bn-title" name="bn_title" placeholder="বাংলা শিরোনাম..." required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cpage-description">Description (Italian)</label>
                    <textarea class="form-control" id="cpage-description" name="description" placeholder="Italian description..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cpage-bn-description">বিবরণ (বাংলা)</label>
                    <textarea class="form-control" id="cpage-bn-description" name="bn_description" placeholder="বাংলা বিবরণ..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cpage-image">Image Upload</label>
                    <input type="file" class="form-control" id="cpage-image" name="image" accept="image/*">
                </div>
                <div class="form-group">
                    <label class="form-label" for="cpage-video">Video Upload</label>
                    <input type="file" class="form-control" id="cpage-video" name="video" accept="video/*">
                </div>
                <div class="form-group">
                    <label class="form-label" for="cpage-sort-order">ক্রম (Sort Order)</label>
                    <input type="number" class="form-control" id="cpage-sort-order" name="sort_order" value="0" min="0">
                </div>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button type="submit" class="btn btn-primary" style="flex:1;"><i class="fa-solid fa-save"></i> সংরক্ষণ করুন</button>
                    <button type="button" class="btn" style="flex:1; background:var(--surface-2);" onclick="closeCartelloPageModal()">বাতিল</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 4. MCQ MODAL -->
    <div class="modal-overlay" id="cartello-mcq-modal">
        <div class="modal-card" style="max-width:600px;">
            <div class="modal-header-row">
                <h3 class="modal-title" id="cartello-mcq-modal-title">নতুন MCQ প্রশ্ন তৈরি করুন</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeCartelloMcqModal()"></i>
            </div>
            <form id="cartello-mcq-form" onsubmit="saveCartelloMcq(event)" enctype="multipart/form-data">
                <div class="form-group">
                    <label class="form-label" for="cmcq-category-id">অধ্যায় (Category) <span style="color:var(--accent-red);">*</span></label>
                    <select class="form-control" id="cmcq-category-id" onchange="handleCategoryChange('cmcq-category-id', 'cmcq-chapter-id')" required>
                        <option value="">ক্যাটাগরি নির্বাচন করুন...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cmcq-chapter-id">Chapter <span style="color:var(--accent-red);">*</span></label>
                    <select class="form-control" id="cmcq-chapter-id" onchange="handleChapterChange('cmcq-chapter-id', 'cmcq-page-id')" required>
                        <option value="">প্রথমে ক্যাটাগরি সিলেক্ট করুন...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cmcq-page-id">Page <span style="color:var(--accent-red);">*</span></label>
                    <select class="form-control" id="cmcq-page-id" name="page_id" required>
                        <option value="">প্রথমে চ্যাপ্টার সিলেক্ট করুন...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cmcq-question">Question (Italian) <span style="color:var(--accent-red);">*</span></label>
                    <textarea class="form-control" id="cmcq-question" name="question" rows="2" placeholder="Italian question..." required></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cmcq-bn-question">প্রশ্ন (বাংলা অর্থ) <span style="color:var(--accent-red);">*</span></label>
                    <textarea class="form-control" id="cmcq-bn-question" name="bn_question" rows="2" placeholder="বাংলা অর্থ..." required></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label" for="cmcq-correct-answer">Correct Answer <span style="color:var(--accent-red);">*</span></label>
                    <select class="form-control" id="cmcq-correct-answer" name="correct_answer" required>
                        <option value="vero">VERO (সত্য)</option>
                        <option value="falso">FALSO (মিথ্যা)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cmcq-explanation">Explanation (Italian)</label>
                    <textarea class="form-control" id="cmcq-explanation" name="explanation" placeholder="Italian explanation..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cmcq-bn-explanation">ব্যাখ্যা (বাংলা)</label>
                    <textarea class="form-control" id="cmcq-bn-explanation" name="bn_explanation" placeholder="বাংলা ব্যাখ্যা..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cmcq-image">Image Upload (Optional)</label>
                    <input type="file" class="form-control" id="cmcq-image" name="image" accept="image/*">
                </div>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button type="submit" class="btn btn-primary" style="flex:1;"><i class="fa-solid fa-save"></i> সংরক্ষণ করুন</button>
                    <button type="button" class="btn" style="flex:1; background:var(--surface-2);" onclick="closeCartelloMcqModal()">বাতিল</button>
                </div>
            </form>
        </div>
    </div>

    <!-- SweetAlert2 CDN -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- CKEditor 5 CDN -->
    <script src="https://cdn.ckeditor.com/ckeditor5/36.0.1/classic/ckeditor.js"></script>

    