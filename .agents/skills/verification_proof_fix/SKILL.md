---
name: Verification Proof and Iterative Bug Fix
description: Automatically captures logged-in feature screenshot proof after fixing bugs. Self-inspects the screenshot for font or UI errors and continues iterative fixes until 100% successful.
---

# Verification Proof and Iterative Bug Fix Skill

## Instructions

1. **Logged-in Screenshot Proof:**
   - After completing any feature fix or data restoration, ALWAYS capture full screenshot proof of the ACTUAL logged-in feature screen (e.g. populated CRM Kanban board with loaded cards and clean text).
   - NEVER present screenshots of the login screen or blank unauthenticated states.

2. **Self-Inspection & Continuous Iteration:**
   - Thoroughly inspect the captured screenshot.
   - Check for any residual font encoding errors (Mojibake), broken layouts, missing data cards, or unhandled UI states.
   - If ANY error is observed in the image, DO NOT declare completion. Continue diagnosing, fixing code/data, redeploying, and capturing updated screenshots until the feature is 100% verified and defect-free.

3. **User Communication:**
   - Embed the verified screenshot directly in the response using standard Markdown syntax `![caption](absolute_path)`.
   - Provide concise natural language synthesis of the root cause, fix, and live verification status.
