# 🛠️ Tauri CMS — Full Build Specsheet (Checklist)

> Desktop CMS for managing static product website (Git-based deployment)

---

## ✅ 0. Project Overview

* [ ] CMS is a **Windows desktop app (.exe)**
* [ ] Built using **Tauri**
* [ ] Frontend: **Vanilla JS / TypeScript + HTML + Tailwind (optional)**
* [ ] Backend: **Tauri (Rust bridge)**
* [ ] Data source: `content/products.json`
* [ ] Images: `/public/images/products/`
* [ ] Deployment: Git push → Cloudflare Pages / GitHub Pages

---

## 📁 1. Project Setup

#### 1.1 Initialize Tauri App

* [ ] Run `npm create tauri-app`
* [ ] Choose:

  * [ ] Vanilla / minimal frontend
  * [ ] TypeScript (recommended)
* [ ] Ensure project builds successfully:

  ```bash
  npm run tauri dev
  ```

---

#### 1.2 Folder Structure

Ensure structure aligns with main website repo:

```
cms-app/
├── src/                    ## Frontend (UI)
├── src-tauri/             ## Backend (Rust)
├── assets/                ## Icons, etc.
```

External (linked repo):

```
website-root/
├── content/products.json
├── public/images/products/
```

* [ ] CMS has access to website repo path (configurable)

---

## ⚙️ 2. Core Configuration

#### 2.1 Repo Path Setup

* [ ] First launch prompt:

  * [ ] Select local repo folder OR
  * [ ] Clone GitHub repo

* [ ] Save config locally:

  * [ ] Repo path
  * [ ] Default branch

---

#### 2.2 Git Integration

* [ ] Backend commands:

  * [ ] `git add .`
  * [ ] `git commit -m "<message>"`
  * [ ] `git push`

* [ ] Optional:

  * [ ] `git pull` on startup

* [ ] Error handling:

  * [ ] Show Git errors in UI
  * [ ] Prevent push if conflicts exist

---

## 🧠 3. Data Layer

#### 3.1 Product Model Compliance

* [ ] Matches schema:

  * [ ] id (auto-generated)
  * [ ] slug (auto-generated)
  * [ ] modelName
  * [ ] status
  * [ ] colors[]
  * [ ] description
  * [ ] features[]
  * [ ] specifications[{ key, value }]
  * [ ] category
  * [ ] tags[]
  * [ ] images[]
  * [ ] thumbnail
  * [ ] inStock
  * [ ] leadTime

---

#### 3.2 File Handling

* [ ] Read `products.json`
* [ ] Parse safely
* [ ] Write updates atomically:

  * [ ] No corruption on failure

---

#### 3.3 Validation Layer

Before save/build:

* [ ] Required fields present
* [ ] Unique slug
* [ ] No duplicate IDs
* [ ] Valid category
* [ ] Image paths exist
* [ ] No empty spec keys/values

---

## 🖥️ 4. UI — Layout

#### 4.1 Main Layout

* [ ] Left Sidebar (product list)
* [ ] Main Editor Panel
* [ ] Bottom Action Bar

---

#### 📚 5. Sidebar (Product List)

#### 5.1 Structure

* [ ] Search bar (top-middle)
* [ ] Product list (scrollable)
* [ ] Add Product button:

  * [ ] Top-right
  * [ ] Bottom

---

#### 5.2 Features

* [ ] Live search:

  * [ ] modelName
  * [ ] tags
  * [ ] category
  * [ ] description

* [ ] Highlight matched fields

---

#### 5.3 Product Display

Each item shows:

* [ ] Name
* [ ] Status indicator:

  * [ ] Active
  * [ ] Draft
  * [ ] Archived

---

#### 5.4 Quick Actions (on hover)

* [ ] Edit
* [ ] Preview
* [ ] Archive/Delete

---

## ✏️ 6. Product Editor

#### 6.1 General Fields

* [ ] Model Name input
* [ ] Auto-generated slug:

  * [ ] Updates on name change (until locked)
* [ ] Status dropdown
* [ ] Category dropdown
* [ ] In-stock toggle
* [ ] Lead time input

---

#### 6.2 Structured Inputs

