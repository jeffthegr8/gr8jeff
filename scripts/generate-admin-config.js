const fs = require("node:fs");
const path = require("node:path");

const apiBaseUrl = process.env.GR8JEFF_API_BASE_URL?.trim();

if (!apiBaseUrl) {
  throw new Error("GR8JEFF_API_BASE_URL must be set in the Netlify environment.");
}

let parsedApiUrl;

try {
  parsedApiUrl = new URL(apiBaseUrl);
} catch {
  throw new Error("GR8JEFF_API_BASE_URL must be a valid absolute URL.");
}

if (parsedApiUrl.protocol !== "https:") {
  throw new Error("GR8JEFF_API_BASE_URL must use HTTPS.");
}

if (
  parsedApiUrl.pathname !== "/" ||
  parsedApiUrl.username ||
  parsedApiUrl.password ||
  parsedApiUrl.search ||
  parsedApiUrl.hash
) {
  throw new Error("GR8JEFF_API_BASE_URL must be an HTTPS origin without credentials, path, query, or hash.");
}

const normalizedApiBaseUrl = parsedApiUrl.origin;
const configPath = path.join(__dirname, "..", "admin", "public", "js", "api-config.js");
const config = `window.GR8JEFF_CONFIG = Object.freeze({ apiBaseUrl: ${JSON.stringify(normalizedApiBaseUrl)} });\n`;

fs.writeFileSync(configPath, config);
