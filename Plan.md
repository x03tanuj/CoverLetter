## Full Step List (specs only, minimal code from here)

**Phase 1 — Auth**
1. ✅ Project skeleton (done)
2. MongoDB connection (`config/db.js`, connect in `index.js`)
3. `User` model — fields: name, email, passwordHash, createdAt
4. Auth routes — `POST /auth/register`, `POST /auth/login` — bcrypt hash + compare, return JWT
5. Auth middleware — verify JWT from `Authorization` header, attach `req.userId`
6. Test both routes in Postman/Thunder Client before moving on

**Phase 2 — Resume Upload & Parsing**
7. `multer` setup — accept PDF/docx upload, store in `/uploads` or memory buffer
8. `Resume` model — fields: userId, rawText, uploadedAt
9. Parsing logic — `pdf-parse` for PDF, `mammoth` for docx → extract raw text
10. Route `POST /resume/upload` (protected) — parse, save rawText, return resume id
11. Test upload with a real resume file, confirm rawText looks clean

**Phase 3 — LLM Integration (core)**
12. Groq account + API key → add to `.env`
13. Standalone test script (not a route yet) — hardcode a sample prompt, call Groq API, log response. Confirm it works in isolation before wiring into the app
14. Design the actual system + user prompt template (as text, decide wording)
15. `services/llmService.js` — function `generateCoverLetter(promptData)` wrapping the Groq call

**Phase 4 — Cover Letter Generation Route**
16. `CoverLetter` model — fields: userId, jobTitle, company, jobDescriptionText, resumeIdUsed, generatedText, editedText, status, createdAt
17. Route `POST /cover-letter/generate` (protected) — takes jobTitle, company, jobDescriptionText, resumeId → fetch resume text → build prompt → call llmService → save + return result
18. Test end-to-end with Postman using a real resume + real job description

**Phase 5 — CRUD for History**
19. Route `GET /cover-letter/:id`
20. Route `GET /cover-letter/` — list user's letters
21. Route `PUT /cover-letter/:id` — save edited text
22. Route `DELETE /cover-letter/:id`

**Phase 6 — Frontend (React)**
23. Vite React setup in `client/`
24. Auth pages — Register, Login, store JWT (context or localStorage)
25. Protected route wrapper
26. Input form page — job title, company, JD textarea, resume upload/select
27. Loading state during generation call
28. Result page — editable textarea, regenerate button, save button
29. History list page
30. Wire all pages to backend routes with axios/fetch

**Phase 7 — Export & Polish**
31. PDF export (client-side lib, e.g. `jspdf` or `html2pdf.js`)
32. Copy-to-clipboard button
33. Rate limiting middleware (e.g. `express-rate-limit`) on `/cover-letter/generate`
34. Basic error handling — LLM timeout/failure → user-facing error message
35. Input validation — cap job description length before sending to LLM
