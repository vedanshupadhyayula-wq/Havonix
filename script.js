const socket = io();

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const nameInput = document.getElementById('name-input');
const joinBtn = document.getElementById('join-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesDiv = document.getElementById('messages');
const usersList = document.getElementById('users-list');
const currentUserSpan = document.getElementById('current-user');
const userCountSpan = document.getElementById('user-count');

let currentUserName = '';

// Join chat
joinBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (name) {
    currentUserName = name;
    socket.emit('join', name);
    loginScreen.classList.remove('active');
    chatScreen.classList.add('active');
    currentUserSpan.textContent = `You: ${name}`;
    messageInput.focus();
  }
});

nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinBtn.click();
});

// Send message
sendBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();
  if (text) {
    socket.emit('send-message', { text });
    messageInput.value = '';
    messageInput.focus();
  }
});

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendBtn.click();
});

// Receive messages
socket.on('load-messages', (messages) => {
  messages.forEach(msg => displayMessage(msg));
});

socket.on('receive-message', (message) => {
  displayMessage(message);
});

function displayMessage(message) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${message.name === currentUserName ? 'own' : 'other'}`;
  messageEl.innerHTML = `
    <div class="message-name">${message.name}</div>
    <div>${message.text}</div>
    <div class="message-time">${message.timestamp}</div>
  `;
  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// User joined
socket.on('user-joined', (data) => {
  userCountSpan.textContent = `Users: ${data.userCount}`;
  updateUsersList(data.users);
  
  const systemMsg = document.createElement('div');
  systemMsg.className = 'system-message';
  systemMsg.textContent = `${data.name} joined the chat`;
  messagesDiv.appendChild(systemMsg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// User left
socket.on('user-left', (data) => {
  userCountSpan.textContent = `Users: ${data.userCount}`;
  updateUsersList(data.users);
  
  const systemMsg = document.createElement('div');
  systemMsg.className = 'system-message';
  systemMsg.textContent = `${data.name} left the chat`;
  messagesDiv.appendChild(systemMsg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

function updateUsersList(users) {
  usersList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    usersList.appendChild(li);
  });
}
