This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
vix_tool
├─ .agents
│  └─ RULE.md
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ (portal)
│  │  │  ├─ page.module.css
│  │  │  ├─ page.tsx
│  │  │  └─ select-department
│  │  │     └─ page.tsx
│  │  ├─ bgd
│  │  │  ├─ access-control
│  │  │  │  ├─ page.module.css
│  │  │  │  └─ page.tsx
│  │  │  ├─ departments
│  │  │  │  ├─ page.module.css
│  │  │  │  └─ page.tsx
│  │  │  ├─ hr
│  │  │  │  ├─ page.module.css
│  │  │  │  └─ page.tsx
│  │  │  ├─ layout.module.css
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.module.css
│  │  │  └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ nv
│  │     ├─ dashboard
│  │     │  └─ page.tsx
│  │     ├─ layout.tsx
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ bgd
│  │  │  ├─ AccessControl
│  │  │  │  ├─ AccountList.module.css
│  │  │  │  ├─ AccountList.tsx
│  │  │  │  ├─ PermissionModal.module.css
│  │  │  │  └─ PermissionModal.tsx
│  │  │  ├─ Employee
│  │  │  │  ├─ CreateEmployeeModal.module.css
│  │  │  │  ├─ CreateEmployeeModal.tsx
│  │  │  │  └─ EditEmployeeModal.tsx
│  │  │  ├─ Header
│  │  │  │  ├─ Header.module.css
│  │  │  │  └─ Header.tsx
│  │  │  └─ Sidebar
│  │  │     ├─ Sidebar.module.css
│  │  │     └─ Sidebar.tsx
│  │  ├─ nv
│  │  │  └─ Sidebar
│  │  │     ├─ Sidebar.module.css
│  │  │     └─ Sidebar.tsx
│  │  └─ shared
│  │     ├─ Button
│  │     │  ├─ Button.module.css
│  │     │  └─ Button.tsx
│  │     ├─ Input
│  │     │  ├─ Input.module.css
│  │     │  └─ Input.tsx
│  │     ├─ Modal
│  │     │  ├─ Modal.module.css
│  │     │  └─ Modal.tsx
│  │     ├─ Notification
│  │     │  ├─ Notification.module.css
│  │     │  └─ Notification.tsx
│  │     ├─ Select
│  │     │  ├─ Select.module.css
│  │     │  └─ Select.tsx
│  │     └─ Table
│  │        ├─ Table.module.css
│  │        └─ Table.tsx
│  ├─ hooks
│  │  ├─ useNotification.ts
│  │  └─ usePermission.ts
│  ├─ lib
│  │  └─ api
│  │     ├─ auth.api.ts
│  │     ├─ client.ts
│  │     ├─ hr.api.ts
│  │     └─ permission.api.ts
│  ├─ middleware.ts
│  ├─ stores
│  │  ├─ auth.store.ts
│  │  └─ permission.store.ts
│  └─ types
│     ├─ api.types.ts
│     ├─ auth.types.ts
│     ├─ hr.types.ts
│     └─ permission.types.ts
└─ tsconfig.json

```