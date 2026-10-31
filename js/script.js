const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});

document.querySelectorAll("#navMenu a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
    });
});

document.getElementById("year").textContent =
    new Date().getFullYear();const projectForm = document.getElementById("projectForm");

if (projectForm) {
    projectForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("clientName").value.trim();
        const email = document.getElementById("clientEmail").value.trim();
        const service = document.getElementById("projectType").value;
        const budget = document.getElementById("projectBudget").value;
        const message = document.getElementById("projectMessage").value.trim();

        const enquiry = `Hello GR8JEFF!

I have a project enquiry.

Name: ${name}
Email: ${email}
Service: ${service}
Budget: ${budget}

Project details:
${message}`;

        const whatsappURL =
            "https://wa.me/254741055452?text=" +
            encodeURIComponent(enquiry);

        window.open(whatsappURL, "_blank");
    });
}