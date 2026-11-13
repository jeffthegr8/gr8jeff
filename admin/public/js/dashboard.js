
// ==========================================
// GR8JEFF ADMIN DASHBOARD
// Supabase integration
// ==========================================

// SUPABASE CONFIGURATION
const SUPABASE_URL = "https://ulwohrvxkcwlqfmjbctb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vY-SuuigMN-wVYytODKAbg_rkO1nftJ";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ==========================================
// ADMIN SESSION PROTECTION
// ==========================================

const sessionData = sessionStorage.getItem("gr8jeff_admin_session");
const userData = sessionStorage.getItem("gr8jeff_admin_user");

let adminUser = null;

if (!sessionData || !userData) {
  window.location.replace("index.html");
} else {
  try {
    const session = JSON.parse(sessionData);
    adminUser = JSON.parse(userData);

    if (!session.access_token || !session.refresh_token || !adminUser.id) {
      throw new Error("Invalid session");
    }

    document.getElementById("adminEmail").textContent =
      adminUser.email || "Administrator";

    // Restore the authenticated Supabase session
    supabaseClient.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });

  } catch (error) {
    console.error("Session error:", error);

    sessionStorage.removeItem("gr8jeff_admin_session");
    sessionStorage.removeItem("gr8jeff_admin_user");

    window.location.replace("index.html");
  }
}

// ==========================================
// LOGOUT
// ==========================================

document.getElementById("logoutButton").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();

  sessionStorage.removeItem("gr8jeff_admin_session");
  sessionStorage.removeItem("gr8jeff_admin_user");

  window.location.replace("index.html");
});

// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

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

// QUICK NAVIGATION
document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    const target = button.dataset.go;
    document.querySelector(`[data-section="${target}"]`)?.click();
  });
});

// ==========================================
// ENQUIRY DISPLAY HELPERS
// ==========================================

function createCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value ?? "—";
  return cell;
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function renderEnquiries(container, enquiries, allowStatusChange = false) {
  if (!container) return;

  container.replaceChildren();

  if (!enquiries.length) {
    const message = document.createElement("p");
    message.textContent = "No enquiries found.";
    container.appendChild(message);
    return;
  }

  const table = document.createElement("table");
  table.className = "enquiries-table";

  const headers = [
    "Client",
    "Email",
    "Service",
    "Budget",
    "Date",
    "Status",
    "Details"
  ];

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  headers.forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  enquiries.forEach(enquiry => {
    const row = document.createElement("tr");

    row.appendChild(createCell(enquiry.name));
    row.appendChild(createCell(enquiry.email));
    row.appendChild(createCell(enquiry.service));
    row.appendChild(createCell(enquiry.budget));
    row.appendChild(createCell(formatDate(enquiry.created_at)));

    const statusCell = document.createElement("td");

    if (allowStatusChange) {
      const statusSelect = document.createElement("select");

      ["pending", "contacted", "completed", "cancelled"].forEach(status => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusSelect.appendChild(option);
      });

      statusSelect.value = enquiry.status || "pending";

      statusSelect.addEventListener("change", async () => {
        statusSelect.disabled = true;

        try {
          const nextStatus = statusSelect.value;
          const { error } = await supabaseClient
            .from("enquiries")
            .update({ status: nextStatus })
            .eq("id", enquiry.id);

          if (error) {
            console.error("Status update error:", error);
            alert("Could not update enquiry status. Please try again.");
            statusSelect.value = enquiry.status || "pending";
          } else {
            enquiry.status = nextStatus;
            await loadDashboardData();
          }
        } catch (error) {
          console.error("Status update error:", error);
          alert("Could not update enquiry status. Please try again.");
          statusSelect.value = enquiry.status || "pending";
        } finally {
          statusSelect.disabled = false;
        }
      });

      statusCell.appendChild(statusSelect);
    } else {
      statusCell.textContent = enquiry.status || "pending";
    }

    row.appendChild(statusCell);

    const detailsCell = document.createElement("td");
    const detailsButton = document.createElement("button");

    detailsButton.type = "button";
    detailsButton.textContent = "View";
    detailsButton.className = "details-button";
    detailsButton.setAttribute("aria-label", `View enquiry details for ${enquiry.name}`);

    detailsButton.addEventListener("click", () => {
      showEnquiryDetails(enquiry, detailsButton);
    });

    detailsCell.appendChild(detailsButton);
    row.appendChild(detailsCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// ==========================================
// LOAD DASHBOARD DATA
// ==========================================

let allEnquiries = [];

async function loadDashboardData() {
  const recentContainer =
    document.getElementById("recentEnquiriesContainer");

  const enquiriesContainer =
    document.getElementById("enquiriesTableContainer");

  try {
    const { data: enquiries, error } = await supabaseClient
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    allEnquiries = enquiries || [];

    const total = enquiries.length;

    const pending = enquiries.filter(
      item => item.status === "pending"
    ).length;

    const completed = enquiries.filter(
      item => item.status === "completed"
    ).length;

    // UPDATE STATISTICS
    document.getElementById("totalEnquiries").textContent = total;
    document.getElementById("pendingEnquiries").textContent = pending;
    document.getElementById("completedEnquiries").textContent = completed;

    const portfolioCount = document.getElementById("portfolioCount");

    if (portfolioCount) {
      const { count, error } = await supabaseClient
        .from("portfolio")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Portfolio count error:", error);
      } else {
        portfolioCount.textContent = count;
      }
    }

    // RECENT ENQUIRIES
    renderEnquiries(
      recentContainer,
      enquiries.slice(0, 5)
    );

    // ALL ENQUIRIES WITH STATUS MANAGEMENT
    filterEnquiries();

  } catch (error) {
    console.error("Dashboard loading error:", error);

    if (recentContainer) {
      recentContainer.textContent =
        "Could not load recent enquiries. Check your Supabase connection and permissions.";
    }

    if (enquiriesContainer) {
      enquiriesContainer.textContent =
        "Could not load enquiries. Check your Supabase connection and permissions.";
    }
  }
}

// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

async function initializeDashboard() {
  const session = JSON.parse(sessionData || "null");

  if (!session) return;

  const { error } = await supabaseClient.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  });

  if (error) {
    console.error("Supabase authentication error:", error);
    sessionStorage.removeItem("gr8jeff_admin_session");
    sessionStorage.removeItem("gr8jeff_admin_user");
    window.location.replace("index.html");
    return;
  }

  await loadDashboardData();
}

