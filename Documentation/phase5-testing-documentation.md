# Phase 5: Testing, Documentation & Submission

**Timeline:** Week 12–14  
**Focus:** Comprehensive testing, bug fixing, documentation, and final packaging  
**Effort Split:** 40% Testing, 30% Documentation, 20% Bug Fixes, 10% Packaging

---

## 1. Objectives

- Achieve >80% code coverage on backend, >70% on frontend
- Write 50+ test cases across unit, integration, and E2E tests
- Perform security and performance testing
- Write final project report (40–60 pages), user manual (10–15 pages), presentation (15–20 slides)
- Package application with Docker Compose for easy demo deployment
- Create Git release tag v1.0.0

---

## 2. Week-by-Week Plan

| Week | Focus | Key Output |
|------|-------|-----------|
| **Week 12** | Backend unit + integration tests, Frontend component tests, Security audit | 30+ tests passing, 0 critical vulnerabilities |
| **Week 13** | E2E tests (Cypress), Performance testing, Bug triage + fixes | Full E2E suite, performance benchmarks documented |
| **Week 14** | Report writing, User manual, Presentation, Docker Compose, Final packaging | All deliverables ready for submission |

---

## 3. Testing Strategy

### 3.1 Test Pyramid

```
        ╱╲
       ╱ E2E ╲          ~10 tests (Cypress)
      ╱────────╲
     ╱Integration╲      ~15 tests (API + DB)
    ╱──────────────╲
   ╱  Unit Tests    ╲   ~30 tests (Services, Utils, Components)
  ╱──────────────────╲
```

### 3.2 Test File Organization

```
server/
  src/
    __tests__/
      unit/
        services/
          automation.service.test.js
          analytics.service.test.js
          dependency.service.test.js
          notification.service.test.js
        utils/
          mentions.test.js
          jwt.test.js
          password.test.js
        middleware/
          auth.middleware.test.js
          validation.middleware.test.js
      integration/
        auth.test.js
        tasks.test.js
        boards.test.js
        projects.test.js
        automation.test.js
        analytics.test.js
        notifications.test.js
    jest.config.js
    jest.setup.js

client/
  __tests__/
    components/
      board/
        KanbanBoard.test.tsx
        KanbanColumn.test.tsx
        TaskCard.test.tsx
        FilterPanel.test.tsx
      task/
        TaskDetailModal.test.tsx
        TaskDependencies.test.tsx
        SubtaskList.test.tsx
      automation/
        RuleBuilder.test.tsx
      ui/
        Avatar.test.tsx
        Badge.test.tsx
        Modal.test.tsx
    pages/
      LoginPage.test.tsx
      DashboardHome.test.tsx
      AnalyticsPage.test.tsx
    stores/
      authStore.test.ts
      boardStore.test.ts
    jest.config.ts
    jest.setup.ts

cypress/
  e2e/
    auth.cy.ts
    board.cy.ts
    task-lifecycle.cy.ts
    automation.cy.ts
    analytics.cy.ts
  fixtures/
    users.json
    projects.json
  support/
    commands.ts
    e2e.ts
  cypress.config.ts
```

---

## 4. Backend Testing

### 4.1 Jest Configuration

```javascript
// server/jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterSetup: ['./jest.setup.js'],
  testTimeout: 10000,
};
```

### 4.2 Test Setup (MongoDB Memory Server)

```javascript
// server/jest.setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Clear all collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
```

### 4.3 Unit Tests

#### JWT Utility Tests

```javascript
// server/src/__tests__/unit/utils/jwt.test.js
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../../../utils/jwt');

describe('JWT Utilities', () => {
  const mockUser = { _id: '64abc123', email: 'test@test.com', role: 'user' };

  test('generateAccessToken returns a valid token', () => {
    const token = generateAccessToken(mockUser);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);  // JWT has 3 parts
  });

  test('verifyToken decodes access token correctly', () => {
    const token = generateAccessToken(mockUser);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(mockUser._id);
    expect(decoded.email).toBe(mockUser.email);
    expect(decoded.role).toBe(mockUser.role);
  });

  test('generateRefreshToken returns a different token than access token', () => {
    const access = generateAccessToken(mockUser);
    const refresh = generateRefreshToken(mockUser);
    expect(access).not.toBe(refresh);
  });

  test('verifyToken throws for invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });

  test('verifyToken throws for expired token', () => {
    // This would test with a token that has a very short expiry
    // Implementation depends on how expiry is set
  });
});
```

#### Password Utility Tests

```javascript
// server/src/__tests__/unit/utils/password.test.js
const { hashPassword, comparePassword } = require('../../../utils/password');

describe('Password Utilities', () => {
  test('hashPassword returns a hashed string', async () => {
    const hash = await hashPassword('password123');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('password123');
    expect(hash.startsWith('$2')).toBe(true);  // bcrypt prefix
  });

  test('comparePassword returns true for correct password', async () => {
    const hash = await hashPassword('password123');
    const result = await comparePassword('password123', hash);
    expect(result).toBe(true);
  });

  test('comparePassword returns false for incorrect password', async () => {
    const hash = await hashPassword('password123');
    const result = await comparePassword('wrongpassword', hash);
    expect(result).toBe(false);
  });

  test('different passwords produce different hashes', async () => {
    const hash1 = await hashPassword('password1');
    const hash2 = await hashPassword('password2');
    expect(hash1).not.toBe(hash2);
  });
});
```

#### Mention Parser Tests

