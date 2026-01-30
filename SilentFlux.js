/* ==================== DEMO USER DATABASE ==================== */
const USERS = {
    "admin@college.edu": { pass: "admin", role: "admin", name: "System Administrator" },
    "teacher1@college.edu": { pass: "123", role: "faculty", name: "Prof. Johnson" },
    "teacher2@college.edu": { pass: "123", role: "faculty", name: "Dr. A. Smith" },
    "teacher3@college.edu": { pass: "123", role: "faculty", name: "Mrs. Roberts" },
    "teacher4@college.edu": { pass: "123", role: "faculty", name: "Mr. D. Gupta" },
    "teacher5@college.edu": { pass: "123", role: "faculty", name: "Dr. Emily Clark" },
    "student1@college.edu": { pass: "123", role: "student", name: "Anonymous Student 1" },
    "student2@college.edu": { pass: "123", role: "student", name: "Anonymous Student 2" },
    "student3@college.edu": { pass: "123", role: "student", name: "Anonymous Student 3" },
    "student4@college.edu": { pass: "123", role: "student", name: "Anonymous Student 4" },
    "student5@college.edu": { pass: "123", role: "student", name: "Anonymous Student 5" }
};

/* ==================== STATE MANAGEMENT ==================== */
const state = {
    role: 'student', isAuthenticated: false, currentUser: null, selectedContact: null, messages: [], 

    facultyList: [
        { email: "teacher1@college.edu", name: "Prof. Johnson", role: "faculty", status: "online" },
        { email: "teacher2@college.edu", name: "Dr. A. Smith", role: "faculty", status: "offline" },
        { email: "teacher3@college.edu", name: "Mrs. Roberts", role: "faculty", status: "online" },
        { email: "teacher4@college.edu", name: "Mr. D. Gupta", role: "faculty", status: "online" },
        { email: "teacher5@college.edu", name: "Dr. Emily Clark", role: "faculty", status: "offline" }
    ],

    studentList: [
        { email: "student1@college.edu", name: "Anonymous Student ", role: "student", status: "online" },
        { email: "student2@college.edu", name: "Anonymous Student ", role: "student", status: "offline" },
        { email: "student3@college.edu", name: "Anonymous Student ", role: "student", status: "online" },
        { email: "student4@college.edu", name: "Anonymous Student ", role: "student", status: "online" },
        { email: "student5@college.edu", name: "Anonymous Student ", role: "student", status: "offline" }
    ]
};

function loadState() {
    // CHANGED KEY TO sf_messages
    const storedMessages = localStorage.getItem('sf_messages');
    if (storedMessages) state.messages = JSON.parse(storedMessages);
    
    // CHANGED KEY TO sf_session
    const storedSession = sessionStorage.getItem('sf_session');
    if (storedSession) {
        const session = JSON.parse(storedSession);
        state.isAuthenticated = true;
        state.currentUser = session.currentUser;
        state.role = session.role;
    }
}
function saveState() {
    // CHANGED KEY TO sf_messages
    localStorage.setItem('sf_messages', JSON.stringify(state.messages));
    if (state.isAuthenticated) {
        // CHANGED KEY TO sf_session
        sessionStorage.setItem('sf_session', JSON.stringify({ currentUser: state.currentUser, role: state.role }));
    }
}
loadState();

/* ==================== AUTHENTICATION ==================== */
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const sendOtpBtn = document.getElementById('send-otp-btn');
const otpWrapper = document.getElementById('otp-wrapper');
const otpInput = document.getElementById('otp-input');

window.setRole = function(role) {
    state.role = role;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === role) btn.classList.add('active');
    });
    otpWrapper.classList.add('hidden');
    loginBtn.classList.add('hidden');
    sendOtpBtn.disabled = false;
    sendOtpBtn.innerHTML = `<span class="btn-text">Send OTP</span><div class="spinner"></div>`;
    emailInput.value = "";
    passwordInput.value = "";
}

sendOtpBtn.addEventListener('click', () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if (!USERS[email]) { alert("User not found."); return; }
    if (USERS[email].pass !== password) { alert("Incorrect password."); return; }
    if (USERS[email].role !== state.role) { alert(`Wrong tab. This is a ${USERS[email].role} account.`); return; }

    const btnText = sendOtpBtn.querySelector('.btn-text');
    const spinner = sendOtpBtn.querySelector('.spinner');
    btnText.innerText = "Sending...";
    spinner.style.display = "block";
    sendOtpBtn.disabled = true;

    setTimeout(() => {
        spinner.style.display = "none";
        btnText.innerText = "OTP Sent ✓";
        sendOtpBtn.style.background = "var(--success)";
        sendOtpBtn.style.color = "white";
        otpWrapper.classList.remove('hidden');
        otpInput.value = ""; 
        otpInput.focus();
        state.currentUser = { ...USERS[email], email: email };
    }, 800); 
});

