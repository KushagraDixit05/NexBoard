# Reverse and Forward Engineering of Kanboard

## Project Description

This project involves the systematic study, analysis, and enhancement of Kanboard, an open-source Kanban project management tool. The project is divided into two main phases: reverse engineering to understand the existing system architecture, and forward engineering to implement meaningful enhancements based on identified limitations.

The reverse engineering phase involves analyzing Kanboard's Model-View-Controller (MVC) architecture, understanding the task lifecycle, studying database schema, and documenting the system's event-driven mechanisms. The forward engineering phase focuses on designing and implementing enhancements such as task automation, analytics dashboards, and improved workflow capabilities.

This is an academic project completed as part of a third-year B.Tech Software Engineering curriculum, demonstrating practical application of software engineering principles including architectural analysis, design patterns, iterative development, and systematic testing methodologies.

---

## Objectives

The primary objectives of this project are:

1. **Reverse Engineering:**
   - Analyze and document Kanboard's architectural design and implementation
   - Understand the MVC pattern implementation in a real-world application
   - Study database schema and entity relationships
   - Trace key workflows including task creation, board rendering, and event handling
   - Identify system components, dependencies, and integration points

2. **System Analysis:**
   - Evaluate existing features and functionalities
   - Identify limitations and gaps in current implementation
   - Analyze performance bottlenecks and usability issues
   - Document security mechanisms and data flow

3. **Forward Engineering:**
   - Design and implement 3-5 meaningful enhancements
   - Develop features that address identified limitations
   - Maintain consistency with existing architecture
   - Follow software engineering best practices

4. **Documentation and Learning:**
   - Apply theoretical software engineering concepts to a real-world system
   - Create comprehensive technical documentation
   - Demonstrate understanding of the software development lifecycle
   - Practice iterative development methodology

---

## Scope

### In Scope

**Reverse Engineering:**
- Analysis of Kanboard's core architecture (MVC structure)
- Database schema documentation and ER diagram creation
- Task lifecycle documentation (creation, update, completion, deletion)
- Board rendering mechanism analysis
- Event-driven architecture study
- User authentication and authorization mechanisms
- API endpoint identification and documentation

**Forward Engineering:**
- Implementation of 3-5 enhancements selected from:
  - Task automation rules and triggers
  - Analytics and reporting dashboard
  - Enhanced workflow features (swimlanes, sub-tasks, task dependencies)
  - Notification system (email/webhook integration)
  - Board and task templates
  - Advanced filtering and search capabilities
  - Time tracking enhancements
- Database modifications to support new features
- UI/UX improvements for implemented features
- Unit and integration testing for new features

**Documentation:**
- Software Requirements Specification (SRS)
- Architectural design documentation
- Design specification for enhancements
- User manual for new features
- Test plan and test case documentation
- Final project report

### Out of Scope

- Complete rewrite of Kanboard
- Mobile application development
- Cloud deployment or DevOps automation
- Third-party integrations beyond basic webhooks/email
- Performance optimization of core Kanboard features
- Internationalization or localization
- Advanced machine learning or AI features
- Multi-tenancy or enterprise-scale features

---

## Process Model: Iterative Development

This project follows the **Iterative Process Model**, which allows for incremental development with feedback loops at each iteration. The model is particularly suitable for this project because:

### Characteristics

**Incremental Development:**
- The project is divided into iterations, each producing a working increment
- Each iteration includes planning, requirements, design, implementation, and testing
- Early iterations focus on analysis and design; later iterations on implementation

**Feedback and Refinement:**
- Each iteration's output is reviewed and used to refine the next iteration
- Allows for course correction based on faculty feedback
- Reduces risk by identifying issues early

**Risk Management:**
- Critical components are developed and tested early
- Complex features are broken down into manageable iterations
- Technical feasibility is validated incrementally

### Iteration Structure

The project consists of four major iterations over 14 weeks:

**Iteration 1 (Week 1-4): Foundation and Analysis**
- Project setup and environment configuration
- Requirement gathering and documentation
- Initial reverse engineering of architecture
- Deliverable: SRS document, initial architecture documentation