```javascript
// server/src/__tests__/unit/utils/mentions.test.js
const mongoose = require('mongoose');
const { parseMentions } = require('../../../utils/mentions');
const User = require('../../../models/User');
const Project = require('../../../models/Project');

describe('parseMentions', () => {
  let user1, user2, project;

  beforeEach(async () => {
    user1 = await User.create({
      username: 'john', email: 'john@test.com', displayName: 'John',
      passwordHash: 'hash',
    });
    user2 = await User.create({
      username: 'jane', email: 'jane@test.com', displayName: 'Jane',
      passwordHash: 'hash',
    });
    project = await Project.create({
      name: 'Test', owner: user1._id,
      members: [{ user: user2._id, role: 'member' }],
    });
  });

  test('parses single @mention', async () => {
    const result = await parseMentions('Hey @john, check this', project._id);
    expect(result).toHaveLength(1);
    expect(result[0].toString()).toBe(user1._id.toString());
  });

  test('parses multiple @mentions', async () => {
    const result = await parseMentions('@john and @jane please review', project._id);
    expect(result).toHaveLength(2);
  });

  test('ignores @mentions of non-members', async () => {
    const outsider = await User.create({
      username: 'outsider', email: 'out@test.com', displayName: 'Outsider',
      passwordHash: 'hash',
    });
    const result = await parseMentions('@outsider please help', project._id);
    expect(result).toHaveLength(0);
  });

  test('returns empty for no mentions', async () => {
    const result = await parseMentions('No mentions here', project._id);
    expect(result).toHaveLength(0);
  });
});
```

#### Automation Service Tests

```javascript
// server/src/__tests__/unit/services/automation.service.test.js
const AutomationRule = require('../../../models/AutomationRule');
const Task = require('../../../models/Task');
const RuleExecution = require('../../../models/RuleExecution');
const automationService = require('../../../services/automation.service');

describe('AutomationService', () => {
  let project, board, column1, column2, task;

  beforeEach(async () => {
    // Create test data
    const mongoose = require('mongoose');
    const Project = require('../../../models/Project');
    const Board = require('../../../models/Board');
    const Column = require('../../../models/Column');

    project = await Project.create({ name: 'Test', owner: new mongoose.Types.ObjectId() });
    board = await Board.create({ title: 'Board', project: project._id });
    column1 = await Column.create({ title: 'Todo', board: board._id, position: 0 });
    column2 = await Column.create({ title: 'Done', board: board._id, position: 1 });
    task = await Task.create({
      title: 'Test Task', project: project._id, board: board._id,
      column: column1._id, creator: project.owner, priority: 'high',
    });
  });

  test('evaluateConditions returns true when no conditions', () => {
    const result = automationService.evaluateConditions([], task);
    expect(result).toBe(true);
  });

  test('evaluateConditions matches equals operator', () => {
    const conditions = [{ field: 'priority', operator: 'equals', value: 'high' }];
    expect(automationService.evaluateConditions(conditions, task)).toBe(true);
  });

  test('evaluateConditions rejects non-matching equals', () => {
    const conditions = [{ field: 'priority', operator: 'equals', value: 'low' }];
    expect(automationService.evaluateConditions(conditions, task)).toBe(false);
  });

  test('executeRule creates execution record on success', async () => {
    const rule = await AutomationRule.create({
      project: project._id, name: 'Test Rule', createdBy: project.owner,
      trigger: { type: 'task.create' },
      actions: [{ type: 'set_priority', config: { priority: 'urgent' } }],
    });

    await automationService.executeRule(rule, task, { task });

    const executions = await RuleExecution.find({ rule: rule._id });
    expect(executions).toHaveLength(1);
    expect(executions[0].status).toBe('success');
  });

  test('executeRule skips when conditions not met', async () => {
    const rule = await AutomationRule.create({
      project: project._id, name: 'Test Rule', createdBy: project.owner,
      trigger: { type: 'task.create' },
      conditions: [{ field: 'priority', operator: 'equals', value: 'low' }],
      actions: [{ type: 'close_task', config: {} }],
    });

    await automationService.executeRule(rule, task, { task });

    const executions = await RuleExecution.find({ rule: rule._id });
    expect(executions[0].status).toBe('skipped');
  });
});
```

#### Dependency Service Tests

