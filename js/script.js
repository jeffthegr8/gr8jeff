
// ======================================
// GR8JEFF SUPABASE CONFIGURATION
// ======================================

const SUPABASE_URL = "https://ulwohrvxkcwlqfmjbctb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vY-SuuigMN-wVYytODKAbg_rkO1nftJ";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// ======================================
// MOBILE NAVIGATION
// ======================================

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });

    document.querySelectorAll("#navMenu a").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
        });
    });
}

// ======================================
// FOOTER YEAR
// ======================================

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// ======================================
// PROJECT ENQUIRY SUBMISSION
// ======================================

const projectForm = document.getElementById("projectForm");

if (projectForm) {

    projectForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const submitButton = projectForm.querySelector(
            'button[type="submit"]'
        );

        const formMessage = document.getElementById("formMessage");

if (!formMessage) {
    console.error("Missing formMessage element in index.html");
    return;
}
        const name = document.getElementById("clientName").value.trim();
        const email = document.getElementById("clientEmail").value.trim();
        const service = document.getElementById("projectType").value;
        const budget = document.getElementById("projectBudget").value;
        const message = document.getElementById("projectMessage").value.trim();

        if (!name || !email || !service || !budget || !message) {
            formMessage.textContent = "Please complete all fields.";
            formMessage.style.color = "#ff5555";
            return;
        }

        // Open WhatsApp tab during the user's click to avoid popup blocking
        const whatsappTab = window.open("about:blank", "_blank");

        submitButton.disabled = true;
        submitButton.textContent = "SENDING...";

        formMessage.textContent = "";

        try {

            // Save enquiry to Supabase
            const { error } = await supabaseClient
                .from("enquiries")
                .insert([
                    {
                        name: name,
                        email: email,
                        service: service,
                        budget: budget,
                        message: message,
                       status: "pending"
                    }
                ]);

            if (error) {
                throw error;
            }

            // Prepare WhatsApp message
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

            if (whatsappTab) {
                whatsappTab.location.href = whatsappURL;
            }

            formMessage.textContent =
                "Enquiry submitted successfully! Thank you.";

            formMessage.style.color = "#b8ff38";

            projectForm.reset();

        } catch (error) {

            if (whatsappTab) {
                whatsappTab.close();
            }

            console.error("Enquiry submission error:", error);

            formMessage.textContent =
                "Submission failed. Please try again or contact us on WhatsApp.";

            formMessage.style.color = "#ff5555";

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Send Project Enquiry ↗";

        }

    });

}