**Iteration 2 (Week 5-8): Design and Detailed Analysis**
- Complete reverse engineering analysis
- Design specification for proposed enhancements
- Database design for new features
- Deliverable: Complete architectural documentation, design specification

**Iteration 3 (Week 9-11): Implementation**
- Implement enhancements incrementally (one per mini-iteration)
- Unit testing during development
- Integration with existing codebase
- Deliverable: Working code with enhancements

**Iteration 4 (Week 12-14): Testing and Documentation**
- Comprehensive testing (functional, integration, regression)
- Final documentation compilation
- Presentation preparation
- Deliverable: Complete project package with all deliverables

### Advantages for This Project

- Allows learning of PHP/MVC in parallel with development
- Provides multiple review points with faculty advisor
- Reduces risk of major rework late in the project
- Produces tangible outputs at regular intervals
- Supports academic timeline with clear milestones

---

## System Overview

### What is Kanboard?

Kanboard is an open-source project management software that uses the Kanban methodology. It provides a visual approach to task management using boards, columns, and cards. Key characteristics:

- Written in PHP with minimal dependencies
- Uses SQLite, MySQL, or PostgreSQL for data storage
- Implements MVC architectural pattern
- Supports multiple users with role-based access control
- Extensible through plugins
- Lightweight and self-hosted

### Core Components

**Models:**
- Represent data entities (Task, Board, Project, User, Column)
- Handle database operations (CRUD)
- Implement business logic and validation
- Located in `/app/Model` directory

**Views:**
- HTML templates with embedded PHP
- Render user interface
- Display data passed from controllers
- Located in `/app/Template` directory

**Controllers:**
- Handle HTTP requests
- Coordinate between models and views
- Implement application logic
- Manage user sessions and authentication
- Located in `/app/Controller` directory

**Database Layer:**
- Abstraction layer for database operations
- Support for multiple database systems
- Schema migration management

**Event System:**
- Event-driven architecture for extensibility
- Hooks for actions (task creation, updates, etc.)
- Plugin system leverages events

### Key Workflows

**Task Management Workflow:**
1. User creates task through UI
2. Controller receives request and validates input
3. Model creates task record in database
4. Event system triggers task creation events
5. View updates to display new task
6. Tasks can be moved between columns (drag-and-drop)
7. Task updates follow similar workflow

**Board Rendering:**
1. Controller fetches board data from model
2. Model retrieves board, columns, and associated tasks
3. Data passed to view layer
4. View renders HTML with tasks organized by columns
5. Client-side JavaScript enables drag-and-drop

**User Authentication:**
1. User submits login credentials
2. Controller validates against database
3. Session created on successful authentication
4. Role-based permissions checked for each action

---

## Key Features

### Existing Kanboard Features

**Board Management:**
- Multiple boards per project
- Customizable columns representing workflow stages
- Drag-and-drop task movement
- Swimlanes for categorization
- Task color coding

**Task Management:**
- Create, read, update, delete tasks
- Task descriptions with Markdown support
- Subtasks
- File attachments
- Task comments and activity history
- Due dates and time tracking
- Task assignments to users

**User Management:**
- Multiple user accounts
- Role-based access control (Admin, Manager, User)
- User groups
- Project-specific permissions

**Additional Features:**
- Activity stream
- Calendar view
- Gantt chart (basic)
- Search functionality
- Basic reporting
- Email notifications
- Plugin system

---

## Proposed Enhancements

Based on reverse engineering analysis and identified limitations, the following enhancements are proposed. Three to five will be selected for implementation:

### 1. Task Automation Rules

**Problem:** Manual task movement and status updates are time-consuming and error-prone.

**Solution:** Implement an automation engine that allows users to define rules for automatic task actions.

**Features:**
- Rule definition interface (if condition X, then action Y)
- Triggers: task completion, due date approaching, status change
- Actions: move task, send notification, update fields, assign user
- Scheduled execution using cron jobs
- Rule logging and history

**Technical Approach:**
- New database tables: `automation_rules`, `rule_executions`
- Background job scheduler
- Event listener integration
- Admin UI for rule management

### 2. Analytics and Reporting Dashboard