```javascript
// server/src/__tests__/unit/services/dependency.service.test.js
const mongoose = require('mongoose');
const dependencyService = require('../../../services/dependency.service');
const TaskDependency = require('../../../models/TaskDependency');
const Task = require('../../../models/Task');

describe('dependencyService', () => {
  let taskA, taskB, taskC, project;

  beforeEach(async () => {
    const Project = require('../../../models/Project');
    const Board = require('../../../models/Board');
    const Column = require('../../../models/Column');

    project = await Project.create({ name: 'Test', owner: new mongoose.Types.ObjectId() });
    const board = await Board.create({ title: 'Board', project: project._id });
    const col = await Column.create({ title: 'Todo', board: board._id, position: 0 });

    taskA = await Task.create({ title: 'A', project: project._id, board: board._id, column: col._id, creator: project.owner });
    taskB = await Task.create({ title: 'B', project: project._id, board: board._id, column: col._id, creator: project.owner });
    taskC = await Task.create({ title: 'C', project: project._id, board: board._id, column: col._id, creator: project.owner });
  });

  test('createDependency creates a valid dependency', async () => {
    const dep = await dependencyService.createDependency(taskA._id, taskB._id, project._id);
    expect(dep.task.toString()).toBe(taskA._id.toString());
    expect(dep.dependsOn.toString()).toBe(taskB._id.toString());
  });

  test('detects circular dependency: A->B->A', async () => {
    await dependencyService.createDependency(taskA._id, taskB._id, project._id);
    await expect(
      dependencyService.createDependency(taskB._id, taskA._id, project._id)
    ).rejects.toThrow('circular');
  });

  test('detects circular dependency: A->B->C->A', async () => {
    await dependencyService.createDependency(taskA._id, taskB._id, project._id);
    await dependencyService.createDependency(taskB._id, taskC._id, project._id);
    await expect(
      dependencyService.createDependency(taskC._id, taskA._id, project._id)
    ).rejects.toThrow('circular');
  });

  test('allows non-circular dependencies', async () => {
    await dependencyService.createDependency(taskA._id, taskB._id, project._id);
    const dep = await dependencyService.createDependency(taskA._id, taskC._id, project._id);
    expect(dep).toBeDefined();
  });

  test('canComplete returns true when all blockers done', async () => {
    await dependencyService.createDependency(taskA._id, taskB._id, project._id);
    taskB.status = 'completed';
    await taskB.save();

    const { canComplete } = await dependencyService.canComplete(taskA._id);
    expect(canComplete).toBe(true);
  });

  test('canComplete returns false when blockers incomplete', async () => {
    await dependencyService.createDependency(taskA._id, taskB._id, project._id);

    const { canComplete, blockers } = await dependencyService.canComplete(taskA._id);
    expect(canComplete).toBe(false);
    expect(blockers).toHaveLength(1);
  });
});
```

### 4.4 Integration Tests

#### Auth Integration Tests

```javascript
// server/src/__tests__/integration/auth.test.js
const request = require('supertest');
const app = require('../../app');  // Express app
const User = require('../../models/User');

describe('Auth Endpoints', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    password: 'Password123!',
  };

  describe('POST /api/auth/register', () => {
    test('registers a new user successfully', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    test('rejects duplicate email', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(409);
    });

    test('rejects invalid email format', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...testUser, email: 'invalid-email',
      });
      expect(res.status).toBe(400);
    });

    test('rejects weak password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...testUser, password: '123',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    test('logs in with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    test('rejects wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'WrongPassword123!',
      });
      expect(res.status).toBe(401);
    });

    test('rejects non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'Password123!',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('issues new tokens with valid refresh token', async () => {
      const reg = await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken: reg.body.refreshToken,
      });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });
  });
});
```

#### Tasks Integration Tests