initializeDashboard();

const enquirySearch = document.getElementById("enquirySearch");
const enquiryStatusFilter = document.getElementById("enquiryStatusFilter");

function filterEnquiries() {
  if (!enquirySearch || !enquiryStatusFilter) return;

  const searchTerm = enquirySearch.value.toLowerCase().trim();
  const selectedStatus = enquiryStatusFilter.value;

  const filtered = allEnquiries.filter(enquiry => {
    const matchesSearch =
      (enquiry.name || "").toLowerCase().includes(searchTerm) ||
      (enquiry.email || "").toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" || enquiry.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  renderEnquiries(
    document.getElementById("enquiriesTableContainer"),
    filtered,
    true
  );
}

if (enquirySearch && enquiryStatusFilter) {
  enquirySearch.addEventListener("input", filterEnquiries);
  enquiryStatusFilter.addEventListener("change", filterEnquiries);
}

const enquiryModal = document.getElementById("enquiryModal");
const closeEnquiryModalButton = document.getElementById("closeEnquiryModal");
let modalTrigger = null;

function showEnquiryDetails(enquiry, trigger) {
  document.getElementById("detailName").textContent = enquiry.name || "—";
  document.getElementById("detailEmail").textContent = enquiry.email || "—";
  document.getElementById("detailService").textContent = enquiry.service || "—";
  document.getElementById("detailBudget").textContent = enquiry.budget || "—";
  document.getElementById("detailDate").textContent = formatDate(enquiry.created_at);
  document.getElementById("detailStatus").textContent = enquiry.status || "pending";
  document.getElementById("detailMessage").textContent = enquiry.message || "—";

  modalTrigger = trigger;
  enquiryModal.hidden = false;
  closeEnquiryModalButton.focus();
}

function closeEnquiryDetails() {
  enquiryModal.hidden = true;
  if (modalTrigger) modalTrigger.focus();
  modalTrigger = null;
}

closeEnquiryModalButton.addEventListener("click", closeEnquiryDetails);

enquiryModal.addEventListener("click", event => {
  if (event.target === enquiryModal) closeEnquiryDetails();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !enquiryModal.hidden) {
    closeEnquiryDetails();
  }
});

// ==========================================
// GR8JEFF PORTFOLIO MANAGER
// ==========================================

const portfolioForm = document.getElementById("portfolioForm");
const projectFormContainer = document.getElementById("projectFormContainer");
const portfolioProjectsContainer = document.getElementById("portfolioProjectsContainer");
const addProjectButton = document.getElementById("addProjectButton");
const cancelProjectButton = document.getElementById("cancelProjectButton");
const portfolioFormMessage = document.getElementById("portfolioFormMessage");

// OPEN NEW PROJECT FORM
addProjectButton.addEventListener("click", () => {
  portfolioForm.reset();

  document.getElementById("projectId").value = "";
  document.getElementById("projectFormTitle").textContent = "Add New Project";

  portfolioFormMessage.textContent = "";
  projectFormContainer.hidden = false;

  projectFormContainer.scrollIntoView({ behavior: "smooth" });
});

