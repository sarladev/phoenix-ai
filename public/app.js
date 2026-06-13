const token = localStorage.getItem("token");
const username = localStorage.getItem("name") || "User";

if (!token) {
  window.location.href = "login.html";
}

document.getElementById("username").innerText = username;

function addMessage(text, type) {
  const chatBox = document.getElementById("chatBox");

  const div = document.createElement("div");
  div.className = type;
  div.innerText = text;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  return div;
}

function saveChatToBrowser(question, answer) {
  const oldChats = JSON.parse(localStorage.getItem("phoenixChats")) || [];

  oldChats.push({
    question,
    answer,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("phoenixChats", JSON.stringify(oldChats));
}

function loadOldChats() {
  const chats = JSON.parse(localStorage.getItem("phoenixChats")) || [];

  chats.forEach(chat => {
    addMessage(chat.question, "user-msg");
    addMessage(chat.answer, "ai-msg");
  });
}

loadOldChats();

async function sendMessage() {
  const questionBox = document.getElementById("question");
  const photoInput = document.getElementById("photo");

  const question = questionBox.value.trim();
  const photo = photoInput.files[0];

  if (!question && !photo) {
    return;
  }

  addMessage(question || "Photo uploaded", "user-msg");

  const thinking = addMessage("Phoenix AI is thinking...", "ai-msg thinking");

  const formData = new FormData();
  formData.append("question", question);

  if (photo) {
    formData.append("photo", photo);
  }

  questionBox.value = "";
  photoInput.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    thinking.classList.remove("thinking");
    thinking.innerText = data.answer || data.error || "Something went wrong.";

    saveChatToBrowser(question || "Photo uploaded", thinking.innerText);
  } catch {
    thinking.classList.remove("thinking");
    thinking.innerText = "Server error. Please try again.";
  }
}

function clearChat() {
  localStorage.removeItem("phoenixChats");
  location.reload();
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("phoenixChats");
  window.location.href = "login.html";
}