otpInput.addEventListener('input', (e) => {
    if (e.target.value.length === 4) loginBtn.classList.remove('hidden');
    else loginBtn.classList.add('hidden');
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if(!state.currentUser) return;
    state.isAuthenticated = true;
    saveState();
    authSection.classList.remove('active');
    appSection.classList.add('active');
    initApp();
});

/* ==================== APP LOGIC ==================== */
function initApp() {
    renderSidebar(""); // Pass empty string to show all
    
    const adminLink = document.getElementById('admin-link-wrapper');
    if (state.currentUser.role === 'admin') adminLink.classList.remove('hidden');
    else adminLink.classList.add('hidden');

    const firstName = state.currentUser.name.split(' ')[0];
    const fullGreeting = `Hello, <span class="neon-text">${firstName}</span>`;

    // BRAND CHANGE HERE
    document.querySelector('.brand').innerHTML = `Silent<span class="neon-text">Flux</span>`; 
    
    const greetings = document.querySelectorAll('.greeting-text');
    greetings.forEach(el => el.innerHTML = fullGreeting);

    const avatarChar = state.currentUser.name.charAt(0);
    document.getElementById('my-avatar').innerText = avatarChar;
    document.getElementById('mobile-avatar').innerText = avatarChar;

    document.getElementById('dropdown-name').innerText = state.currentUser.name;
    document.getElementById('dropdown-email').innerText = state.currentUser.email; 
    document.getElementById('dropdown-role').innerText = state.currentUser.role.toUpperCase();

    // SETUP DROPDOWNS
    setupDropdown('desktop-profile-trigger', 'profile-dropdown');
    setupDropdown('mobile-profile-trigger', 'profile-dropdown');

    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.removeItem('sf_session'); 
        location.reload();
    });
    
    // SEARCH LISTENER
    document.getElementById('contact-search').addEventListener('input', (e) => {
        renderSidebar(e.target.value.toLowerCase());
    });

    renderMessages();

    const menuBtn = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    menuBtn.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); });
    overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); });
}

function setupDropdown(triggerId, dropdownId) {
    const trigger = document.getElementById(triggerId);
    const dropdown = document.getElementById(dropdownId);
    if(!trigger || !dropdown) return;

    trigger.addEventListener('click', (e) => {
        e.stopPropagation(); 
        dropdown.classList.toggle('hidden');
    });
    window.addEventListener('click', () => {
        if (!dropdown.classList.contains('hidden')) dropdown.classList.add('hidden');
    });
    dropdown.addEventListener('click', (e) => e.stopPropagation());
}

function renderSidebar(searchTerm = "") {
    const list = document.getElementById('faculty-list');
    const headerTitle = document.querySelector('.sidebar-header h3');
    list.innerHTML = '';
    let dataToList = [];

    if (state.currentUser.role === 'student') { headerTitle.innerText = "Faculty Members"; dataToList = state.facultyList; } 
    else if (state.currentUser.role === 'faculty') { headerTitle.innerText = "Your Students"; dataToList = state.studentList; }
    else { headerTitle.innerText = "Monitor Faculty"; dataToList = state.facultyList; }

    const filteredList = dataToList.filter(user => user.name.toLowerCase().includes(searchTerm));

    filteredList.forEach(user => {
        const item = document.createElement('div');
        const isActive = state.selectedContact?.email === user.email ? 'active' : '';
        item.className = `faculty-item ${isActive}`;
        item.onclick = () => selectContact(user);
        item.innerHTML = `
            <div class="f-avatar">${user.name.charAt(0)}<div class="status-dot ${user.status}"></div></div>
            <div class="f-info"><h4>${user.name}</h4><small style="color:#666; font-size:0.7rem;">${user.role}</small></div>
        `;
        list.appendChild(item);
    });
}

function selectContact(user) {
    state.selectedContact = user;
    renderSidebar(document.getElementById('contact-search').value.toLowerCase());
    document.getElementById('current-chat-name').innerText = user.name;
    document.getElementById('current-chat-avatar').innerText = user.name.charAt(0);
    document.querySelector('.chat-navbar .status').innerText = user.status === 'online' ? 'Online' : 'Offline';
    renderMessages();
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
}

function getStatusIcon(status) {
    if (status === 'sent') return `<span class="msg-ticks"><span class="material-symbols-outlined">check</span></span>`;
    if (status === 'delivered') return `<span class="msg-ticks"><span class="material-symbols-outlined">done_all</span></span>`;
    if (status === 'seen') return `<span class="msg-ticks seen"><span class="material-symbols-outlined">done_all</span></span>`;
    return '';
}