// CLOSE PROJECT FORM
cancelProjectButton.addEventListener("click", () => {
  projectFormContainer.hidden = true;
  portfolioForm.reset();
});

// GENERATE SLUG FROM TITLE
document.getElementById("projectTitle").addEventListener("input", event => {
  const projectId = document.getElementById("projectId").value;

  if (!projectId) {
    document.getElementById("projectSlug").value =
      event.target.value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
  }
});

// SAVE PROJECT
portfolioForm.addEventListener("submit", async event => {
  event.preventDefault();

  const saveButton = portfolioForm.querySelector('button[type="submit"]');

  const projectId = document.getElementById("projectId").value;

  const project = {
    title: document.getElementById("projectTitle").value.trim(),
    slug: document.getElementById("projectSlug").value.trim(),
    category: document.getElementById("projectCategory").value.trim(),
    description: document.getElementById("projectDescription").value.trim(),
    image_url: document.getElementById("projectImage").value.trim() || null,
    project_url: document.getElementById("projectUrl").value.trim() || null,
    featured: document.getElementById("projectFeatured").checked,
    published: document.getElementById("projectPublished").checked,
    updated_at: new Date().toISOString()
  };

  if (!project.title || !project.slug) {
    portfolioFormMessage.textContent = "Project title and slug are required.";
    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  try {
    let result;

    if (projectId) {
      result = await supabaseClient
        .from("portfolio")
        .update(project)
        .eq("id", projectId);
    } else {
      result = await supabaseClient
        .from("portfolio")
        .insert([project]);
    }

    if (result.error) throw result.error;

    portfolioFormMessage.textContent = "Project saved successfully!";

    portfolioForm.reset();
    projectFormContainer.hidden = true;

    await loadPortfolioProjects();
    await loadDashboardData();

  } catch (error) {
    console.error("Portfolio save error:", error);

    portfolioFormMessage.textContent =
      error.code === "23505"
        ? "This project slug already exists. Choose another."
        : "Could not save project. Check the browser console.";

  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Save Project";
  }
});

// LOAD PROJECTS
async function loadPortfolioProjects() {
  try {
    const { data: projects, error } = await supabaseClient
      .from("portfolio")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    portfolioProjectsContainer.replaceChildren();

    if (!projects.length) {
      portfolioProjectsContainer.textContent =
        "No projects yet. Click Add New Project to get started.";
      return;
    }

    projects.forEach(project => {
      const card = document.createElement("article");
      card.className = "content-card portfolio-project-card";

      const title = document.createElement("h3");
      title.textContent = project.title;

      const category = document.createElement("p");
      category.textContent = project.category || "Uncategorised";

      const status = document.createElement("p");
      status.textContent = project.published ? "Published" : "Draft";

      const description = document.createElement("p");
      description.textContent = project.description || "No description";

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => editPortfolioProject(project));

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deletePortfolioProject(project));

      card.append(title, category, status, description, editButton, deleteButton);
      portfolioProjectsContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Portfolio loading error:", error);
    portfolioProjectsContainer.textContent =
      "Could not load projects. Check your Supabase connection and permissions.";
  }
}

// EDIT PROJECT
function editPortfolioProject(project) {
  document.getElementById("projectId").value = project.id;
  document.getElementById("projectTitle").value = project.title;
  document.getElementById("projectSlug").value = project.slug;
  document.getElementById("projectCategory").value = project.category || "";
  document.getElementById("projectDescription").value = project.description || "";
  document.getElementById("projectImage").value = project.image_url || "";
  document.getElementById("projectUrl").value = project.project_url || "";
  document.getElementById("projectFeatured").checked = project.featured;
  document.getElementById("projectPublished").checked = project.published;

  document.getElementById("projectFormTitle").textContent = "Edit Project";
  portfolioFormMessage.textContent = "";

  projectFormContainer.hidden = false;
  projectFormContainer.scrollIntoView({ behavior: "smooth" });
}

// DELETE PROJECT
async function deletePortfolioProject(project) {
  const confirmed = confirm(
    `Are you sure you want to delete "${project.title}"?`
  );

  if (!confirmed) return;

  try {
    const { error } = await supabaseClient
      .from("portfolio")
      .delete()
      .eq("id", project.id);

    if (error) throw error;

    await loadPortfolioProjects();
    await loadDashboardData();

  } catch (error) {
    console.error("Portfolio deletion error:", error);
    alert("Could not delete this project.");
  }
}

// INITIAL PORTFOLIO LOAD
loadPortfolioProjects();
