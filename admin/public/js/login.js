
const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginButton.disabled = true;
  loginButton.textContent = "SIGNING IN...";
  loginMessage.textContent = "";

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Login failed");
    }

    // Keep the session for this browser tab
    sessionStorage.setItem("gr8jeff_admin_session", JSON.stringify(result.session));
    sessionStorage.setItem("gr8jeff_admin_user", JSON.stringify(result.user));

    loginMessage.style.color = "#b8ff38";
    loginMessage.textContent = "Login successful. Redirecting...";

    window.location.href = "dashboard.html";

  } catch (error) {
    loginMessage.style.color = "#ff5555";
    loginMessage.textContent = error.message;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "SIGN IN";
  }
});