```javascript
// server/src/__tests__/integration/tasks.test.js
const request = require('supertest');
const app = require('../../app');

describe('Task Endpoints', () => {
  let authToken;
  let project, board, column;

  beforeEach(async () => {
    // Register and login
    const auth = await request(app).post('/api/auth/register').send({
      username: 'testuser', email: 'test@test.com',
      displayName: 'Test', password: 'Password123!',
    });
    authToken = auth.body.accessToken;

    // Create project
    const projRes = await request(app).post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Project', description: 'Test' });
    project = projRes.body;

    // Create board (should auto-create columns)
    const boardRes = await request(app).post('/api/boards')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Board', project: project._id });
    board = boardRes.body;

    // Get columns
    const boardData = await request(app).get(`/api/boards/${board._id}`)
      .set('Authorization', `Bearer ${authToken}`);
    column = boardData.body.columns[0];
  });

  describe('POST /api/tasks', () => {
    test('creates a task with required fields', async () => {
      const res = await request(app).post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'New Task', column: column._id, board: board._id, project: project._id });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('New Task');
      expect(res.body.status).toBe('open');
    });

    test('rejects task without title', async () => {
      const res = await request(app).post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ column: column._id, board: board._id, project: project._id });
      expect(res.status).toBe(400);
    });

    test('rejects unauthenticated request', async () => {
      const res = await request(app).post('/api/tasks')
        .send({ title: 'Test', column: column._id, board: board._id, project: project._id });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/tasks/board/:boardId', () => {
    test('returns all tasks for a board', async () => {
      // Create 3 tasks
      await request(app).post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Task 1', column: column._id, board: board._id, project: project._id });
      await request(app).post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Task 2', column: column._id, board: board._id, project: project._id });
      await request(app).post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Task 3', column: column._id, board: board._id, project: project._id });

      const res = await request(app).get(`/api/tasks/board/${board._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3);
    });
  });

  describe('PATCH /api/tasks/:id/move', () => {
    test('moves task to a different column', async () => {
      // Create task
      const task = await request(app).post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Task', column: column._id, board: board._id, project: project._id });

      // Get second column
      const boardData = await request(app).get(`/api/boards/${board._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      const column2 = boardData.body.columns[1];

      const res = await request(app).patch(`/api/tasks/${task.body._id}/move`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ column: column2._id, position: 0 });
      expect(res.status).toBe(200);
      expect(res.body.column).toBe(column2._id);
    });
  });

  describe('POST /api/tasks/bulk', () => {
    test('bulk updates multiple tasks', async () => {
      const t1 = await request(app).post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'T1', column: column._id, board: board._id, project: project._id });
      const t2 = await request(app).post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'T2', column: column._id, board: board._id, project: project._id });

      const res = await request(app).post('/api/tasks/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taskIds: [t1.body._id, t2.body._id],
          updates: { priority: 'urgent' },
        });
      expect(res.status).toBe(200);
      expect(res.body.modifiedCount).toBe(2);
    });
  });
});
```

---

## 5. Frontend Testing

### 5.1 Jest Configuration

```typescript
// client/jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default createJestConfig(config);
```

### 5.2 Test Setup

```typescript
// client/jest.setup.ts
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useParams: () => ({}),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock API
jest.mock('@/lib/api', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));
```

### 5.3 Component Tests

#### TaskCard Tests

```typescript
// client/__tests__/components/board/TaskCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '@/components/board/TaskCard';

const mockTask = {
  _id: '1',
  title: 'Test Task',
  priority: 'high',
  assignee: { _id: 'u1', displayName: 'John', avatar: '' },
  dueDate: new Date(Date.now() + 86400000).toISOString(),  // Tomorrow
  labels: ['bug', 'frontend'],
  subtasks: [
    { _id: 's1', title: 'Sub 1', status: 'done' },
    { _id: 's2', title: 'Sub 2', status: 'todo' },
  ],
  commentsCount: 3,
  color: '#ef4444',
};

describe('TaskCard', () => {
  test('renders task title', () => {
    render(<TaskCard task={mockTask} onClick={() => {}} index={0} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('renders priority badge', () => {
    render(<TaskCard task={mockTask} onClick={() => {}} index={0} />);
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  test('renders labels', () => {
    render(<TaskCard task={mockTask} onClick={() => {}} index={0} />);
    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
  });

  test('renders subtask progress', () => {
    render(<TaskCard task={mockTask} onClick={() => {}} index={0} />);
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  test('renders assignee avatar', () => {
    render(<TaskCard task={mockTask} onClick={() => {}} index={0} />);
    expect(screen.getByText('J')).toBeInTheDocument();  // Avatar initial
  });

  test('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<TaskCard task={mockTask} onClick={onClick} index={0} />);
    fireEvent.click(screen.getByText('Test Task'));
    expect(onClick).toHaveBeenCalledWith(mockTask);
  });

  test('displays due date in readable format', () => {
    render(<TaskCard task={mockTask} onClick={() => {}} index={0} />);
    // Should show the formatted date, not the ISO string
    expect(screen.queryByText(mockTask.dueDate)).not.toBeInTheDocument();
  });
});
```

#### Avatar Tests

```typescript
// client/__tests__/components/ui/Avatar.test.tsx
import { render, screen } from '@testing-library/react';
import Avatar from '@/components/ui/Avatar';

describe('Avatar', () => {
  test('renders image when src provided', () => {
    render(<Avatar src="/photo.jpg" name="John Doe" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/photo.jpg');
  });

  test('renders initials when no src', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  test('renders single initial for single name', () => {
    render(<Avatar name="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  test('applies size classes', () => {
    const { container } = render(<Avatar name="John" size="lg" />);
    expect(container.firstChild).toHaveClass('w-10', 'h-10');
  });
});
```

#### Auth Store Tests

```typescript
// client/__tests__/stores/authStore.test.ts
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

jest.mock('@/lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null, accessToken: null, refreshToken: null, isLoading: false,
    });
  });

  test('login sets user and tokens on success', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {
        user: { _id: '1', email: 'test@test.com', displayName: 'Test' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    });

    await useAuthStore.getState().login('test@test.com', 'password');
    const state = useAuthStore.getState();
    expect(state.user?.email).toBe('test@test.com');
    expect(state.accessToken).toBe('access-token');
  });

  test('logout clears user and tokens', async () => {
    useAuthStore.setState({
      user: { _id: '1', email: 'test@test.com' } as any,
      accessToken: 'token',
      refreshToken: 'rf-token',
    });

    await useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });
});
```

#### Board Store Tests

```typescript
// client/__tests__/stores/boardStore.test.ts
import { useBoardStore } from '@/store/boardStore';
import api from '@/lib/api';

jest.mock('@/lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('boardStore', () => {
  const mockBoard = {
    _id: 'board-1',
    title: 'Test Board',
    columns: [
      { _id: 'col-1', title: 'Todo', tasks: [{ _id: 't1', title: 'Task 1' }], position: 0 },
      { _id: 'col-2', title: 'Done', tasks: [], position: 1 },
    ],
  };

  test('fetchBoard sets board data', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: mockBoard });
    await useBoardStore.getState().fetchBoard('board-1');
    expect(useBoardStore.getState().board?.title).toBe('Test Board');
  });

  test('optimisticMoveTask moves task between columns locally', () => {
    useBoardStore.setState({ board: mockBoard as any });
    useBoardStore.getState().optimisticMoveTask('t1', 'col-1', 'col-2', 0);

    const state = useBoardStore.getState();
    expect(state.board?.columns[0].tasks).toHaveLength(0);
    expect(state.board?.columns[1].tasks).toHaveLength(1);
  });
});
```

---

## 6. End-to-End Tests (Cypress)

### 6.1 Cypress Configuration

```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```

### 6.2 Custom Commands

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('register', (user = {
  username: 'testuser',
  email: 'test@example.com',
  displayName: 'Test User',
  password: 'Password123!',
}) => {
  cy.request('POST', '/api/auth/register', user).then((res) => {
    window.localStorage.setItem('accessToken', res.body.accessToken);
    window.localStorage.setItem('refreshToken', res.body.refreshToken);
  });
});

Cypress.Commands.add('login', (email = 'test@example.com', password = 'Password123!') => {
  cy.request('POST', '/api/auth/login', { email, password }).then((res) => {
    window.localStorage.setItem('accessToken', res.body.accessToken);
    window.localStorage.setItem('refreshToken', res.body.refreshToken);
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      register(user?: object): Chainable;
      login(email?: string, password?: string): Chainable;
    }
  }
}
```

### 6.3 Auth E2E

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('shows login form', () => {
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Sign In');
  });

  it('registers a new user', () => {
    cy.contains('Create an account').click();
    cy.get('input[name="username"]').type('newuser');
    cy.get('input[name="email"]').type('new@example.com');
    cy.get('input[name="displayName"]').type('New User');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('logs in with valid credentials', () => {
    cy.register();
    cy.visit('/auth/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('shows error for invalid credentials', () => {
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('WrongPass123!');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid credentials').should('be.visible');
  });
});
```

### 6.4 Board E2E

```typescript
// cypress/e2e/board.cy.ts
describe('Kanban Board', () => {
  beforeEach(() => {
    cy.register();
    // Create project and board via API
    cy.request({
      method: 'POST', url: '/api/projects',
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      body: { name: 'E2E Project' },
    }).then((proj) => {
      cy.request({
        method: 'POST', url: '/api/boards',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: { title: 'E2E Board', project: proj.body._id },
      }).as('board');
    });

    cy.get('@board').then((board: any) => {
      cy.visit(`/projects/${board.body.project}/board/${board.body._id}`);
    });
  });

  it('displays board with default columns', () => {
    cy.contains('Backlog').should('be.visible');
    cy.contains('Todo').should('be.visible');
    cy.contains('In Progress').should('be.visible');
    cy.contains('Done').should('be.visible');
  });

  it('creates a new task', () => {
    cy.contains('Add task').first().click();
    cy.get('input[placeholder*="task title"]').type('New E2E Task');
    cy.get('button').contains('Add').click();
    cy.contains('New E2E Task').should('be.visible');
  });

  it('opens task detail modal on click', () => {
    // Create task first
    cy.contains('Add task').first().click();
    cy.get('input[placeholder*="task title"]').type('Detail Task');
    cy.get('button').contains('Add').click();

    cy.contains('Detail Task').click();
    cy.get('[data-testid="task-detail-modal"]').should('be.visible');
    cy.contains('Detail Task').should('be.visible');
  });
});
```

### 6.5 Task Lifecycle E2E

```typescript
// cypress/e2e/task-lifecycle.cy.ts
describe('Task Lifecycle', () => {
  beforeEach(() => {
    cy.register();
    // Setup via API...
  });

  it('full task lifecycle: create → assign → move → comment → complete', () => {
    // Create
    cy.contains('Add task').first().click();
    cy.get('input[placeholder*="task title"]').type('Lifecycle Task');
    cy.get('button').contains('Add').click();
    cy.contains('Lifecycle Task').should('be.visible');

    // Open detail
    cy.contains('Lifecycle Task').click();

    // Set priority
    cy.get('[data-testid="priority-select"]').select('high');

    // Add comment
    cy.get('[data-testid="comment-input"]').type('This is a test comment');
    cy.get('[data-testid="comment-submit"]').click();
    cy.contains('This is a test comment').should('be.visible');

    // Close modal
    cy.get('[data-testid="modal-close"]').click();

    // Drag to "Done" column (or use move API)
    // Cypress drag-and-drop with @hello-pangea/dnd requires custom handling
    // Alternative: use keyboard-based move or API call
  });
});
```

---

## 7. Security Testing

### 7.1 Security Checklist

| # | Test | Method | Pass Criteria |
|---|------|--------|--------------|
| 1 | SQL/NoSQL injection on all input fields | Manual + automated | No query manipulation possible |
| 2 | XSS via task title, description, comments | Manual | HTML/JS is escaped in output |
| 3 | CSRF protection | Verify SameSite cookies + token | Requests from other origins rejected |
| 4 | JWT tampering | Modify token payload | Returns 401 Unauthorized |
| 5 | Privilege escalation | Try admin routes as normal user | Returns 403 Forbidden |
| 6 | Rate limiting on login | Send 20+ requests quickly | Returns 429 after limit |
| 7 | Password hashing verification | Check DB directly | Passwords stored as bcrypt hashes |
| 8 | File upload restrictions | Upload .exe, oversized files | Rejected with proper error |
| 9 | Authorization bypass | Access other users' projects | Returns 403 or 404 |
| 10 | Sensitive data exposure | Check API responses | No password hashes, tokens in responses |

### 7.2 Security Test Examples

```javascript
// server/src/__tests__/integration/security.test.js
const request = require('supertest');
const app = require('../../app');

describe('Security Tests', () => {
  let userToken, adminToken;

  beforeEach(async () => {
    // Register normal user
    const user = await request(app).post('/api/auth/register').send({
      username: 'user', email: 'user@test.com', displayName: 'User', password: 'Password123!',
    });
    userToken = user.body.accessToken;

    // Register admin (set role manually)
    const admin = await request(app).post('/api/auth/register').send({
      username: 'admin', email: 'admin@test.com', displayName: 'Admin', password: 'Password123!',
    });
    adminToken = admin.body.accessToken;
    const User = require('../../models/User');
    await User.findByIdAndUpdate(admin.body.user._id, { role: 'admin' });
  });

  test('NoSQL injection in login is prevented', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: { $gt: '' },     // NoSQL injection attempt
      password: { $gt: '' },
    });
    expect(res.status).toBe(400);  // Validation rejects non-string
  });

  test('XSS in task title is stored but not executed', async () => {
    // Create project + board first...
    const res = await request(app).post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: '<script>alert("xss")</script>',
        column: 'col-id', board: 'board-id', project: 'proj-id',
      });
    // Title should be stored as-is (frontend escapes on render)
    // Or validate/sanitize on input
    expect(res.body.title).not.toContain('<script>');
  });

  test('JWT with tampered payload is rejected', async () => {
    const tamperedToken = userToken.split('.').map((part, i) => {
      if (i === 1) {
        const payload = JSON.parse(Buffer.from(part, 'base64').toString());
        payload.role = 'admin';
        return Buffer.from(JSON.stringify(payload)).toString('base64');
      }
      return part;
    }).join('.');

    const res = await request(app).get('/api/users/me')
      .set('Authorization', `Bearer ${tamperedToken}`);
    expect(res.status).toBe(401);
  });

  test('non-admin cannot access admin routes', async () => {
    const res = await request(app).get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test('rate limiting kicks in after threshold', async () => {
    const promises = Array(25).fill(null).map(() =>
      request(app).post('/api/auth/login').send({
        email: 'test@test.com', password: 'wrong',
      })
    );
    const results = await Promise.all(promises);
    const rateLimited = results.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  test('password hash is never returned in API response', async () => {
    const res = await request(app).get('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.body.passwordHash).toBeUndefined();
    expect(res.body.password).toBeUndefined();
  });
});
```

---

## 8. Performance Testing

### 8.1 Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 30
      arrivalRate: 10
      name: "Warm up"
    - duration: 60
      arrivalRate: 50
      name: "Sustained load"
  defaults:
    headers:
      Content-Type: "application/json"

scenarios:
  - name: "Login and browse"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "load-test@test.com"
            password: "Password123!"
          capture:
            json: "$.accessToken"
            as: "token"
      - get:
          url: "/api/projects"
          headers:
            Authorization: "Bearer {{ token }}"
      - get:
          url: "/api/boards/{{ boardId }}"
          headers:
            Authorization: "Bearer {{ token }}"

  - name: "Create tasks"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "load-test@test.com"
            password: "Password123!"
          capture:
            json: "$.accessToken"
            as: "token"
      - post:
          url: "/api/tasks"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            title: "Load test task {{ $randomNumber() }}"
            column: "{{ columnId }}"
            board: "{{ boardId }}"
            project: "{{ projectId }}"
```

### 8.2 Performance Benchmarks

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| API Response Time (p95) | < 200ms | Artillery load test |
| Board Load (50 tasks) | < 500ms | Browser DevTools |
| Board Load (200 tasks) | < 2s | Browser DevTools |
| Authentication (login) | < 300ms | Supertest |
| Analytics aggregation | < 1s | MongoDB profiler |
| Drag-and-drop (optimistic) | < 100ms | React Profiler |
| Memory usage (server) | < 256MB | process.memoryUsage() |
| Concurrent users | 50+ | Artillery |

---

## 9. Bug Triage and Fixing

### 9.1 Bug Priority Matrix

| Severity | Description | SLA |
|----------|------------|-----|
| **P0 — Critical** | App crashes, data loss, auth bypass | Fix within 4 hours |
| **P1 — High** | Feature broken, incorrect data | Fix within 1 day |
| **P2 — Medium** | UI issues, minor feature quirks | Fix within 2 days |
| **P3 — Low** | Cosmetic, typos, edge cases | Fix if time permits |

### 9.2 Bug Report Template

```markdown
## Bug Report

**Title:** [Short description]
**Severity:** P0 / P1 / P2 / P3
**Reporter:** [Name]
**Date:** [Date]

### Steps to Reproduce
1. ...
2. ...
3. ...

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screenshots
[If applicable]

### Environment
- Browser: Chrome/Firefox
- Node.js version: 20.x
- MongoDB version: 7.x
```

---

## 10. Documentation

### 10.1 Final Report Structure (40–60 pages)

```
1. Title Page
   - Project title, team members, date, institution

2. Certificate / Declaration

3. Acknowledgements

4. Table of Contents

5. List of Figures / Tables

6. Abstract (1 page)
   - Problem, approach, tools used, outcomes

7. Chapter 1: Introduction (3-4 pages)
   - 1.1 Background
   - 1.2 Problem Statement
   - 1.3 Objectives
   - 1.4 Scope
   - 1.5 Report Organization

8. Chapter 2: Literature Survey (4-5 pages)
   - 2.1 Existing Project Management Tools
   - 2.2 Kanboard (Original PHP Application)
   - 2.3 Modern Web Technologies (Next.js, Express, MongoDB)
   - 2.4 Comparison Table

9. Chapter 3: Reverse Engineering (5-6 pages)
   - 3.1 Methodology
   - 3.2 Original Kanboard Architecture Analysis
   - 3.3 Entity Relationship Extraction
   - 3.4 Workflow and Process Analysis
   - 3.5 Gap Analysis and Improvement Opportunities
   - 3.6 Software Requirements Specification

10. Chapter 4: System Design (6-8 pages)
    - 4.1 Use Case Diagrams
    - 4.2 Sequence Diagrams
    - 4.3 Class/Entity Diagrams
    - 4.4 Database Schema Design
    - 4.5 API Design
    - 4.6 System Architecture Diagram

11. Chapter 5: Implementation (8-10 pages)
    - 5.1 Technology Stack
    - 5.2 Backend Implementation
      - 5.2.1 Express.js Server Setup
      - 5.2.2 Authentication System
      - 5.2.3 REST API Endpoints
      - 5.2.4 Event-Driven Architecture
    - 5.3 Frontend Implementation
      - 5.3.1 Next.js App Router Structure
      - 5.3.2 Component Architecture
      - 5.3.3 State Management
      - 5.3.4 Kanban Board with Drag-and-Drop

12. Chapter 6: Enhancements (6-8 pages)
    - 6.1 Task Automation Rules
    - 6.2 Analytics & Reporting Dashboard
    - 6.3 Enhanced Workflow Management
    - 6.4 Notification System

13. Chapter 7: Testing (4-5 pages)
    - 7.1 Test Strategy
    - 7.2 Unit Testing Results
    - 7.3 Integration Testing Results
    - 7.4 End-to-End Testing
    - 7.5 Security Testing
    - 7.6 Performance Testing
    - 7.7 Test Coverage Report

14. Chapter 8: Results & Screenshots (3-4 pages)
    - Login / Register
    - Dashboard
    - Kanban Board
    - Task Detail
    - Analytics Dashboard
    - Automation Rules
    - Notifications

15. Chapter 9: Conclusion & Future Work (2 pages)
    - 9.1 Summary of Achievements
    - 9.2 Limitations
    - 9.3 Future Enhancements

16. References

17. Appendices
    - A: Source Code Listing (key files)
    - B: API Documentation
    - C: Database Schema Reference
    - D: User Manual
```

### 10.2 User Manual Structure (10–15 pages)

```
1. Introduction
   - What is Kanboard?
   - System Requirements

2. Getting Started
   - Installation Steps
   - Creating an Account
   - Logging In

3. Dashboard
   - Overview
   - Navigation

4. Projects
   - Creating a Project
   - Inviting Members
   - Project Settings

5. Boards
   - Creating a Board
   - Adding Columns
   - Swimlanes

6. Tasks
   - Creating Tasks
   - Editing Tasks
   - Moving Tasks (Drag-and-Drop)
   - Subtasks
   - Comments
   - Attachments
   - Dependencies

7. Automation Rules
   - Creating Rules
   - Triggers and Actions
   - Managing Rules

8. Analytics Dashboard
   - Viewing Reports
   - Date Range Filtering
   - Exporting Data

9. Notifications
   - In-App Notifications
   - Email Preferences
   - Webhook Configuration

10. Admin Features
    - User Management
    - System Settings

11. Troubleshooting / FAQ
```

### 10.3 Presentation Structure (15–20 slides)

```
Slide 1:  Title Slide (Project name, team, institution)
Slide 2:  Agenda / Outline
Slide 3:  Problem Statement & Motivation
Slide 4:  Objectives
Slide 5:  Literature Survey Summary
Slide 6:  Reverse Engineering Process
Slide 7:  Original vs. New Architecture Comparison
Slide 8:  Technology Stack
Slide 9:  System Architecture Diagram
Slide 10: Database Design (ER Diagram)
Slide 11: Backend Implementation Highlights
Slide 12: Frontend Implementation Highlights
Slide 13: Demo Screenshot — Login & Dashboard
Slide 14: Demo Screenshot — Kanban Board
Slide 15: Enhancement 1 — Task Automation
Slide 16: Enhancement 2 — Analytics Dashboard
Slide 17: Enhancement 3 — Enhanced Workflow
Slide 18: Enhancement 4 — Notification System
Slide 19: Testing Results & Coverage
Slide 20: Conclusion & Future Work
Slide 21: Q&A
```

---

## 11. Deployment & Packaging

### 11.1 Docker Compose (Production)

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongo:
    image: mongo:7
    container_name: kanboard-mongo
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: kanboard
      MONGO_INITDB_ROOT_PASSWORD: kanboard123

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: kanboard-server
    ports:
      - '5000:5000'
    depends_on:
      - mongo
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://kanboard:kanboard123@mongo:27017/kanboard?authSource=admin
      - JWT_SECRET=your-jwt-secret-change-in-production
      - JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
      - PORT=5000
    restart: unless-stopped

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: kanboard-client
    ports:
      - '3000:3000'
    depends_on:
      - server
    environment:
      - NEXT_PUBLIC_API_URL=http://server:5000/api
    restart: unless-stopped

volumes:
  mongo-data:
```

### 11.2 Server Dockerfile

```dockerfile
# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
```

### 11.3 Client Dockerfile

```dockerfile
# client/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
```

### 11.4 Database Seed Script

```javascript
// server/src/scripts/seed.js
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/password');

const User = require('../models/User');
const Project = require('../models/Project');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kanboard');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Board.deleteMany({}),
    Column.deleteMany({}),
    Task.deleteMany({}),
  ]);

  // Create admin user
  const admin = await User.create({
    username: 'admin',
    email: 'admin@kanboard.local',
    displayName: 'Admin User',
    passwordHash: await hashPassword('admin123'),
    role: 'admin',
  });

  // Create demo user
  const user = await User.create({
    username: 'demo',
    email: 'demo@kanboard.local',
    displayName: 'Demo User',
    passwordHash: await hashPassword('demo123'),
    role: 'user',
  });

  // Create project
  const project = await Project.create({
    name: 'Demo Project',
    description: 'A demo project for showcasing Kanboard features.',
    owner: admin._id,
    members: [{ user: user._id, role: 'member' }],
  });

  // Create board
  const board = await Board.create({
    title: 'Sprint Board',
    project: project._id,
  });

  // Create columns
  const columns = await Column.insertMany([
    { title: 'Backlog',     board: board._id, position: 0, wipLimit: 0 },
    { title: 'Todo',        board: board._id, position: 1, wipLimit: 5 },
    { title: 'In Progress', board: board._id, position: 2, wipLimit: 3 },
    { title: 'Review',      board: board._id, position: 3, wipLimit: 3 },
    { title: 'Done',        board: board._id, position: 4, wipLimit: 0 },
  ]);

  // Create sample tasks
  const tasks = [
    { title: 'Setup project structure', column: columns[4]._id, status: 'completed', priority: 'high' },
    { title: 'Implement authentication', column: columns[4]._id, status: 'completed', priority: 'high' },
    { title: 'Design database schema', column: columns[4]._id, status: 'completed', priority: 'high' },
    { title: 'Build REST API endpoints', column: columns[3]._id, status: 'open', priority: 'high', assignee: user._id },
    { title: 'Create Kanban board UI', column: columns[2]._id, status: 'open', priority: 'high', assignee: user._id },
    { title: 'Add drag-and-drop', column: columns[2]._id, status: 'open', priority: 'medium', assignee: admin._id },
    { title: 'Implement task detail modal', column: columns[1]._id, status: 'open', priority: 'medium' },
    { title: 'Add automation rules', column: columns[1]._id, status: 'open', priority: 'medium' },
    { title: 'Build analytics dashboard', column: columns[0]._id, status: 'open', priority: 'low' },
    { title: 'Setup notification system', column: columns[0]._id, status: 'open', priority: 'low' },
    { title: 'Write unit tests', column: columns[0]._id, status: 'open', priority: 'medium' },
    { title: 'Write documentation', column: columns[0]._id, status: 'open', priority: 'low' },
  ];

  for (const taskData of tasks) {
    await Task.create({
      ...taskData,
      board: board._id,
      project: project._id,
      creator: admin._id,
    });
  }

  console.log('Seed complete!');
  console.log('Admin login: admin@kanboard.local / admin123');
  console.log('Demo login:  demo@kanboard.local / demo123');

  await mongoose.disconnect();
}

seed().catch(console.error);
```

---

## 12. Final Checklist

### 12.1 Code Quality

| # | Task | Status |
|---|------|--------|
| 1 | Remove all `console.log` debug statements | ☐ |
| 2 | Add JSDoc comments to all service functions | ☐ |
| 3 | Run ESLint on backend + frontend (0 errors) | ☐ |
| 4 | Run Prettier for consistent formatting | ☐ |
| 5 | Remove unused imports, variables, files | ☐ |
| 6 | Check for hardcoded secrets (use .env) | ☐ |
| 7 | Verify .gitignore covers node_modules, .env, coverage, .next | ☐ |

### 12.2 Testing

| # | Task | Status |
|---|------|--------|
| 1 | All unit tests pass | ☐ |
| 2 | All integration tests pass | ☐ |
| 3 | All E2E tests pass | ☐ |
| 4 | Backend coverage > 80% | ☐ |
| 5 | Frontend coverage > 70% | ☐ |
| 6 | Security tests pass (no critical issues) | ☐ |
| 7 | Performance benchmarks documented | ☐ |

### 12.3 Documentation

| # | Task | Status |
|---|------|--------|
| 1 | Final report (40-60 pages) | ☐ |
| 2 | User manual (10-15 pages) | ☐ |
| 3 | Presentation (15-20 slides) | ☐ |
| 4 | README.md updated with setup instructions | ☐ |
| 5 | API documentation (Swagger or markdown) | ☐ |

### 12.4 Deployment

| # | Task | Status |
|---|------|--------|
| 1 | Docker Compose runs successfully | ☐ |
| 2 | Seed script populates demo data | ☐ |
| 3 | Application accessible at localhost:3000 | ☐ |
| 4 | All features functional in containerized environment | ☐ |

### 12.5 Git

| # | Task | Status |
|---|------|--------|
| 1 | All code committed with meaningful messages | ☐ |
| 2 | Branches merged to main | ☐ |
| 3 | Release tag v1.0.0 created | ☐ |
| 4 | Repository clean (no .env, node_modules) | ☐ |

---

## 13. Commands Reference

```bash
# Run all backend tests
cd server && npm test

# Run backend tests with coverage
cd server && npm test -- --coverage

# Run a specific test file
cd server && npx jest src/__tests__/integration/auth.test.js

# Run frontend tests
cd client && npm test

# Run frontend tests with coverage
cd client && npm test -- --coverage

# Run Cypress E2E (headless)
npx cypress run

# Run Cypress E2E (interactive)
npx cypress open

# Lint check
cd server && npx eslint src/
cd client && npx next lint

# Build production
cd client && npm run build
cd server && npm start

# Docker build & run
docker-compose up --build

# Seed database
cd server && node src/scripts/seed.js

# Create Git release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

## 14. Submission Package Contents

```
kanboard-submission/
├── source-code/
│   ├── client/             # Next.js frontend
│   ├── server/             # Express.js backend
│   ├── docker-compose.yml
│   └── README.md           # Setup instructions
├── documentation/
│   ├── final-report.pdf    # 40-60 pages
│   ├── user-manual.pdf     # 10-15 pages
│   └── srs-document.pdf    # Software Requirements Specification
├── presentation/
│   └── kanboard-presentation.pptx  # 15-20 slides
├── test-results/
│   ├── backend-coverage/   # Jest coverage report
│   ├── frontend-coverage/  # Jest coverage report
│   ├── e2e-screenshots/    # Cypress screenshots
│   └── test-summary.md     # Summary of all test results
└── demo/
    └── setup-guide.md      # How to run the demo locally
```
