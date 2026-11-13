const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation");
        });
    });
}

const yearElement = document.getElementById("year");
if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
}

const projectForm = document.getElementById("projectForm");
const formMessage = document.getElementById("formMessage");

if (projectForm && formMessage) {
    projectForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = projectForm.querySelector('button[type="submit"]');
        if (!submitButton) {
            console.error("Project enquiry form is missing its submit button.");
            formMessage.textContent = "The form could not be submitted. Please contact me by email or WhatsApp.";
            formMessage.dataset.state = "error";
            return;
        }

        if (!window.supabase?.createClient) {
            console.error("Supabase client library did not load.");
            formMessage.textContent = "The enquiry service is unavailable. Please contact me by email or WhatsApp.";
            formMessage.dataset.state = "error";
            return;
        }

        const clientName = document.getElementById("clientName");
        const clientEmail = document.getElementById("clientEmail");
        const projectType = document.getElementById("projectType");
        const projectBudget = document.getElementById("projectBudget");
        const projectMessage = document.getElementById("projectMessage");

        if (!clientName || !clientEmail || !projectType || !projectBudget || !projectMessage) {
            console.error("Project enquiry form is missing required fields.");
            formMessage.textContent = "The form could not be submitted. Please contact me by email or WhatsApp.";
            formMessage.dataset.state = "error";
            return;
        }

        const name = clientName.value.trim();
        const email = clientEmail.value.trim();
        const service = projectType.value;
        const budget = projectBudget.value;
        const message = projectMessage.value.trim();

        if (!name || !email || !service || !budget || !message) {
            formMessage.textContent = "Please complete all fields before sending.";
            formMessage.dataset.state = "error";
            return;
        }

        const whatsappTab = window.open("about:blank", "_blank");
        submitButton.disabled = true;
        submitButton.textContent = "Sending enquiry…";
        formMessage.textContent = "";
        delete formMessage.dataset.state;

        try {
            const supabaseClient = window.supabase.createClient(
                "https://ulwohrvxkcwlqfmjbctb.supabase.co",
                "sb_publishable_vY-SuuigMN-wVYytODKAbg_rkO1nftJ"
            );

            const { error } = await supabaseClient
                .from("enquiries")
                .insert([{ name, email, service, budget, message, status: "pending" }]);

            if (error) {
                throw error;
            }

            const enquiry = `Hello GR8JEFF!

I have a project enquiry.

Name: ${name}
Email: ${email}
Service: ${service}
Budget: ${budget}

Project details:
${message}`;
            const whatsappURL = `https://wa.me/254741055452?text=${encodeURIComponent(enquiry)}`;

            if (whatsappTab) {
                whatsappTab.location.href = whatsappURL;
            }

            projectForm.reset();
            formMessage.textContent = "Thanks for your enquiry. It has been sent.";
            formMessage.dataset.state = "success";
        } catch (error) {
            if (whatsappTab) {
                whatsappTab.close();
            }

            console.error("Supabase enquiry submission failed:", error);
            formMessage.textContent = "Your enquiry could not be sent. Please try again or contact me by email or WhatsApp.";
            formMessage.dataset.state = "error";
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Send project enquiry <span aria-hidden="true">↗</span>';
        }
    });
}