function renderMessages() {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';

    if (!state.selectedContact) {
        // EMPTY STATE BRAND CHANGE
        container.innerHTML = `
            <div class="empty-state">
                <h2 class="empty-brand">Silent<span class="neon-text">Flux</span></h2>
                <p class="empty-text">Send message with privacy</p>
            </div>
        `;
        return;
    }

    const myEmail = state.currentUser.email;
    const theirEmail = state.selectedContact.email;

    const chatMessages = state.messages.filter(m => 
        (m.senderEmail === myEmail && m.receiverEmail === theirEmail) ||
        (m.senderEmail === theirEmail && m.receiverEmail === myEmail)
    );

    if (chatMessages.length === 0) {
        container.innerHTML = `<div class="empty-state" style="text-align:center; color:#888; margin-top:20px;">Start conversation with ${state.selectedContact.name}</div>`;
    }

    chatMessages.forEach(msg => {
        const isFromSelf = msg.senderEmail === myEmail;
        const div = document.createElement('div');
        div.className = `message ${isFromSelf ? 'msg-sent' : 'msg-received'}`;
        const ticks = isFromSelf ? getStatusIcon(msg.status || 'sent') : '';
        const timeOnly = msg.timestamp.includes(',') ? msg.timestamp.split(',')[1] : msg.timestamp;
        div.innerHTML = `${msg.text}<span class="msg-meta">${timeOnly} ${ticks}</span>`;
        container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
}

const msgInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

function sendMessage() {
    const text = msgInput.value.trim();
    if (!text || !state.selectedContact) return;

    const msgId = Date.now();
    const timeString = new Date().toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

    const newMsg = {
        id: msgId,
        senderEmail: state.currentUser.email, 
        receiverEmail: state.selectedContact.email, 
        receiverName: state.selectedContact.name,
        text: text,
        timestamp: timeString, // Save Full Date/Time
        status: 'sent'
    };

    state.messages.push(newMsg);
    saveState();
    msgInput.value = '';
    renderMessages();

    setTimeout(() => { updateMessageStatus(msgId, 'delivered'); }, 1500);
    setTimeout(() => { updateMessageStatus(msgId, 'seen'); }, 3000);
}

function updateMessageStatus(id, newStatus) {
    const msg = state.messages.find(m => m.id === id);
    if (msg) {
        msg.status = newStatus;
        saveState();
        if (state.selectedContact) renderMessages();
    }
}

sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

/* ==================== ADMIN ==================== */
const adminModal = document.getElementById('admin-modal');
const adminBtn = document.getElementById('admin-view-btn');
const closeAdmin = document.getElementById('close-admin');
const logsBody = document.getElementById('admin-logs-body');
const resetBtn = document.getElementById('reset-data-btn');

adminBtn.addEventListener('click', () => { adminModal.classList.remove('hidden'); updateAdminLogs(); });
closeAdmin.addEventListener('click', () => { adminModal.classList.add('hidden'); });

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (confirm("Reset ALL data?")) {
            localStorage.removeItem('sf_messages');
            sessionStorage.clear();
            state.messages = [];
            state.isAuthenticated = false;
            state.currentUser = null;
            location.reload();
        }
    });
}

// TOGGLE VIEW
window.toggleText = function(btn) {
    const row = btn.closest('td');
    const preview = row.querySelector('.preview');
    const full = row.querySelector('.full-text');
    
    if (full.classList.contains('hidden')) {
        full.classList.remove('hidden');
        preview.classList.add('hidden');
        btn.innerText = 'Hide';
    } else {
        full.classList.add('hidden');
        preview.classList.remove('hidden');
        btn.innerText = 'View';
    }
}

// DELETE MESSAGE
window.deleteMessage = function(id) {
    if(confirm("Are you sure you want to delete this message?")) {
        state.messages = state.messages.filter(m => m.id !== id);
        saveState();
        updateAdminLogs(); 
        renderMessages();
    }
}

function updateAdminLogs() {
    logsBody.innerHTML = '';
    state.messages.forEach(msg => {
        const row = document.createElement('tr');
        
        let msgDisplay = msg.text;
        // Truncate logic
        if (msg.text.length > 40) {
            msgDisplay = `
                <span class="preview">${msg.text.substring(0, 40)}...</span>
                <span class="full-text hidden">${msg.text}</span>
                <button class="expand-btn" onclick="toggleText(this)">View</button>
            `;
        }

        row.innerHTML = `
            <td style="font-size: 0.8rem; color: #888;">${msg.timestamp}</td>
            <td style="color:var(--primary)">${msg.senderEmail}</td>
            <td>${msg.receiverEmail}</td>
            <td style="color:#aaa">${msgDisplay}</td>
            <td>
                <button class="delete-icon-btn" onclick="deleteMessage(${msg.id})">
                    <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                </button>
            </td>
        `;
        logsBody.appendChild(row);
    });
}

if (state.isAuthenticated && state.currentUser) {
    authSection.classList.remove('active');
    appSection.classList.add('active');
    window.setRole(state.role);
    initApp();
}