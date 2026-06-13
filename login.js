function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  if (!name || !email || !password) {
    msg.innerText = "Please fill all fields.";
    return;
  }

  localStorage.setItem("name", name);
  localStorage.setItem("email", email);
  localStorage.setItem("password", password);

  msg.innerText = "Demo account created. Now login.";
}

function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const savedEmail = localStorage.getItem("email");
  const savedPassword = localStorage.getItem("password");
  const msg = document.getElementById("msg");

  if (email === savedEmail && password === savedPassword) {
    window.location.href = "index.html";
  } else {
    msg.innerText = "Wrong email or password.";
  }
      }
