# Next.js: ALWAYS prioritize local documentation before coding

## Critical Engineering Constraints
- Use Next.js App Router (the `src/app/` directory). NEVER use the `pages/` directory.
- Keep components as Server Components by default. Add 'use client' strictly at leaf interactive boundaries.
- For data mutations, utilize Server Actions marked with "use server" at the top of the file.
- Validate all incoming parameters and request bodies using Zod schemas.
- Read up-to-date documentation locally at `node_modules/next/dist/docs/` before making architectural decisions.

- **Framework Context**: This is a Next.js App Router project using TypeScript.
- **Rules**: Always prefer Server Components over Client Components unless state/interactivity is mandatory.
- **Tech Stack Constraints**: Do not use deprecated `getServerSideProps`. Use Zod for type validation.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
