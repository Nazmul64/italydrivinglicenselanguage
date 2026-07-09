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
            
            <form id="chapter-form" onsubmit="saveChapter(event)">
                <input type="hidden" id="form-chapter-id-val">
                
                <div class="form-group">
                    <label class="form-label">Chapter ID</label>
                    <input type="text" class="form-control" id="form-chapter-num-display" readonly>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-chapter-title-val">Chapter Name (Italian)</label>
                    <input type="text" class="form-control" id="form-chapter-title-val" required>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeChapterModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Chapter</button>
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

    <!-- Toast notification Panel -->
    <div class="toast" id="toast-message">
        <i class="fa-solid fa-circle-info" style="color: var(--accent-teal);"></i>
        <span id="toast-text-content">মেসেজ</span>
    </div>

    <script>
        // Set CSRF Token header for AJAX requests
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        // Sidebar drop-down logic
        let currentPanel = 'dashboard';
        let currentPage = 1;

        // Toggle Dark/Light Mode Theme
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            const themeIcon = document.getElementById('theme-toggle');
            if (isDark) {
                themeIcon.className = 'fa-solid fa-sun action-icon';
                localStorage.setItem('admin-theme', 'dark');
                showToast('ডার্ক মোড সক্রিয় হয়েছে');
            } else {
                themeIcon.className = 'fa-solid fa-moon action-icon';
                localStorage.setItem('admin-theme', 'light');
                showToast('লাইট মোড সক্রিয় হয়েছে');
            }
        }

        // Initialize Theme from Storage
        if (localStorage.getItem('admin-theme') === 'dark') {
            document.body.classList.add('dark-mode');
            document.getElementById('theme-toggle').className = 'fa-solid fa-sun action-icon';
        }

        // Display panels switching
        function switchPanel(panelId) {
            stopAdminChatPolling();
            currentPanel = panelId;
            document.querySelectorAll('.crud-panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));

            const targetPanel = document.getElementById(`panel-${panelId}`);
            if (targetPanel) targetPanel.classList.add('active');

            if (panelId === 'dashboard') {
                document.getElementById('menu-dashboard').classList.add('active');
                document.getElementById('dashboard-submenu').classList.add('open');
                fetchStats();
            } else if (panelId === 'mcq-questions') {
                document.getElementById('menu-questions').classList.add('active');
                document.getElementById('dashboard-submenu').classList.remove('open');
                fetchQuestions();
            } else if (panelId === 'mcq-chapters') {
                document.getElementById('menu-chapters').classList.add('active');
                document.getElementById('dashboard-submenu').classList.remove('open');
                fetchChapters();
            } else if (panelId === 'chat-room') {
                document.getElementById('menu-chat-room').classList.add('active');
                document.getElementById('dashboard-submenu').classList.remove('open');
                startAdminChatPolling();
            } else if (panelId === 'categories') {
                document.getElementById('menu-categories').classList.add('active');
                document.getElementById('dashboard-submenu').classList.remove('open');
                fetchCategories();
            }
        }

        // Toast Messages
        let toastTimer;
        function showToast(message) {
            const toast = document.getElementById('toast-message');
            const toastText = document.getElementById('toast-text-content');
            toastText.innerText = message;
            toast.classList.add('show');

            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // Trigger search globally
        function triggerGlobalSearch(value) {
            if (currentPanel === 'mcq-questions') {
                document.getElementById('search-question').value = value;
                fetchQuestions();
            }
        }

        // Fetch Dashboard overall stats
        function fetchStats() {
            fetch('/admin/api/stats')
                .then(res => res.json())
                .then(data => {
                    document.getElementById('dash-total-sales').innerText = data.total_questions + ' questions';
                })
                .catch(err => console.error(err));
        }
        fetchStats();

        // 25 Chapters local metadata dictionary to sync option lists
        const chaptersDict = {
            1: "Definizioni stradali e doveri dell'uso della strada",
            2: "Segnali di pericolo",
            3: "Segnali di divieto",
            4: "Segnali di obbligo",
            5: "Segnali orizzontali e segni sulla strada",
            6: "Segnalazioni semaforiche e degli agenti del traffico",
            7: "Pericolo e intralcio, limiti di velocità, distanza di sicurezza",
            8: "Norme sulla circolazione dei veicoli (precedenze)",
            9: "Esempi di precedenza (rappresentazioni grafiche)",
            10: "Norme sul sorpasso",
            11: "Fermata, sosta, partenza e ingombro della carreggiata",
            12: "Norme sull'uso delle luci, dispositivi acustici, spie",
            13: "Cinture di sicurezza, sistemi di ritenuta, casco",
            14: "Patenti di guida, documenti, punti patente",
            15: "Incidenti stradali e primo soccorso",
            16: "Guida in relazione alle condizioni ambientali",
            17: "Responsabilità civile, penale, amministrativa, assicurazione",
            18: "Limitazione dei consumi, inquinamento, elementi del veicolo",
            19: "Dispositivi di equipaggiamento e specchietti retrovisori",
            20: "Uso ed efficienza dei dispositivi del veicolo",
            21: "Comportamenti alla guida in autostrada e strade extraurbane",
            22: "Segnali di indicazione, pannelli integrativi, segnali turistici",
            23: "Uso corretto della strada e comportamenti precauzionali",
            24: "Segnali luminosi e indicazioni degli agenti di polizia",
            25: "Definizioni generali e classificazione dei veicoli"
        };

        // Populate Chapter dropdown selection lists
        function populateChaptersSelectors() {
            const filterCh = document.getElementById('filter-chapter');
            const formCh = document.getElementById('form-chapter');
            
            filterCh.innerHTML = '<option value="">সকল অধ্যায় (All Chapters)</option>';
            formCh.innerHTML = '';

            for (let id in chaptersDict) {
                filterCh.innerHTML += `<option value="${id}">${id}. ${chaptersDict[id]}</option>`;
                formCh.innerHTML += `<option value="${id}">${id}. ${chaptersDict[id]}</option>`;
            }
        }
        populateChaptersSelectors();

        function syncChapterName(val) {
            document.getElementById('form-chapter-name').value = chaptersDict[val] || '';
        }
        syncChapterName(1);

        // Fetch Questions paginated list via AJAX
        function fetchQuestions() {
            const chapter = document.getElementById('filter-chapter').value;
            const search = document.getElementById('search-question').value;
            
            let url = `/admin/api/questions?page=${currentPage}`;
            if (chapter) url += `&chapter=${chapter}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    renderQuestionsTable(data.data);
                    updatePaginationControls(data);
                })
                .catch(err => {
                    console.error(err);
                    showToast('প্রশ্ন লোড করতে সমস্যা হয়েছে');
                });
        }

        // Render table records
        function renderQuestionsTable(questions) {
            const tbody = document.getElementById('questions-table-body');
            tbody.innerHTML = '';

            if (!questions || questions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 30px;">কোনো প্রশ্ন পাওয়া যায়নি</td></tr>';
                return;
            }

            questions.forEach(q => {
                const tr = document.createElement('tr');
                const isVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
                tr.innerHTML = `
                    <td style="font-weight: 700; color: var(--accent-teal);">${q.chapter}</td>
                    <td style="font-weight: 500;">${q.italian}</td>
                    <td style="color: var(--text-secondary); font-size: 12px;">${q.bangla}</td>
                    <td>
                        <span class="badge ${isVero ? 'badge-vero' : 'badge-falso'}">
                            ${isVero ? 'VERO' : 'FALSO'}
                        </span>
                    </td>
                    <td style="text-align: center;">
                        <div class="table-actions" style="justify-content: center;">
                            <button class="action-btn edit" onclick="openEditQuestionModal(${JSON.stringify(q).replace(/"/g, '&quot;')})" title="Edit question"><i class="fa-solid fa-pencil"></i></button>
                            <button class="action-btn delete" onclick="deleteQuestion(${q.id})" title="Delete question"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Update pagination numbers
        function updatePaginationControls(data) {
            document.getElementById('pagination-status').innerText = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total || 0} entries`;
            
            document.getElementById('btn-prev-page').disabled = !data.prev_page_url;
            document.getElementById('btn-next-page').disabled = !data.next_page_url;
        }

        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                fetchQuestions();
            }
        }

        function nextPage() {
            currentPage++;
            fetchQuestions();
        }

        // Add / Edit Question Modals logic
        function openAddQuestionModal() {
            document.getElementById('question-modal-title').innerText = 'Add New Question';
            document.getElementById('form-question-id').value = '';
            document.getElementById('form-italian').value = '';
            document.getElementById('form-bangla').value = '';
            document.getElementById('form-is-vero').value = '1';
            
            const firstChapter = Object.keys(chaptersDict)[0];
            document.getElementById('form-chapter').value = firstChapter;
            syncChapterName(firstChapter);

            document.getElementById('question-modal').style.display = 'flex';
        }

        function openEditQuestionModal(q) {
            document.getElementById('question-modal-title').innerText = 'Edit Question';
            document.getElementById('form-question-id').value = q.id;
            document.getElementById('form-chapter').value = q.chapter;
            document.getElementById('form-chapter-name').value = q.chapter_name || '';
            document.getElementById('form-italian').value = q.italian;
            document.getElementById('form-bangla').value = q.bangla;
            
            const isVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
            document.getElementById('form-is-vero').value = isVero ? '1' : '0';

            document.getElementById('question-modal').style.display = 'flex';
        }

        function closeQuestionModal() {
            document.getElementById('question-modal').style.display = 'none';
        }

        // AJAX Save Question (Create or Update)
        function saveQuestion(e) {
            e.preventDefault();
            const id = document.getElementById('form-question-id').value;
            const chapter = document.getElementById('form-chapter').value;
            const chapter_name = document.getElementById('form-chapter-name').value;
            const italian = document.getElementById('form-italian').value;
            const bangla = document.getElementById('form-bangla').value;
            const is_vero = document.getElementById('form-is-vero').value === '1';

            const payload = { chapter, chapter_name, italian, bangla, is_vero };
            const url = id ? `/admin/api/questions/update/${id}` : '/admin/api/questions/store';

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                closeQuestionModal();
                showToast(id ? 'প্রশ্নটি সফলভাবে আপডেট করা হয়েছে' : 'নতুন প্রশ্নটি সফলভাবে যোগ করা হয়েছে');
                fetchQuestions();
            })
            .catch(err => {
                console.error(err);
                showToast('প্রশ্নটি সংরক্ষণ করতে ব্যর্থ হয়েছে');
            });
        }

        // Delete Question
        function deleteQuestion(id) {
            if (confirm('আপনি কি নিশ্চিতভাবে এই প্রশ্নটি ডিলিট করতে চান?')) {
                fetch(`/admin/api/questions/delete/${id}`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken
                    }
                })
                .then(res => res.json())
                .then(data => {
                    showToast('প্রশ্নটি ডিলিট করা হয়েছে');
                    fetchQuestions();
                })
                .catch(err => {
                    console.error(err);
                    showToast('প্রশ্নটি ডিলিট করতে সমস্যা হয়েছে');
                });
            }
        }

        // Chapters Management Panel AJAX Operations
        function fetchChapters() {
            fetch('/admin/api/chapters')
                .then(res => res.json())
                .then(data => {
                    renderChaptersGrid(data);
                })
                .catch(err => {
                    console.error(err);
                    showToast('অধ্যায় তালিকা লোড করতে ব্যর্থ হয়েছে');
                });
        }

        function renderChaptersGrid(chapters) {
            const container = document.getElementById('chapters-grid-container');
            container.innerHTML = '';

            chapters.forEach(ch => {
                const card = document.createElement('div');
                card.className = 'chapter-card';
                card.innerHTML = `
                    <div class="chapter-header">
                        <div>
                            <span class="chapter-num">Chapter ${ch.chapter}</span>
                            <h4 class="chapter-title">${ch.chapter_name}</h4>
                        </div>
                        <button class="action-btn edit" onclick="openEditChapterModal(${ch.chapter}, '${ch.chapter_name.replace(/'/g, "\\'")}')" title="Edit chapter title"><i class="fa-solid fa-pencil"></i></button>
                    </div>
                    <div class="chapter-count">
                        <i class="fa-solid fa-layer-group" style="margin-right: 6px; color: var(--text-secondary);"></i>
                        ${ch.question_count} Patente questions
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function openEditChapterModal(id, name) {
            document.getElementById('form-chapter-id-val').value = id;
            document.getElementById('form-chapter-num-display').value = id;
            document.getElementById('form-chapter-title-val').value = name;
            document.getElementById('chapter-modal').style.display = 'flex';
        }

        function closeChapterModal() {
            document.getElementById('chapter-modal').style.display = 'none';
        }

        // AJAX Update Chapter Name
        function saveChapter(e) {
            e.preventDefault();
            const id = document.getElementById('form-chapter-id-val').value;
            const name = document.getElementById('form-chapter-title-val').value;

            fetch('/admin/api/chapters/store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ chapter: id, chapter_name: name })
            })
            .then(res => res.json())
            .then(data => {
                closeChapterModal();
                showToast('অধ্যায়ের নাম সফলভাবে আপডেট করা হয়েছে');
                // Re-sync local dictionary and re-render grid
                chaptersDict[id] = name;
                populateChaptersSelectors();
                fetchChapters();
            })
            .catch(err => {
                console.error(err);
                showToast('অধ্যায়ের নাম আপডেট করতে সমস্যা হয়েছে');
            });
        }

        // Toggle user profile dropdown menu
        function toggleUserDropdown(e) {
            e.stopPropagation();
            const dropdown = document.getElementById('user-dropdown-menu');
            if (dropdown) {
                const isVisible = dropdown.style.display === 'block';
                dropdown.style.display = isVisible ? 'none' : 'block';
            }
        }

        // Close dropdown when user clicks elsewhere
        window.addEventListener('click', () => {
            const dropdown = document.getElementById('user-dropdown-menu');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        });

        // --- 8. Admin Chat Room Operations ---
        let adminChatInterval = null;
        let activeChatSessionId = null;

        function startAdminChatPolling() {
            fetchConversations();
            if (!adminChatInterval) {
                adminChatInterval = setInterval(() => {
                    fetchConversations();
                    if (activeChatSessionId) {
                        fetchConversationMessages(activeChatSessionId, false);
                    }
                }, 3000);
            }
        }

        function stopAdminChatPolling() {
            if (adminChatInterval) {
                clearInterval(adminChatInterval);
                adminChatInterval = null;
            }
        }

        function fetchConversations() {
            fetch('/admin/api/chat/conversations')
                .then(res => res.json())
                .then(conversations => {
                    renderConversationsList(conversations);
                })
                .catch(err => console.error("Error fetching conversations: ", err));
        }

        function renderConversationsList(conversations) {
            const listContainer = document.getElementById('admin-chat-list');
            listContainer.innerHTML = '';
            
            if (conversations.length === 0) {
                listContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 12px;">কোনো চ্যাট উপলব্ধ নেই</div>`;
                return;
            }
            
            conversations.forEach(convo => {
                const item = document.createElement('div');
                item.className = `conversation-item ${activeChatSessionId === convo.session_id ? 'active' : ''}`;
                item.onclick = () => selectConversation(convo.session_id);
                
                item.innerHTML = `
                    <div class="conversation-avatar">GU</div>
                    <div class="conversation-meta">
                        <div class="conversation-name">Guest #${convo.session_id.substring(0, 8)}</div>
                        <div class="conversation-last-msg">${convo.last_message}</div>
                    </div>
                `;
                listContainer.appendChild(item);
            });
        }

        function selectConversation(sessionId) {
            activeChatSessionId = sessionId;
            
            document.getElementById('admin-chat-fallback').style.display = 'none';
            document.getElementById('admin-chat-main-area').style.display = 'flex';
            
            document.getElementById('active-chat-name').innerText = `Guest User #${sessionId.substring(0, 8)}`;
            
            fetchConversationMessages(sessionId, true);
            
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.classList.remove('active');
            });
            fetchConversations();
        }

        function fetchConversationMessages(sessionId, forceScroll = false) {
            fetch(`/admin/api/chat/messages/${sessionId}`)
                .then(res => res.json())
                .then(messages => {
                    renderConversationMessages(messages, forceScroll);
                })
                .catch(err => console.error("Error loading messages: ", err));
        }

        function renderConversationMessages(messages, forceScroll) {
            const container = document.getElementById('admin-chat-messages');
            const scrollAtBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 50;
            
            container.innerHTML = '';
            messages.forEach(msg => {
                const bubble = document.createElement('div');
                bubble.className = `chat-message-bubble ${msg.sender === 'admin' ? 'admin' : 'user'}`;
                bubble.innerText = msg.message;
                container.appendChild(bubble);
            });
            
            if (forceScroll || scrollAtBottom) {
                container.scrollTop = container.scrollHeight;
            }
        }

        function sendAdminChatMessage() {
            const input = document.getElementById('admin-chat-input');
            const messageText = input.value.trim();
            if (!messageText || !activeChatSessionId) return;
            
            input.value = '';
            
            fetch('/admin/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    session_id: activeChatSessionId,
                    message: messageText
                })
            })
            .then(res => res.json())
            .then(msg => {
                fetchConversationMessages(activeChatSessionId, true);
            })
            .catch(err => console.error("Error sending message: ", err));
        }

        // --- 9. Category Management Operations ---
        let categoriesData = [];

        function fetchCategories() {
            fetch('/admin/api/categories')
                .then(res => res.json())
                .then(data => {
                    categoriesData = data;
                    renderCategoriesTable();
                })
                .catch(err => {
                    console.error("Error loading categories: ", err);
                    showToast('ক্যাটাগরি লোড করতে সমস্যা হয়েছে');
                });
        }

        function renderCategoriesTable() {
            const tbody = document.getElementById('categories-table-body');
            tbody.innerHTML = '';

            if (categoriesData.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 30px;">কোনো ক্যাটাগরি পাওয়া যায়নি। নতুন ক্যাটাগরি তৈরি করুন!</td></tr>`;
                return;
            }

            categoriesData.forEach(cat => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>#${cat.id}</strong></td>
                    <td><strong>${cat.name}</strong></td>
                    <td style="color: var(--text-secondary); font-size: 12px;">${cat.description || 'No description provided'}</td>
                    <td>
                        <div class="table-actions" style="justify-content: flex-end;">
                            <button class="action-btn edit" onclick="openEditCategoryModal(${cat.id}, '${cat.name.replace(/'/g, "\\'")}', '${(cat.description || '').replace(/'/g, "\\'")}')" title="Edit Category">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteCategory(${cat.id})" title="Delete Category">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function openAddCategoryModal() {
            document.getElementById('category-form').reset();
            document.getElementById('form-category-id').value = '';
            document.getElementById('category-modal-title').innerText = 'Add New Category';
            document.getElementById('category-modal').style.display = 'flex';
        }

        function openEditCategoryModal(id, name, desc) {
            document.getElementById('form-category-id').value = id;
            document.getElementById('form-category-name').value = name;
            document.getElementById('form-category-desc').value = desc;
            document.getElementById('category-modal-title').innerText = 'Edit Category';
            document.getElementById('category-modal').style.display = 'flex';
        }

        function closeCategoryModal() {
            document.getElementById('category-modal').style.display = 'none';
        }

        function saveCategoryData(e) {
            e.preventDefault();
            const id = document.getElementById('form-category-id').value;
            const name = document.getElementById('form-category-name').value;
            const desc = document.getElementById('form-category-desc').value;

            const url = id ? `/admin/api/categories/update/${id}` : '/admin/api/categories/store';

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ name: name, description: desc })
            })
            .then(res => res.json())
            .then(data => {
                closeCategoryModal();
                showToast(id ? 'ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে' : 'নতুন ক্যাটাগরি সফলভাবে যোগ করা হয়েছে');
                fetchCategories();
            })
            .catch(err => {
                console.error("Error saving category: ", err);
                showToast('ক্যাটাগরি সংরক্ষণ করতে সমস্যা হয়েছে');
            });
        }

        function deleteCategory(id) {
            if (confirm("আপনি কি নিশ্চিতভাবে এই ক্যাটাগরি মুছে ফেলতে চান?")) {
                fetch(`/admin/api/categories/delete/${id}`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken
                    }
                })
                .then(res => res.json())
                .then(data => {
                    showToast('ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে');
                    fetchCategories();
                })
                .catch(err => {
                    console.error("Error deleting category: ", err);
                    showToast('ক্যাটাগরি মুছতে সমস্যা হয়েছে');
                });
            }
        }
    </script>
</body>
</html>