**Problem:** Limited visibility into team performance and workflow metrics.

**Solution:** Create a dashboard displaying key metrics and visualizations.

**Features:**
- Cycle time analysis (time from task creation to completion)
- Throughput metrics (tasks completed per time period)
- Work-in-progress limits visualization
- Burndown charts
- Task distribution by user/column
- Customizable date ranges
- Export reports to PDF/CSV

**Technical Approach:**
- Aggregate queries on task data
- Integration with charting library (Chart.js or similar)
- Caching for performance
- New controller and views for dashboard

### 3. Enhanced Workflow Management

**Problem:** Limited support for complex workflows and task relationships.

**Solution:** Add advanced workflow features for better task organization.

**Features:**
- Task dependencies (blocking/blocked by relationships)
- Recurring tasks with templates
- Custom fields for tasks
- Advanced filtering and sorting
- Bulk task operations

**Technical Approach:**
- New database tables: `task_dependencies`, `custom_fields`
- Updated task model with relationship handling
- Enhanced UI with dependency visualization
- Validation to prevent circular dependencies

### 4. Notification System Enhancements

**Problem:** Limited notification options and lack of real-time updates.

**Solution:** Expand notification capabilities with multiple channels.

**Features:**
- Webhook integration for external services (Slack, Discord)
- Customizable notification preferences per user
- Digest emails (daily/weekly summaries)
- In-app notification center
- Notification for @mentions in comments

**Technical Approach:**
- Webhook manager for outgoing HTTP calls
- Event listener for notification triggers
- User preference storage
- Email queue system

### 5. Template System

**Problem:** Repetitive setup of similar boards and tasks.

**Solution:** Create a template system for reusable configurations.

**Features:**
- Save board as template (columns, swimlanes, default tasks)
- Save task as template (with subtasks, checklists)
- Template library with search
- Instantiate board/task from template
- Share templates across projects

**Technical Approach:**
- Template storage in database (JSON format)
- Template controller for CRUD operations
- Instantiation logic to create copies
- Template management UI

---

## Tech Stack

### Existing Kanboard Stack

**Backend:**
- PHP 7.4+ (procedural and object-oriented)
- SQLite/MySQL/PostgreSQL
- Custom MVC framework (built into Kanboard)

**Frontend:**
- HTML5
- CSS3 (custom stylesheets)
- JavaScript (vanilla JS and jQuery)
- Drag-and-drop using HTML5 API

**Tools and Libraries:**
- Composer (dependency management)
- SimpleDOM (XML parsing)
- PHPMailer (email sending)
- Various PHP libraries (date handling, validation)

### Additional Tools for Enhancements

**Backend:**
- Chart.js or similar (for analytics visualization)
- Cron job scheduler (for automation)
- Webhook libraries (for notifications)

**Development Tools:**
- XAMPP/WAMP or Docker (local development environment)
- Git (version control)
- VS Code or PhpStorm (IDE)
- phpMyAdmin or MySQL Workbench (database management)
- PHPUnit (unit testing, optional)

**Documentation Tools:**
- Markdown (technical documentation)
- Draw.io or Lucidchart (UML diagrams)
- Microsoft Word or LaTeX (report writing)

---

## Installation Guide

### Prerequisites

- PHP 7.4 or higher
- MySQL 5.7+ or PostgreSQL 9.4+ (or SQLite for development)
- Apache or Nginx web server
- Git

### Local Setup Using XAMPP (Windows/Mac/Linux)

**Step 1: Install XAMPP**
1. Download XAMPP from https://www.apachefriends.org/
2. Install with Apache and MySQL components
3. Start Apache and MySQL from XAMPP Control Panel

**Step 2: Clone Kanboard**
```bash
cd C:/xampp/htdocs  # Windows
# OR
cd /opt/lampp/htdocs  # Linux

git clone https://github.com/kanboard/kanboard.git
cd kanboard
```

**Step 3: Configure Database**
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Create new database: `kanboard`
3. Copy config file:
   ```bash
   cp config.default.php config.php
   ```
