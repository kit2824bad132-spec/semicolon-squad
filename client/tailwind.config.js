/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Industry-grade Light-First Security Palette
        "soc-bg": "#F7F8FA",
        "soc-card": "#FFFFFF",
        "soc-subcard": "#FAFBFC",
        "soc-elevated": "#FCFDFE",
        "soc-section": "#F1F3F5",
        "soc-border": "rgba(15,23,42,0.08)",
        "soc-border-subtle": "rgba(15,23,42,0.04)",
        
        // Deep Navy & Dark Accents
        "soc-dark": "#07111F",
        "soc-navy": "#0B1930",
        "soc-charcoal": "#151B24",
        "soc-slate": "#344054",
        "soc-muted": "#667085",

        // Security Status Semantic Accents
        "sec-critical": "#B42318",
        "sec-critical-bg": "#FEF3F2",
        "sec-critical-border": "#FECDCA",
        "sec-high": "#D92D20",
        "sec-high-bg": "#FEF3F2",
        "sec-high-border": "#FECDCA",
        "sec-medium": "#DC6803",
        "sec-medium-bg": "#FFFAEB",
        "sec-medium-border": "#FEDF89",
        "sec-low": "#1570EF",
        "sec-low-bg": "#EFF8FF",
        "sec-low-border": "#B2DDFF",
        "sec-success": "#027A48",
        "sec-success-bg": "#ECFDF3",
        "sec-success-border": "#ABE5C6",
        "sec-info": "#175CD3",
        "sec-info-bg": "#EFF8FF",
        "sec-info-border": "#B2DDFF",

        // Legacy compatibility
        "dark-primary": "#07111F",
        "dark-navy": "#0B1930",
        "dark-charcoal": "#151B24",
        "white-base": "#F7F8FA",
        "white-elevated": "#FFFFFF",
      },
      boxShadow: {
        "soc-sm": "0 2px 8px rgba(15, 23, 42, 0.04)",
        "soc-card": "0 4px 20px rgba(15, 23, 42, 0.04)",
        "soc-panel": "0 12px 40px rgba(15, 23, 42, 0.06)",
        "soc-elevated": "0 20px 50px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        "soc-control": "8px",
        "soc-card": "12px",
        "soc-panel": "16px",
      },
      fontFamily: {
        "sans": ["Inter", "Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "mono": ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      }
    },
  },
  plugins: [],
};
