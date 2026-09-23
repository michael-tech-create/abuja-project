"use client";

import { createTheme } from "@mui/material/styles";

/** Green + white brand theme for AbujaRentals */
export const abujaTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0b7a3e",
      light: "#2ea05c",
      dark: "#065f2f",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0b7a3e",
      light: "#e7f6ec",
      dark: "#065f2f",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f4faf6",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f3d24",
      secondary: "#4a6b58",
    },
    success: {
      main: "#0b7a3e",
      light: "#9ad5b0",
      dark: "#065f2f",
    },
    info: {
      main: "#0288d1",
      light: "#81d4fa",
      dark: "#01579b",
    },
    warning: {
      main: "#ed6c02",
      light: "#ffcc80",
      dark: "#e65100",
    },
    error: {
      main: "#d32f2f",
      light: "#ef9a9a",
      dark: "#c62828",
    },
    divider: "rgba(11, 122, 62, 0.16)",
  },
  typography: {
    fontFamily: "var(--font-sans), 'DM Sans', system-ui, sans-serif",
    h1: { fontFamily: "var(--font-heading), Fraunces, serif", fontWeight: 600 },
    h2: { fontFamily: "var(--font-heading), Fraunces, serif", fontWeight: 600 },
    h3: { fontFamily: "var(--font-heading), Fraunces, serif", fontWeight: 600 },
    h4: { fontFamily: "var(--font-heading), Fraunces, serif", fontWeight: 600 },
    h5: { fontFamily: "var(--font-heading), Fraunces, serif", fontWeight: 600 },
    h6: { fontFamily: "var(--font-heading), Fraunces, serif", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(11, 122, 62, 0.14)",
          boxShadow: "0 12px 40px -24px rgba(11,122,62,0.28)",
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
        colorSecondary: {
          backgroundColor: "#e7f6ec",
          color: "#0b7a3e",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        contained: {
          "&:hover": { backgroundColor: "#065f2f" },
        },
        outlined: {
          borderColor: "#0b7a3e",
          color: "#0b7a3e",
          backgroundColor: "#ffffff",
          "&:hover": {
            borderColor: "#065f2f",
            backgroundColor: "#e7f6ec",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: 12,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0b7a3e",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0b7a3e",
          },
        },
        notchedOutline: {
          borderColor: "#cfe8d7",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: "1px solid #cfe8d7",
          borderRadius: 14,
          boxShadow: "0 16px 40px -20px rgba(11,122,62,0.35)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "#e7f6ec",
            color: "#0b7a3e",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "#d8f0e1",
          },
          "&:hover": {
            backgroundColor: "#f0faf4",
          },
        },
      },
    },
  },
});