4. Edit `config.php`:
   ```php
   define('DB_DRIVER', 'mysql');
   define('DB_USERNAME', 'root');
   define('DB_PASSWORD', '');
   define('DB_HOSTNAME', 'localhost');
   define('DB_NAME', 'kanboard');
   ```

**Step 4: Set Permissions**
```bash
# Linux/Mac
chmod -R 755 data/

# Windows: Ensure IIS/Apache user has write access to data/ folder
```

**Step 5: Access Kanboard**
1. Open browser: http://localhost/kanboard
2. Default credentials:
   - Username: `admin`
   - Password: `admin`
3. Change password immediately after first login

**Step 6: Verify Installation**
- Create a test project and board
- Add some tasks
- Test drag-and-drop functionality
- Check database to see data being stored

### Alternative: Docker Setup

```bash
# Clone repository
git clone https://github.com/kanboard/kanboard.git
cd kanboard

# Run with Docker Compose
docker-compose up -d

# Access at http://localhost:8080
```

---

## Folder Structure

### Conceptual Project Structure

```
kanboard-project/
│
├── kanboard/                    # Original Kanboard codebase
│   ├── app/
│   │   ├── Controller/          # Controller classes
│   │   ├── Model/               # Model classes
│   │   ├── Template/            # View templates
│   │   └── ...
│   ├── data/                    # SQLite database, uploads
│   ├── config.php               # Configuration file
│   └── ...
│
├── docs/                        # Project documentation
│   ├── requirements/
│   │   ├── SRS.md              # Software Requirements Specification
│   │   └── use-cases.md
│   ├── design/
│   │   ├── architecture.md      # Architecture documentation
│   │   ├── database-design.md   # ER diagrams, schema
│   │   └── enhancement-design.md
│   ├── testing/
│   │   ├── test-plan.md
│   │   └── test-cases.xlsx
│   └── final-report.md
│
├── analysis/                    # Reverse engineering analysis
│   ├── code-analysis/
│   ├── diagrams/
│   │   ├── component-diagram.png
│   │   ├── er-diagram.png
│   │   └── sequence-diagrams/
│   └── notes/
│
├── implementation/              # Enhancement code (before integration)
│   ├── automation/
│   ├── analytics/
│   └── templates/
│
├── testing/                     # Test scripts and results
│   ├── unit-tests/
│   ├── integration-tests/
│   └── test-results/
│
├── presentations/               # Project presentations
│   ├── mid-term-review.pptx
│   └── final-presentation.pptx
│
└── README.md                    # This file
```

### Kanboard Core Structure (for reference)

```
kanboard/
├── app/
│   ├── Controller/        # Request handlers
│   ├── Model/             # Database and business logic
│   ├── Template/          # HTML views
│   ├── Helper/            # Utility functions
│   ├── Validator/         # Input validation
│   └── Action/            # Automatic actions
├── assets/                # CSS, JS, images
├── data/                  # Database, files, plugins
├── vendor/                # Composer dependencies
└── index.php              # Application entry point
```

---

## Development Phases

### Phase 1: Project Initiation (Week 1-2)
- Environment setup
- Kanboard installation and exploration
- Initial documentation structure
- Project planning

### Phase 2: Requirement Analysis (Week 3)
- Document functional and non-functional requirements
- Create use case diagrams
- Gap analysis
- Enhancement proposal

### Phase 3: Reverse Engineering (Week 4-6)
- Architectural analysis
- Database schema study
- Code flow documentation
- UML diagram creation

### Phase 4: System Design (Week 7-8)
- Design enhancements
- Create detailed technical specifications
- UI/UX mockups
- Database modifications planning

### Phase 5: Implementation (Week 9-11)
- Iterative development of enhancements
- Code integration with Kanboard
- Unit testing
- Code documentation

### Phase 6: Testing and Validation (Week 12)
- Functional testing
- Integration testing
- Regression testing
- Bug fixing

### Phase 7: Documentation and Submission (Week 13-14)
- Final report compilation
- User manual creation
- Presentation preparation
- Project submission

---

## Testing Strategy

### Test Levels

**Unit Testing:**
- Test individual functions and methods
- Focus on new enhancement code
- Use PHPUnit or manual testing
- Aim for code coverage of critical paths

