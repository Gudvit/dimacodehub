// Applies the theme picked with the header toggle before the first paint, so a visitor who
// chose dark on a light system never sees a white flash. A file rather than an inline
// script: the CSP allows no inline script. The key is THEME_STORAGE_KEY in
// `src/app/components/theme-toggle/theme-toggle.component.ts`.
try {
  const theme = localStorage.getItem("theme");
  if (theme === "light" || theme === "dark") {
    document.documentElement.dataset.theme = theme;
  }
} catch {
  // Storage is off: the system setting decides, through CSS alone.
}
