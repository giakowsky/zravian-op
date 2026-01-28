// ==UserScript==
// @name         Zravian Utility - Farm Finder Button (FIXED)
// @namespace    http://tampermonkey.net/
// @version      2026-01-28
// @description  Farm Finder with visible toggle button on the right UI panel.
// @author       Enrico Cruz
// @match        https://*.zravian.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (!location.href.includes("karte.php")) return;

    console.log("[FarmFinder] Initializing...");

    // ⏳ WAIT FOR RIGHT SIDEBAR
    const wait = setInterval(() => {
        const sidebar =
            document.querySelector("#sidebarBox") ||
            document.querySelector(".sidebarBox") ||
            document.querySelector("#rightSide") ||
            document.querySelector(".rightSide");

        if (!sidebar) return;

        clearInterval(wait);
        initUI(sidebar);
    }, 300);

    let enabled = false;
    let observer = null;

    function initUI(container) {
        console.log("[FarmFinder] Sidebar found, creating button");

        const button = document.createElement("button");
        button.textContent = "Farm Finder OFF";
        button.style.width = "100%";
        button.style.margin = "8px 0";
        button.style.padding = "8px";
        button.style.fontWeight = "bold";
        button.style.background = "#444";
        button.style.color = "#fff";
        button.style.border = "2px solid #000";
        button.style.borderRadius = "6px";
        button.style.cursor = "pointer";

        container.prepend(button);

        button.addEventListener("click", () => {
            enabled = !enabled;
            button.textContent = enabled ? "Farm Finder ON" : "Farm Finder OFF";
            button.style.background = enabled ? "#27ae60" : "#444";

            enabled ? startFinder() : stopFinder();
        });
    }

    function startFinder() {
        console.log("[FarmFinder] ENABLED");

        observer = new MutationObserver(scanMap);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        scanMap();
    }

    function stopFinder() {
        console.log("[FarmFinder] DISABLED");

        if (observer) observer.disconnect();

        document.querySelectorAll("td").forEach(td => {
            td.style.outline = "";
            td.style.backgroundColor = "";
        });
    }

    function scanMap() {
        if (!enabled) return;

        const tiles = document.querySelectorAll("a[href*='karte.php']");
        if (!tiles.length) return;

        tiles.forEach(tile => {
            const tooltip =
                tile.getAttribute("data-tooltip") ||
                tile.getAttribute("title") ||
                "";

            if (!tooltip) return;

            const text = tooltip.toLowerCase();
            const td = tile.closest("td");
            if (!td) return;

            if (text.includes("unoccupied oasis")) {
                td.style.outline = "3px solid lime";
                td.style.backgroundColor = "rgba(0,255,0,0.35)";
                return;
            }

            if (text.includes("abandoned")) {
                td.style.outline = "3px solid red";
                td.style.backgroundColor = "rgba(255,0,0,0.35)";
                return;
            }

            if (text.includes("inactive")) {
                td.style.outline = "3px solid gold";
                td.style.backgroundColor = "rgba(255,215,0,0.35)";
                return;
            }
        });
    }
})();