**Integration Testing:**
- Test interaction between enhancements and existing Kanboard features
- Verify database integrity
- Test event system integration
- Validate API endpoints

**Functional Testing:**
- Test complete user workflows
- Verify requirements are met
- Test different user roles and permissions
- Cross-browser testing

**Regression Testing:**
- Ensure existing Kanboard features still work
- Re-test core workflows after changes
- Verify no unintended side effects

**Non-Functional Testing:**
- Performance testing (page load time, query optimization)
- Security testing (input validation, SQL injection prevention)
- Usability testing (ask peers to use the system)

### Test Documentation

- Test plan outlining scope, approach, and schedule
- Test cases with expected and actual results
- Bug reports with reproduction steps
- Test summary report

### Testing Tools

- Manual testing with documented test cases
- PHPUnit for automated unit tests (optional)
- Chrome DevTools for performance analysis
- MySQL slow query log for database optimization

---

## Future Improvements

While the current project implements core enhancements, the following improvements could be considered for future work:

### Technical Enhancements

**Mobile Responsiveness:**
- Improve mobile UI/UX
- Touch-optimized drag-and-drop
- Progressive Web App (PWA) features

**Real-Time Collaboration:**
- WebSocket integration for live updates
- Real-time multi-user editing
- Live cursor/presence indicators

**API Expansion:**
- RESTful API for third-party integrations
- API documentation with Swagger
- API authentication and rate limiting

**Performance Optimization:**
- Database query optimization
- Caching layer (Redis/Memcached)
- Frontend bundling and minification
- Lazy loading for large boards

### Feature Enhancements

**Advanced Analytics:**
- Predictive analytics (task completion estimation)
- Resource utilization reports
- Custom report builder
- Data export in multiple formats

**Collaboration Features:**
- Video call integration
- Document collaboration
- Whiteboarding
- Team chat

**AI/ML Integration:**
- Automatic task categorization
- Smart task recommendations
- Anomaly detection in workflows
- Natural language task creation

**Enterprise Features:**
- Multi-tenancy support
- Advanced security (SSO, 2FA)
- Audit logs and compliance reporting
- Advanced user management

### Process Improvements

**DevOps:**
- CI/CD pipeline setup
- Automated testing
- Containerization (Docker)
- Deployment automation

**Code Quality:**
- Static code analysis
- Code coverage tools
- Linting and formatting standards
- Documentation generation

---

## Academic Disclaimer

This project is developed as part of academic coursework for a B.Tech Software Engineering program. The primary objectives are educational: learning software reverse engineering techniques, understanding real-world MVC architectures, applying software design patterns, and practicing iterative development methodologies.

### Educational Use Only

- This project is for academic evaluation and learning purposes
- Not intended for production deployment without further development
- Enhancements are proof-of-concept implementations
- Security and scalability have not been tested for production environments

### Kanboard License

Kanboard is licensed under the MIT License. This project respects the original license and does not claim ownership of the Kanboard codebase. All enhancements are developed in accordance with academic fair use and software engineering education principles.

### Original Attribution

- Kanboard: https://github.com/kanboard/kanboard
- Developed by Frédéric Guillot and contributors
- Licensed under MIT License

### Academic Integrity

This project represents original work completed by the student(s) listed in the project report. External code sources, libraries, and references are properly cited in the documentation. The reverse engineering analysis and implemented enhancements are the student's own work, created for educational purposes.

---

## Contributors

[Student Name(s)]  
[Roll Number(s)]  
[Department of Computer Science/Software Engineering]  
[University Name]  
[Academic Year]

## Acknowledgments

- Faculty advisor: [Advisor Name]
- Kanboard community for excellent documentation
- Open-source contributors to tools used in this project

---

## License

The enhancements developed as part of this project are released under the MIT License, consistent with Kanboard's licensing. Original Kanboard code remains under its original MIT License.

---

## Contact

For questions regarding this academic project:
- Email: [student email]
- GitHub: [repository link]

---

**Last Updated:** [Date]  
**Version:** 1.0 (Academic Submission)
