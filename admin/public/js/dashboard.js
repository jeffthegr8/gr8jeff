const sessionData = sessionStorage.getItem("gr8jeff_admin_session");
const userData = sessionStorage.getItem("gr8jeff_admin_user");

if (!sessionData || !userData) {
  window.location.replace("index.html");
} else {
  try {
    const session = JSON.parse(sessionData);
    const user = JSON.parse(userData);

    if (!session.access_token || !user.id) {
      throw new Error("Invalid session");
    }

    document.getElementById("adminEmail").textContent = user.email;
  } catch (error) {
    sessionStorage.removeItem("gr8jeff_admin_session");
    sessionStorage.removeItem("gr8jeff_admin_user");
    window.location.replace("index.html");
  }
}

// LOGOUT
document.getElementById("logoutButton").addEventListener("click", () => {
  sessionStorage.removeItem("gr8jeff_admin_session");
  sessionStorage.removeItem("gr8jeff_admin_user");

  window.location.replace("index.html");
});

// SIDEBAR NAVIGATION
const navigationButtons = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".dashboard-section");
const pageTitle = document.getElementById("pageTitle");

navigationButtons.forEach(button => {
  button.addEventListener("click", () => {
    const target = button.dataset.section;

    navigationButtons.forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    sections.forEach(section => {
      section.classList.remove("active");
    });

    document.getElementById(target).classList.add("active");

    pageTitle.textContent =
      target.charAt(0).toUpperCase() + target.slice(1);
  });
});

// QUICK NAVIGATION BUTTONS
document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    const target = button.dataset.go;

    document.querySelector(`[data-section="${target}"]`).click();
  });
});