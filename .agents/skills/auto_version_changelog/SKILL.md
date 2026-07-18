---
name: Auto Version and Changelog Update
description: Automatically increments cache version numbers in index.html and app.js, keeps deployment files synchronized, and documents all updates in CHANGELOG.md.
---

# Auto Version and Changelog Management Skill

This skill guides the AI assistant to perform automatic version management, deployment synchronization, and changelog updates whenever project files are modified.

## Trigger Conditions
- This skill triggers whenever the agent modifies project source code files (e.g., `app.js`, `crm.js`, `ops.js`, `style.css`, `index.html`).

## Instructions and Steps

### 1. Version Increment Rules
- **Constant in app.js:** Locate `const CLIENT_VERSION = 'X.XX';` inside `app.js` and increment the value (e.g., `20.41` -> `20.42`).
- **Script Tags in index.html:** Locate the script tags at the bottom of `index.html` and `minhhai_crm_deploy/index.html`, and increment the cache-buster query version (e.g., `app.js?v=20.41` -> `app.js?v=20.42`).
- **Synchronize Versions:** Ensure that the version string inside `CLIENT_VERSION` matches exactly with the script query parameter version in `index.html` (e.g. `20.42`).

### 2. Deployment Synchronization
- Always copy the modified source files from the root workspace directory to their corresponding locations in the `minhhai_crm_deploy/` subdirectory to keep the live deployment up-to-date:
  ```powershell
  Copy-Item -Force "d:\antigravity\app.js" "d:\antigravity\minhhai_crm_deploy\app.js"
  Copy-Item -Force "d:\antigravity\crm.js" "d:\antigravity\minhhai_crm_deploy\crm.js"
  Copy-Item -Force "d:\antigravity\ops.js" "d:\antigravity\minhhai_crm_deploy\ops.js"
  Copy-Item -Force "d:\antigravity\style.css" "d:\antigravity\minhhai_crm_deploy\style.css"
  Copy-Item -Force "d:\antigravity\index.html" "d:\antigravity\minhhai_crm_deploy\index.html"
  ```

### 3. Maintain CHANGELOG.md
- **File Path:** `d:\antigravity\CHANGELOG.md`
- **Format:** Maintain the changelog in Markdown format with newest versions at the top:
  ```markdown
  # Nhật Ký Thay Đổi (Changelog) - Minh Hải CRM
  
  ## [v20.42] - YYYY-MM-DD
  ### Thêm mới (Added)
  - Mô tả tính năng mới được thêm...
  
  ### Sửa lỗi (Fixed)
  - Mô tả các lỗi đã được khắc phục...
  
  ### Thay đổi (Changed)
  - Các thay đổi cấu hình hoặc logic nghiệp vụ...
  ```
- Write entries clearly in Vietnamese so the project owner can easily track development history.

### 4. Git Push
- Once updates are complete, execute Git commands to commit and push:
  ```bash
  git add -A
  git commit -m "Bump version to X.XX: [Summary of changes]"
  git push origin main
  ```