###### Features

* [ ] Add/remove bullet items
* [ ] Reorder support (optional)

---

###### Specifications

* [ ] Table UI:

  * [ ] Key input
  * [ ] Value input
* [ ] Add/remove rows

---

###### Colors

* [ ] Chip-based selection OR
* [ ] Free text with suggestions

---

###### Tags

* [ ] Autocomplete system
* [ ] Reusable tag pool

---

#### 6.3 Description

* [ ] Multi-line text area

---

#### 💾 7. State Management

#### 7.1 Auto Save

* [ ] Save locally (not Git) every few seconds
* [ ] Indicators:

  * [ ] “Saved locally”
  * [ ] “Unsaved changes”

---

#### 7.2 Change Detection

* [ ] Warn before switching product if unsaved
* [ ] Warn before closing app

---

## 🖼️ 8. Image Handling

#### 8.1 Upload

* [ ] Drag & drop support
* [ ] Multi-image upload

---

#### 8.2 Processing

* [ ] Auto rename:

  * `<slug>-001.jpg`
  * `<slug>-002.jpg`

* [ ] Save to:

  * `/public/images/products/`

---

#### 8.3 Preview

* [ ] Inline preview OR modal
* [ ] Thumbnail selection

---

#### 8.4 Image Management

* [ ] Reorder images
* [ ] Delete images
* [ ] Mark thumbnail

---

## ▶️ 9. Bottom Action Bar

#### 9.1 Buttons

* [ ] Preview Website
* [ ] Upload and Build
* [ ] (Optional) Pull Latest

---

#### 9.2 Build Flow

On "Upload and Build":

* [ ] Validate data
* [ ] Save JSON
* [ ] Run:

  ```bash
  git add .
  git commit -m "<message>"
  git push
  ```

---

#### 9.3 Status Feedback

* [ ] Idle
* [ ] Building...
* [ ] Success ✓
* [ ] Error ✗

---

#### 9.4 Commit Message

* [ ] Input field
* [ ] Auto-suggest default message

---

## 👁️ 10. Preview System

#### 10.1 Local Preview

* [ ] Open local static build OR
* [ ] Open deployed site URL

---

#### 10.2 Optional

* [ ] Embedded preview pane (iframe)

---

## 🔁 11. Version Control UX

#### 11.1 History

* [ ] Show last commits
* [ ] Display:

  * Message
  * Time

---

#### 11.2 Revert

* [ ] Ability to revert last change

---

## ⚡ 12. Performance

* [ ] Lazy load product list (if large)
* [ ] Avoid unnecessary re-renders
* [ ] Efficient JSON parsing

---

## ⌨️ 13. Shortcuts

* [ ] Ctrl + S → Save
* [ ] Ctrl + Enter → Build
* [ ] Ctrl + F → Focus search

---

## 🚨 14. Error Handling

* [ ] JSON corruption protection
* [ ] Git failure handling
* [ ] File permission errors
* [ ] Missing images

---

## 🔐 15. Safety Features

* [ ] Confirmation before delete
* [ ] Slug change warning
* [ ] Prevent accidental overwrite

---

## 📦 16. Build & Distribution

#### 16.1 Build

* [ ] Run:

  ```bash
  npm run tauri build
  ```

---

#### 16.2 Output

* [ ] Windows `.exe` generated
* [ ] Size target:

  * ~5–15MB

---

#### 16.3 Installer (optional)

* [ ] NSIS / MSI setup

---

## 🎯 17. Future Enhancements (Optional)

* [ ] Multi-user sync
* [ ] Remote repo selection UI
* [ ] Image compression
* [ ] Role-based access
* [ ] Product duplication feature

---

## ✅ FINAL CHECK

* [ ] App launches without errors
* [ ] Can load products.json
* [ ] Can edit and save product
* [ ] Can upload images
* [ ] Can commit and push to Git
* [ ] Site updates after deployment
* [ ] No data loss on crash

---

## 🧩 End Goal

A **fast, minimal, fully offline-capable CMS desktop app** that:

* Edits JSON directly
* Manages images locally
* Pushes changes via Git
* Requires **zero backend server**
