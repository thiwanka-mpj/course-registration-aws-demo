/**
 * app.js — Course Registration Frontend
 * Handles card click → course page navigation
 */

const COURSE_ROUTES = {
  "work-1": "/courses/course1",
  "work-2": "/courses/course2",
  "work-3": "/courses/course3",
  "work-4": "/courses/course4",
  "work-5": "/courses/course5",
  "work-6": "/courses/course6",
};

document.addEventListener("DOMContentLoaded", () => {
  // Attach click listeners to every course card
  Object.entries(COURSE_ROUTES).forEach(([cardId, route]) => {
    const card = document.getElementById(cardId);
    if (!card) return;

    const handler = () => {
      card.style.opacity = "0.7";
      card.style.transform = "scale(0.98)";
      setTimeout(() => { window.location.href = route; }, 200);
    };

    // Click anywhere on the card
    card.addEventListener("click", handler);

    // Keyboard accessibility
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View ${card.querySelector(".card-title")?.textContent}`);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler();
      }
    });
  });
});
