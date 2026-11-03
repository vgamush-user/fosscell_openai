# Chair Catalog Website

## Overview

This project is a static website for a chair company, designed to display product listings in a clean and scalable way.

The system is built to be:

* Robust (static frontend, minimal runtime dependencies)
* Easy to maintain
* Controlled through an internal admin workflow

---

## Architecture

### Frontend

* Built with Next.js
* Uses Tailwind CSS for styling
* Data is sourced from a static JSON file

### Backend / Data Pipeline

* Admin page handles product input
* Data is validated and transformed into JSON
* Images are renamed and structured automatically
* Data is committed to GitHub
* Static site is rebuilt and deployed

---

## Data Flow

Admin Input → API Processing → GitHub Commit → Build → Static Site

---

## Features (Planned / In Progress)

* Product listing and detail pages
* Search and filtering (catalog view)
* Admin interface for adding/editing products
* Image upload with automatic naming
* JSON-based data storage

---

## Project Structure

```
src/
  app/
  components/
  features/
  lib/
  data/
  types/
```

---

## Product Model (Simplified)

Each product includes:

* Model name
* Slug (URL identifier)
* Pricing (rep / semi / virgin)
* Colors
* Description & features
* Specifications
* Images
* Category & tags

---

## Setup (Development)

```bash
npm install
npm run dev
```

---

## Build (Static Export)

```bash
npm run build
npm run export
```

---

## Notes

* This is an early-stage implementation
* Structure and features may evolve
* Focus is on simplicity and robustness over complexity

---

## TODO

* Implement admin panel
* Add validation layer
* Integrate GitHub API for automated commits
* Set up deployment workflow
* Improve UI/UX for catalog browsing
