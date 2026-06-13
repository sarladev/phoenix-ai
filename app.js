const username = localStorage.getItem("name") || "Guest";
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

  if (!question && !photo) return;

  addMessage(question || "Photo uploaded", "user-msg");

  const thinking = addMessage("Phoenix AI is thinking...", "ai-msg thinking");

  setTimeout(() => {
    thinking.classList.remove("thinking");
    thinking.innerText =
      "Demo mode: GitHub Pages par backend/API nahi chalta. Full AI answer ke liye backend hosting chahiye.";

    const oldChats = JSON.parse(localStorage.getItem("phoenixChats")) || [];
    oldChats.push({
      question: question || "Photo uploaded",
      answer: thinking.innerText,
      time: new Date().toLocaleString()
    });

    localStorage.setItem("phoenixChats", JSON.stringify(oldChats));
  }, 1200);

  questionBox.value = "";
  photoInput.value = "";
}

function clearChat() {
  localStorage.removeItem("phoenixChats");
  location.reload();
}

function logout() {
  localStorage.removeItem("name");
  localStorage.removeItem("phoenixChats");
  window.location.href = "login.html";
}
