Here is your finalized and updated `README.md` for the shared `footer` directory, located at:

```
/Users/conorhovis/tbh-platform/shared-ui/footer/README.md
```

---

```md
# 🧩 Shared Footer Components – `shared-ui/footer`

This directory contains the **unified, modular, and responsive** components used to build the global site footer for both the `website` and `blog`. Designed with flexibility, accessibility, and full CMS compatibility in mind, these components are part of the shared UI system for TBH Digital Solutions.

---

## 📦 Component Overview

### ✅ `Footer.tsx` / `Footer.css`
- **Purpose**:  
  Acts as the master layout for the footer section.
- **Responsibilities**:
  - Renders multiple content columns via `FooterColumn`
  - Includes contact info + social links via `FooterContactFollow`
  - Outputs the full-width disclaimer or copyright
- **Data Source**:  
  Controlled dynamically through a single `footerData` object (mock or CMS API).

---

### 🧱 `FooterColumn.tsx` / `FooterColumn.css`
- **Purpose**:  
  Reusable component to render a vertical list of links or text.
- **Props**:
  - `title`: Section title
  - `content`: Array of `{ label: string, link?: string }`
- **Features**:
  - Optional links or plain text
  - Themed styles
  - Responsive stacking on smaller breakpoints

```tsx
<FooterColumn
  title="Company"
  content={[
    { label: "About", link: "/about" },
    { label: "Careers", link: "/careers" },
  ]}
/>
```

---

### 📬 `FooterContactFollow.tsx` / `FooterContactFollow.css`
- **Purpose**:  
  Renders the "Contact Us" and "Follow Us" section of the footer.
- **Props**:
  - `contactInfo`: Array of `{ icon: string, label: string }`
  - `socialLinks`: Array of `{ icon: string, link: string }`
- **Features**:
  - Built-in icon map using FontAwesome (customizable)
  - Styled for both light/dark modes
  - Includes `aria-hidden` and keyboard accessibility

```tsx
<FooterContactFollow
  contactInfo={[
    { icon: "FaPhone", label: "(314) 123-4567" },
    { icon: "FaEnvelope", label: "contact@tbh.com" },
  ]}
  socialLinks={[
    { icon: "FaFacebookF", link: "https://facebook.com/tbh" },
    { icon: "FaLinkedinIn", link: "https://linkedin.com/company/tbh" },
  ]}
/>
```

---

### ⬛ `DynamicFullWidthBox.tsx` / `DynamicFullWidthBox.css`
- **Purpose**:  
  Renders a responsive full-width bar for legal, copyright, or disclaimers.
- **Props**:
  - `content`: Plain text or inline HTML
- **Features**:
  - Theme-aware background color
  - Auto padding and font scaling
  - Optional hover effects (disabled by default)

```tsx
<DynamicFullWidthBox content="© 2025 TBH Digital Solutions. All Rights Reserved." />
```

---

## 🗂 Directory Structure

```
footer/
├── Footer.tsx
├── Footer.css
├── FooterColumn.tsx
├── FooterColumn.css
├── FooterContactFollow.tsx
├── FooterContactFollow.css
├── DynamicFullWidthBox.tsx
├── DynamicFullWidthBox.css
├── index.ts              // Barrel export for shared import paths
└── README.md             // You're reading it :)
```

---

## ✅ Features Checklist

- [x] Fully responsive with mobile-first breakpoints
- [x] Dark mode and light mode support via root theme class
- [x] FontAwesome-based icon rendering
- [x] Designed for CMS or static mock data
- [x] Accessible layout (screen readers + keyboard)
- [x] Reusable across marketing site, blog, landing pages

---

## 📌 Usage Tip

Use a central data file to power the layout:

```ts
// shared-ui/mock/footerData.ts
export const footerData = {
  columns: [
    { title: "Company", content: [...] },
    { title: "Resources", content: [...] },
    ...
  ],
  fullWidthBox: {
    content: "© 2025 TBH Digital Solutions. All Rights Reserved."
  }
};
```

---

> 💡 **Pro tip**: You can extend each column to support images, logos, or even embedded contact forms by conditionally rendering inside `FooterColumn`.

Let us know if you want this README enhanced with diagrams or visual examples!
```

---

Would you like this committed to the project or need a version with example screenshots/mock data layout?