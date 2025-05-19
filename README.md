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

## Custom Tailwind CSS Setup

This project uses Tailwind CSS with a custom theme based on CSS variables. The color palette (background, foreground, border, etc.) is defined in `globals.css` using CSS variables, and referenced in `tailwind.config.ts` for utility generation.

### Important Notes
- **Global styles** for background and text color are set directly in CSS using:
  ```css
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
  ```
  This is necessary because Tailwind does not generate utility classes (like `bg-background` or `text-foreground`) for custom color names based on CSS variables.
- **Do not use** `@apply bg-background text-foreground;` or `@apply border-border;` in your CSS, as these will cause build errors unless you explicitly extend the relevant keys in your Tailwind config and the utility is generated.
- For global border color, use:
  ```css
  * {
    border-color: theme('colors.border');
  }
  ```

### Troubleshooting
If you see errors about missing custom utility classes (e.g., `bg-background`, `border-border`), use direct CSS as above. This is a known limitation of Tailwind with custom color names and CSS variables.
