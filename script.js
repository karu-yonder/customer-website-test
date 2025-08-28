// Get URL parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Get current subpath from URL
function getCurrentSubpath() {
    const path = window.location.pathname;
    // Extract subpath after the repository name
    const repoPath = '/customer-website-test';
    if (path.startsWith(repoPath)) {
        const subpath = path.substring(repoPath.length).replace(/^\/+|\/+$/g, '');
        return subpath;
    }
    return '';
}

// Update the URL path dynamically
function updatePath() {
    const env = document.getElementById("env").value;
    const id = document.getElementById("id").value;
    const subpath = document.getElementById("subpath").value.trim();

    if (!env || !id) {
        alert("Please fill in Environment and ID fields");
        return;
    }

    // Build the new URL with full repository path
    let newPath = window.location.origin + '/customer-website-test';

    // Add subpath if provided
    if (subpath) {
        // Clean the subpath (remove leading/trailing slashes)
        const cleanSubpath = subpath.replace(/^\/+|\/+$/g, "");
        newPath += "/" + cleanSubpath;
    }

    // Add query parameters
    newPath +=
        "?env=" + encodeURIComponent(env) + "&id=" + encodeURIComponent(id);

    // Update the URL without reloading the page
    window.history.pushState({}, "", newPath);

    // Load widget if environment and ID are set
    if (env && id) {
        loadWidget(env, id);
    }
}

// Load the widget script
function loadWidget(env, id) {
    // Remove existing widget script if any
    const existingScript = document.querySelector(
        'script[src*="widget.yonderhq.com"]'
    );
    if (existingScript) {
        existingScript.remove();
    }

    // Set client code
    window.YONDER__CLIENT_CODE = id;

    // Determine script URL based on environment
    let scriptUrl;
    switch (env) {
        case "dev":
            scriptUrl = "https://dev.widget.yonderhq.com/main.js";
            break;
        case "staging":
            scriptUrl = "https://staging.widget.yonderhq.com/main.js";
            break;
        case "prod":
            scriptUrl = "https://widget.yonderhq.com/main.js";
            break;
        default:
            scriptUrl = "https://staging.widget.yonderhq.com/main.js";
    }

    // Create and load new script
    const script = document.createElement("script");
    script.src = scriptUrl;
    document.head.appendChild(script);
}

// Initialize the form with current values
function initializeForm() {
    const env = getQueryParam("env");
    const id = getQueryParam("id");
    const subpath = getCurrentSubpath();

    if (env) {
        document.getElementById("env").value = env;
    }

    if (id) {
        document.getElementById("id").value = id;
    }

    if (subpath) {
        document.getElementById("subpath").value = subpath;
    }

    // Load widget if we have env and id
    if (env && id) {
        loadWidget(env, id);
    }
}

// Handle browser back/forward buttons
window.addEventListener("popstate", function () {
    initializeForm();
});

// Handle page refresh - redirect to base repository URL
let isPageVisible = true;

// Detect when page becomes hidden (refresh, close, etc.)
document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        isPageVisible = false;
    }
});

// When page becomes visible again, check if we need to redirect
window.addEventListener("focus", function () {
    if (!isPageVisible) {
        const currentPath = window.location.pathname;
        const basePath = "/customer-website-test";

        // If we're on a subpath and this was a refresh, redirect to base
        if (currentPath !== basePath && currentPath !== basePath + "/") {
            window.location.href = window.location.origin + basePath;
        }
        isPageVisible = true;
    }
});

// Initialize when page loads
document.addEventListener("DOMContentLoaded", initializeForm);

// Update when subpath input changes
document.getElementById("subpath").addEventListener("input", updatePath);
