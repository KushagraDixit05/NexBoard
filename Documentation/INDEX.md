# NexBoard Documentation Index

Welcome to the NexBoard documentation! This index helps you navigate all available documentation for the NexBoard Kanban tracking application.

---

## Quick Links

### For Developers

- **[Routing Guide](./ROUTING-GUIDE.md)** - Complete guide to NexBoard's routing structure, URL patterns, and navigation
- **[Google OAuth Fix](./GOOGLE-OAUTH-FIX.md)** - OAuth authentication setup and troubleshooting
- **[File Naming Updates](./file-naming-updates.md)** - Code organization and naming conventions

### For Project Understanding

- **[Phase 1: Reverse Engineering](./phase1-reverse-engineering.md)** - Original Kanboard analysis
- **[Phase 2: Backend Development](./phase2-backend-development.md)** - Backend architecture and API design
- **[Phase 3: Frontend Development](./phase3-frontend-development.md)** - Frontend implementation details
- **[Phase 3 Status & Testing](./phase_3_status_and_testing.md)** - Testing results and status
- **[Phase 4: Enhancements](./phase4-enhancements.md)** - Feature enhancements and improvements
- **[Phase 5: Testing & Documentation](./phase5-testing-documentation.md)** - Comprehensive testing documentation

### Planning & Roadmap

- **[Roadmap](./roadmap.md)** - Project roadmap and future plans
- **[Roadmap Template](./roadmap-template.md)** - Template for planning new features

---

## Documentation by Category

### 🗺️ Routing & Navigation

**Primary:** [ROUTING-GUIDE.md](./ROUTING-GUIDE.md)

This comprehensive guide covers:
- Complete route structure and URL patterns
- Migration from old routing structure
- Route parameters and conventions
- Usage examples with code snippets
- Testing checklist
- Best practices for developers

**Legacy Files (Merged into Routing Guide):**
- [ROUTE-MIGRATION-TABLE.md](./ROUTE-MIGRATION-TABLE.md) ⚠️ Redirects to Routing Guide
- [ROUTES-QUICK-REFERENCE.md](./ROUTES-QUICK-REFERENCE.md) ⚠️ Redirects to Routing Guide
- [ROUTING-FIX.md](./ROUTING-FIX.md) ⚠️ Redirects to Routing Guide

### 🔐 Authentication

- **[GOOGLE-OAUTH-FIX.md](./GOOGLE-OAUTH-FIX.md)**
  - Google OAuth setup and configuration
  - Environment variables required
  - Troubleshooting authentication issues
  - Redirect URI configuration

### 📐 Architecture & Design

- **[Phase 1: Reverse Engineering](./phase1-reverse-engineering.md)**
  - Original Kanboard architecture analysis
  - MVC pattern documentation
  - Database schema
  - System workflows

- **[Phase 2: Backend Development](./phase2-backend-development.md)**
  - NexBoard backend architecture
  - API design and endpoints
  - Database models
  - Business logic implementation

- **[Phase 3: Frontend Development](./phase3-frontend-development.md)**
  - Next.js App Router structure
  - Component architecture
  - State management with Zustand
  - UI component library

### ✨ Features & Enhancements

- **[Phase 4: Enhancements](./phase4-enhancements.md)**
  - Task automation
  - Analytics dashboard
  - Swimlanes implementation
  - Advanced filtering
  - Time tracking
  - Notifications

### 🧪 Testing & Quality

- **[Phase 3 Status & Testing](./phase_3_status_and_testing.md)**
  - Feature testing results
  - Integration testing
  - Known issues and fixes

- **[Phase 5: Testing & Documentation](./phase5-testing-documentation.md)**
  - Comprehensive test plan
  - Test cases documentation
  - Manual testing procedures
  - Automated testing setup

### 📝 Code Organization

- **[File Naming Updates](./file-naming-updates.md)**
  - Component naming conventions
  - Directory structure
  - Import patterns
  - Best practices

---

## Common Tasks

### I need to...

**...understand the routing structure**
→ Read [ROUTING-GUIDE.md](./ROUTING-GUIDE.md)

**...set up authentication**
→ Read [GOOGLE-OAUTH-FIX.md](./GOOGLE-OAUTH-FIX.md)

**...understand the project architecture**
→ Read [Phase 2: Backend Development](./phase2-backend-development.md) and [Phase 3: Frontend Development](./phase3-frontend-development.md)

**...add a new feature**
→ Review [Phase 4: Enhancements](./phase4-enhancements.md) for patterns, then follow the routing guide for URL structure

**...fix a navigation issue**
→ Check [ROUTING-GUIDE.md](./ROUTING-GUIDE.md) → Section "Testing Checklist"

**...understand what's been tested**
→ Read [Phase 3 Status & Testing](./phase_3_status_and_testing.md)

**...see the project roadmap**
→ Check [roadmap.md](./roadmap.md)

---

## Getting Started

### For New Developers

1. **Start here:** Read the project [README.md](./README.md) to understand the project background
2. **Architecture:** Review Phase 2 and Phase 3 documentation to understand the system
3. **Routing:** Read the [Routing Guide](./ROUTING-GUIDE.md) to understand navigation
4. **Authentication:** Set up OAuth using [GOOGLE-OAUTH-FIX.md](./GOOGLE-OAUTH-FIX.md)
5. **Development:** Review [file-naming-updates.md](./file-naming-updates.md) for code conventions

### For Testers

1. **Test Plans:** Review [Phase 5: Testing & Documentation](./phase5-testing-documentation.md)
2. **Known Issues:** Check [Phase 3 Status & Testing](./phase_3_status_and_testing.md)
3. **Routing Tests:** Follow checklist in [Routing Guide](./ROUTING-GUIDE.md) → Section "Testing Checklist"

---

## Recent Updates

### March 2026

**Routing Documentation Consolidation**
- ✅ Created comprehensive [ROUTING-GUIDE.md](./ROUTING-GUIDE.md)
- ✅ Merged three routing docs into single source of truth
- ✅ Added usage examples and best practices
- ✅ Included testing checklist and migration guide

**Features Implemented**
- ✅ Swimlanes with 2D drag-and-drop
- ✅ Analytics dashboard with visualizations
- ✅ Automation rules management
- ✅ Enhanced navigation with new pages

**Authentication**
- ✅ Google OAuth fully functional
- ✅ Callback handling fixed
- ✅ Environment configuration documented

---

## Documentation Guidelines

When adding new documentation:

1. **Add to this index** with appropriate category
2. **Use markdown format** for consistency
3. **Include table of contents** for longer docs
4. **Add examples** where applicable
5. **Date your updates** at the top of the file
6. **Link between docs** to aid navigation

---

## Need Help?

If you can't find what you're looking for:

1. Check the [Routing Guide](./ROUTING-GUIDE.md) for navigation issues
2. Review phase documentation for feature details
3. Check the [roadmap](./roadmap.md) for planned features
4. Refer to the main [README.md](./README.md) for project overview

---

**Last Updated:** March 28, 2026  
**Documentation Version:** 2.0
