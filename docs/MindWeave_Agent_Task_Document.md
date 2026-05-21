# MindWeave - Development Agent Task Document

## Project Overview

**Application:** MindWeave - AI-Powered Mental Health Journaling App  
**Stack:** React (Frontend) + Node.js/Express (Backend) + PostgreSQL (Database)  
**Architecture:** RESTful API with JWT authentication and Role-Based Access Control (RBAC)  
**Purpose:** Mobile-first journaling app with AI-powered weekly story generation and insights

---

## Technology Stack Details

### Frontend
- **Framework:** React 18+ (Create React App or Vite)
- **UI Library:** Material-UI or Tailwind CSS
- **State Management:** React Context API + React Query for server state
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form + Zod validation
- **Date/Time:** date-fns or dayjs
- **Rich Text Editor:** Draft.js or Slate.js (for journal entries)
- **Charts:** Recharts (for mood tracking visualizations)

### Backend
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js 4.x
- **ORM:** Sequelize 6.x (for PostgreSQL)
- **Authentication:** JWT (jsonwebtoken + bcryptjs)
- **Validation:** express-validator or Joi
- **Security:** helmet, cors, express-rate-limit
- **Environment:** dotenv
- **Logging:** winston or pino
- **API Documentation:** Swagger/OpenAPI

### Database
- **Database:** PostgreSQL 15+
- **Connection Pool:** pg (node-postgres) via Sequelize
- **Migrations:** Sequelize CLI
- **Backup Strategy:** pg_dump automated daily

### AI Integration
- **AI Provider:** Anthropic Claude API (for story generation, reflections, insights)
- **AI SDK:** @anthropic-ai/sdk

### DevOps & Infrastructure
- **Version Control:** Git + GitHub/GitLab
- **Container:** Docker + Docker Compose
- **Environment Management:** .env files (development, staging, production)
- **Deployment:** AWS (EC2 + RDS) or Vercel (Frontend) + Railway (Backend)

---

## Database Architecture

### User Management & Authentication Research Summary

Based on industry best practices for 2026:

**Key Findings:**
1. **JWT Authentication** - Store JWT on client-side (localStorage/sessionStorage), include in Authorization header
2. **Password Hashing** - Use bcrypt with cost factor 10-12 (never store plaintext)
3. **RBAC Implementation** - Create roles table, assign permissions via many-to-many relationships
4. **Session Management** - Use refresh tokens + short-lived access tokens (15 min access, 7 day refresh)
5. **Rate Limiting** - Implement on login/registration endpoints to prevent brute force
6. **Database Roles** - PostgreSQL application-level roles (not DB roles) stored in tables

### Database Schema

#### 1. Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'premium', 'master'
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_subscription ON users(subscription_tier);
```

#### 2. Roles Table (RBAC)
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'user', 'premium_user', 'master'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
    ('user', 'Free tier user with basic features'),
    ('premium_user', 'Premium subscriber with all features'),
    ('master', 'Master user with admin privileges and all features unlocked');
```

#### 3. Permissions Table
```sql
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- 'write_entry', 'view_weekly_story', etc.
    description TEXT,
    category VARCHAR(50), -- 'journaling', 'ai_features', 'export', 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert permissions
INSERT INTO permissions (name, description, category) VALUES 
    ('write_entry', 'Create journal entries', 'journaling'),
    ('view_entries', 'Read own journal entries', 'journaling'),
    ('generate_weekly_story', 'Generate AI weekly story', 'ai_features'),
    ('receive_ai_reflections', 'Get AI reflective responses', 'ai_features'),
    ('view_pattern_insights', 'Access pattern recognition insights', 'ai_features'),
    ('generate_monthly_report', 'Generate monthly deep insights', 'ai_features'),
    ('unlimited_history', 'Access unlimited entry history', 'storage'),
    ('cloud_backup', 'Enable cloud backup and sync', 'storage'),
    ('export_data', 'Export entries as PDF/text', 'export'),
    ('multiple_story_styles', 'Choose from multiple story narrative styles', 'ai_features'),
    ('voice_transcription', 'Use voice-to-text for entries', 'journaling'),
    ('custom_themes', 'Access custom themes and fonts', 'appearance'),
    ('admin_access', 'Full system administration', 'admin');
```

#### 4. Role_Permissions Junction Table
```sql
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Free tier permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE name IN (
    'write_entry', 
    'view_entries', 
    'generate_weekly_story' -- Basic weekly story only
);

-- Premium tier permissions (all features except admin)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE category != 'admin';

-- Master permissions (everything)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions;
```

#### 5. Journal Entries Table
```sql
CREATE TABLE journal_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    entry_text TEXT NOT NULL,
    mood_before VARCHAR(20), -- 'heavy', 'sad', 'okay', 'good', 'great'
    mood_after VARCHAR(20),
    tags TEXT[], -- Array of tags like ['anxiety', 'gratitude', 'breakthrough']
    word_count INTEGER,
    is_voice_transcription BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_entries_user_date ON journal_entries(user_id, entry_date DESC);
CREATE INDEX idx_entries_user_created ON journal_entries(user_id, created_at DESC);
```

#### 6. Weekly Stories Table
```sql
CREATE TABLE weekly_stories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    story_title VARCHAR(255),
    story_content TEXT NOT NULL,
    narrative_style VARCHAR(50) DEFAULT 'third_person', -- 'third_person', 'letter', 'chapter'
    emotional_journey JSONB, -- JSON array of daily moods
    key_themes TEXT[],
    highlighted_quotes TEXT[],
    strength_recognition TEXT,
    entry_count INTEGER, -- Number of entries that week
    ai_processing_time INTEGER, -- milliseconds
    is_favorited BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_stories_user_week ON weekly_stories(user_id, week_start_date DESC);
```

#### 7. AI Reflections Table
```sql
CREATE TABLE ai_reflections (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reflection_text TEXT NOT NULL,
    reflection_type VARCHAR(50) DEFAULT 'post_entry', -- 'post_entry', 'pattern_alert', 'strength_recognition'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_reflections_entry ON ai_reflections(entry_id);
CREATE INDEX idx_reflections_user ON ai_reflections(user_id, created_at DESC);
```

#### 8. Pattern Insights Table
```sql
CREATE TABLE pattern_insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50), -- 'trigger', 'coping_mechanism', 'mood_correlation', 'writing_pattern'
    insight_title VARCHAR(255),
    insight_description TEXT,
    supporting_data JSONB, -- JSON with evidence/data points
    date_range_start DATE,
    date_range_end DATE,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    is_acknowledged BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_insights_user ON pattern_insights(user_id, created_at DESC);
```

#### 9. Subscriptions Table
```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subscription_tier VARCHAR(20) NOT NULL, -- 'free', 'premium'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
    payment_provider VARCHAR(50), -- 'stripe', 'paypal', NULL for free
    payment_provider_id VARCHAR(255), -- External subscription ID
    billing_cycle VARCHAR(20), -- 'monthly', 'annual'
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    trial_start_date TIMESTAMP,
    trial_end_date TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### 10. Refresh Tokens Table (for JWT refresh token rotation)
```sql
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    replaced_by_token VARCHAR(500)
);

-- Indexes
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Auto-delete expired tokens (run via cron job)
-- DELETE FROM refresh_tokens WHERE expires_at < NOW() - INTERVAL '30 days';
```

#### 11. User Preferences Table
```sql
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    ai_involvement_level VARCHAR(20) DEFAULT 'moderate', -- 'full', 'moderate', 'minimal'
    enable_reflective_responses BOOLEAN DEFAULT true,
    enable_pattern_insights BOOLEAN DEFAULT true,
    enable_writing_prompts BOOLEAN DEFAULT true,
    notification_daily_reminder BOOLEAN DEFAULT true,
    notification_time TIME DEFAULT '20:00:00',
    notification_weekly_story BOOLEAN DEFAULT true,
    theme VARCHAR(20) DEFAULT 'system', -- 'light', 'dark', 'system'
    text_size VARCHAR(20) DEFAULT 'medium', -- 'small', 'medium', 'large'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 12. Milestones Table
```sql
CREATE TABLE milestones (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL, -- 'first_entry', '7_days', '30_days', '100_entries'
    milestone_title VARCHAR(255),
    milestone_description TEXT,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_viewed BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_milestones_user ON milestones(user_id, achieved_at DESC);
```

#### 13. Audit Logs Table (for security and debugging)
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'login', 'logout', 'create_entry', 'delete_entry', etc.
    resource_type VARCHAR(50), -- 'entry', 'story', 'account'
    resource_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20), -- 'success', 'failed'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);
```

---

## API Architecture

### Base URL Structure
```
Development: http://localhost:5000/api/v1
Production: https://api.mindweave.com/api/v1
```

### Authentication Flow

**Registration Flow:**
1. User submits email, password, name
2. Server validates input
3. Hash password with bcrypt (cost factor 12)
4. Create user record with default 'user' role
5. Generate verification token (optional email verification)
6. Return JWT access token (15 min) + refresh token (7 days)

**Login Flow:**
1. User submits email + password
2. Server validates credentials
3. Check if account is active
4. Generate access token + refresh token
5. Store refresh token in database
6. Update last_login timestamp
7. Return tokens + user data (excluding password)

**Token Refresh Flow:**
1. Client sends refresh token
2. Server validates token (not expired, not revoked)
3. Generate new access token + new refresh token
4. Revoke old refresh token (mark with replaced_by_token)
5. Return new tokens

**Authorization Middleware:**
```javascript
// Pseudocode
function authorize(requiredPermissions) {
    return async (req, res, next) => {
        // 1. Extract JWT from Authorization header
        // 2. Verify JWT signature
        // 3. Get user from token payload
        // 4. Query user's role and permissions
        // 5. Check if user has required permissions
        // 6. If yes: next(), if no: 403 Forbidden
    }
}
```

---

## API Endpoints Specification

### 1. Authentication Endpoints

#### POST /api/v1/auth/register
Register a new user

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": 1,
            "email": "user@example.com",
            "name": "John Doe",
            "role": "user",
            "subscription_tier": "free",
            "created_at": "2026-05-21T10:00:00Z"
        },
        "access_token": "eyJhbGc...",
        "refresh_token": "eyJhbGc...",
        "expires_in": 900
    }
}
```

**Validation Rules:**
- Email: Valid email format, not already registered
- Password: Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
- Name: 2-100 characters

**Error Responses:**
- 400: Validation error (invalid email/password format)
- 409: Email already exists

---

#### POST /api/v1/auth/login
Authenticate user and get tokens

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "email": "user@example.com",
            "name": "John Doe",
            "role": "user",
            "subscription_tier": "free",
            "permissions": ["write_entry", "view_entries", "generate_weekly_story"]
        },
        "access_token": "eyJhbGc...",
        "refresh_token": "eyJhbGc...",
        "expires_in": 900
    }
}
```

**Error Responses:**
- 401: Invalid credentials
- 403: Account not active or not verified
- 429: Too many login attempts (rate limited)

**Rate Limiting:**
- 5 failed attempts per email per 15 minutes
- 10 requests per IP per minute

---

#### POST /api/v1/auth/refresh
Refresh access token using refresh token

**Request Body:**
```json
{
    "refresh_token": "eyJhbGc..."
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "access_token": "eyJhbGc...",
        "refresh_token": "eyJhbGc...",
        "expires_in": 900
    }
}
```

**Error Responses:**
- 401: Invalid or expired refresh token
- 403: Token revoked

---

#### POST /api/v1/auth/logout
Revoke refresh token (logout)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "refresh_token": "eyJhbGc..."
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

---

#### POST /api/v1/auth/forgot-password
Request password reset

**Request Body:**
```json
{
    "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Password reset email sent"
}
```

**Implementation:**
- Generate reset token (expires in 1 hour)
- Store in users.reset_password_token
- Send email with reset link
- Always return 200 even if email doesn't exist (security)

---

#### POST /api/v1/auth/reset-password
Reset password with token

**Request Body:**
```json
{
    "token": "reset_token_here",
    "new_password": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Password reset successful"
}
```

---

### 2. User Profile Endpoints

#### GET /api/v1/users/me
Get current user profile

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe",
        "role": "user",
        "subscription_tier": "free",
        "permissions": ["write_entry", "view_entries", "generate_weekly_story"],
        "is_verified": true,
        "created_at": "2026-01-15T10:00:00Z",
        "last_login": "2026-05-21T08:30:00Z",
        "preferences": {
            "ai_involvement_level": "moderate",
            "enable_reflective_responses": true,
            "theme": "system"
        }
    }
}
```

---

#### PUT /api/v1/users/me
Update user profile

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "name": "John Updated Doe"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "id": 1,
        "name": "John Updated Doe",
        "email": "user@example.com"
    }
}
```

---

#### PUT /api/v1/users/me/password
Change password (while logged in)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "current_password": "OldPassword123!",
    "new_password": "NewPassword123!"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Password changed successfully"
}
```

---

#### GET /api/v1/users/me/permissions
Get current user's permissions

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "permissions": [
            "write_entry",
            "view_entries",
            "generate_weekly_story"
        ],
        "role": "user",
        "subscription_tier": "free"
    }
}
```

---

### 3. User Preferences Endpoints

#### GET /api/v1/preferences
Get user preferences

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "ai_involvement_level": "moderate",
        "enable_reflective_responses": true,
        "enable_pattern_insights": true,
        "enable_writing_prompts": true,
        "notification_daily_reminder": true,
        "notification_time": "20:00:00",
        "notification_weekly_story": true,
        "theme": "system",
        "text_size": "medium"
    }
}
```

---

#### PUT /api/v1/preferences
Update user preferences

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "ai_involvement_level": "full",
    "theme": "dark",
    "notification_time": "19:00:00"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Preferences updated successfully",
    "data": {
        "ai_involvement_level": "full",
        "theme": "dark",
        "notification_time": "19:00:00"
    }
}
```

---

### 4. Journal Entry Endpoints

#### POST /api/v1/entries
Create a new journal entry

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `write_entry`

**Request Body:**
```json
{
    "entry_date": "2026-05-21",
    "entry_text": "Today was a difficult day, but I managed to go for a walk...",
    "mood_before": "sad",
    "mood_after": "okay",
    "tags": ["anxiety", "walking", "coping"],
    "is_voice_transcription": false
}
```

**Response (201 Created):**
```json
{
    "success": true,
    "message": "Entry created successfully",
    "data": {
        "id": 123,
        "entry_date": "2026-05-21",
        "entry_text": "Today was a difficult day...",
        "mood_before": "sad",
        "mood_after": "okay",
        "tags": ["anxiety", "walking", "coping"],
        "word_count": 87,
        "created_at": "2026-05-21T20:15:30Z",
        "ai_reflection": null  // Will be generated async if enabled
    }
}
```

**Business Logic:**
- Calculate word count
- Trigger AI reflection generation (async) if user has permission
- Check for milestone achievements (first entry, 7 days streak, etc.)

---

#### GET /api/v1/entries
Get all user's journal entries (paginated)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `view_entries`

**Query Parameters:**
```
?page=1&limit=20&sort=desc&start_date=2026-05-01&end_date=2026-05-21&mood=sad&tag=anxiety
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "entries": [
            {
                "id": 123,
                "entry_date": "2026-05-21",
                "entry_text": "Today was difficult...",
                "mood_before": "sad",
                "mood_after": "okay",
                "tags": ["anxiety", "walking"],
                "word_count": 87,
                "created_at": "2026-05-21T20:15:30Z"
            }
        ],
        "pagination": {
            "current_page": 1,
            "total_pages": 5,
            "total_entries": 95,
            "per_page": 20,
            "has_next": true,
            "has_prev": false
        }
    }
}
```

---

#### GET /api/v1/entries/:id
Get single journal entry

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `view_entries`

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 123,
        "entry_date": "2026-05-21",
        "entry_text": "Today was difficult...",
        "mood_before": "sad",
        "mood_after": "okay",
        "tags": ["anxiety", "walking", "coping"],
        "word_count": 87,
        "created_at": "2026-05-21T20:15:30Z",
        "updated_at": "2026-05-21T20:15:30Z",
        "ai_reflection": {
            "id": 45,
            "reflection_text": "It sounds like today was heavy...",
            "created_at": "2026-05-21T20:16:00Z"
        }
    }
}
```

---

#### PUT /api/v1/entries/:id
Update journal entry

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `write_entry`

**Request Body:**
```json
{
    "entry_text": "Updated text...",
    "tags": ["anxiety", "breakthrough"]
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Entry updated successfully",
    "data": {
        "id": 123,
        "entry_text": "Updated text...",
        "updated_at": "2026-05-21T21:00:00Z"
    }
}
```

---

#### DELETE /api/v1/entries/:id
Delete journal entry

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `write_entry`

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Entry deleted successfully"
}
```

---

#### GET /api/v1/entries/stats
Get user's journaling statistics

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "total_entries": 95,
        "current_streak": 7,
        "longest_streak": 21,
        "total_words_written": 45230,
        "avg_words_per_entry": 476,
        "entries_this_week": 5,
        "entries_this_month": 22,
        "most_common_tags": [
            {"tag": "anxiety", "count": 34},
            {"tag": "gratitude", "count": 28}
        ],
        "mood_distribution": {
            "heavy": 12,
            "sad": 23,
            "okay": 35,
            "good": 20,
            "great": 5
        }
    }
}
```

---

### 5. Weekly Story Endpoints

#### POST /api/v1/stories/generate
Manually generate weekly story (or regenerate)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `generate_weekly_story`

**Request Body:**
```json
{
    "week_start_date": "2026-05-15",
    "narrative_style": "third_person"  // 'third_person', 'letter', 'chapter'
}
```

**Response (202 Accepted):**
```json
{
    "success": true,
    "message": "Story generation started",
    "data": {
        "job_id": "story_gen_123456",
        "estimated_time": 30  // seconds
    }
}
```

**Background Process:**
1. Fetch all entries for that week
2. Call Claude API with story generation prompt
3. Parse response and extract themes, quotes
4. Save to weekly_stories table
5. Trigger notification when complete

---

#### GET /api/v1/stories
Get all user's weekly stories

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `generate_weekly_story`

**Query Parameters:**
```
?page=1&limit=10&sort=desc
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "stories": [
            {
                "id": 45,
                "week_start_date": "2026-05-15",
                "week_end_date": "2026-05-21",
                "story_title": "Your Week: May 15-21, 2026",
                "story_content": "This week, you carried something heavy...",
                "narrative_style": "third_person",
                "key_themes": ["self-compassion", "walking", "healing"],
                "entry_count": 5,
                "is_favorited": false,
                "created_at": "2026-05-22T09:00:00Z"
            }
        ],
        "pagination": {
            "current_page": 1,
            "total_pages": 3,
            "total_stories": 25
        }
    }
}
```

---

#### GET /api/v1/stories/:id
Get single weekly story with full details

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 45,
        "week_start_date": "2026-05-15",
        "week_end_date": "2026-05-21",
        "story_title": "Your Week: May 15-21, 2026",
        "story_content": "Full story content here...",
        "narrative_style": "third_person",
        "emotional_journey": [
            {"day": "Monday", "mood": "heavy"},
            {"day": "Tuesday", "mood": "sad"},
            {"day": "Wednesday", "mood": "reflective"}
        ],
        "key_themes": ["self-compassion", "walking", "healing"],
        "highlighted_quotes": [
            "Maybe healing isn't about feeling better..."
        ],
        "strength_recognition": "You chose yourself this week.",
        "entry_count": 5,
        "is_favorited": false,
        "created_at": "2026-05-22T09:00:00Z"
    }
}
```

---

#### PUT /api/v1/stories/:id/favorite
Toggle favorite status

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "is_favorited": true
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Story favorited successfully"
}
```

---

### 6. AI Features Endpoints

#### GET /api/v1/ai/reflections
Get AI reflections for user's entries

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `receive_ai_reflections`

**Query Parameters:**
```
?entry_id=123&unread_only=true&page=1&limit=20
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "reflections": [
            {
                "id": 45,
                "entry_id": 123,
                "reflection_text": "It sounds like today was heavy...",
                "reflection_type": "post_entry",
                "is_read": false,
                "created_at": "2026-05-21T20:16:00Z"
            }
        ]
    }
}
```

---

#### POST /api/v1/ai/reflections/:id/read
Mark reflection as read

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Reflection marked as read"
}
```

---

#### GET /api/v1/ai/insights
Get pattern insights

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `view_pattern_insights`

**Query Parameters:**
```
?type=trigger&acknowledged=false&page=1&limit=10
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "insights": [
            {
                "id": 12,
                "insight_type": "coping_mechanism",
                "insight_title": "Walking as Medicine",
                "insight_description": "You've mentioned walking 8 times this month. It seems to help you feel grounded.",
                "supporting_data": {
                    "frequency": 8,
                    "mood_improvement": "65%",
                    "dates": ["2026-05-01", "2026-05-05"]
                },
                "confidence_score": 0.87,
                "is_acknowledged": false,
                "created_at": "2026-05-21T10:00:00Z"
            }
        ]
    }
}
```

---

#### POST /api/v1/ai/insights/:id/acknowledge
Acknowledge an insight

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Insight acknowledged"
}
```

---

#### POST /api/v1/ai/monthly-report
Generate monthly deep insights report

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `generate_monthly_report`

**Request Body:**
```json
{
    "month": "2026-05",
    "regenerate": false
}
```

**Response (202 Accepted):**
```json
{
    "success": true,
    "message": "Monthly report generation started",
    "data": {
        "job_id": "report_gen_789012",
        "estimated_time": 60
    }
}
```

---

### 7. Subscription Endpoints

#### GET /api/v1/subscriptions/me
Get current user's subscription details

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "subscription_tier": "free",
        "status": "active",
        "billing_cycle": null,
        "current_period_start": null,
        "current_period_end": null,
        "cancel_at_period_end": false,
        "features": {
            "max_history_days": 7,
            "weekly_stories": true,
            "ai_reflections": false,
            "pattern_insights": false,
            "monthly_reports": false,
            "export": false
        }
    }
}
```

---

#### POST /api/v1/subscriptions/checkout
Create checkout session for premium upgrade

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "tier": "premium",
    "billing_cycle": "annual"  // 'monthly' or 'annual'
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "checkout_url": "https://checkout.stripe.com/session_id",
        "session_id": "cs_test_123456"
    }
}
```

---

#### POST /api/v1/subscriptions/cancel
Cancel subscription (at period end)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Subscription will be cancelled at end of current period",
    "data": {
        "cancel_at_period_end": true,
        "current_period_end": "2026-06-21T00:00:00Z"
    }
}
```

---

### 8. Export Endpoints

#### POST /api/v1/export/entries
Export journal entries

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `export_data`

**Request Body:**
```json
{
    "format": "pdf",  // 'pdf', 'txt', 'json'
    "start_date": "2026-01-01",
    "end_date": "2026-05-21",
    "include_stories": true,
    "include_insights": false
}
```

**Response (202 Accepted):**
```json
{
    "success": true,
    "message": "Export job started",
    "data": {
        "job_id": "export_456789",
        "estimated_time": 45
    }
}
```

**Once complete, webhook or polling:**
```json
{
    "success": true,
    "data": {
        "download_url": "https://s3.amazonaws.com/exports/user_123_export.pdf",
        "expires_at": "2026-05-22T10:00:00Z"
    }
}
```

---

### 9. Admin/Master Endpoints (Master User Only)

#### GET /api/v1/admin/users
Get all users (admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `admin_access`

**Query Parameters:**
```
?page=1&limit=50&role=user&subscription=premium&search=john
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "users": [
            {
                "id": 1,
                "email": "user@example.com",
                "name": "John Doe",
                "role": "user",
                "subscription_tier": "premium",
                "is_active": true,
                "created_at": "2026-01-15T10:00:00Z",
                "last_login": "2026-05-21T08:30:00Z",
                "total_entries": 95
            }
        ],
        "pagination": {
            "current_page": 1,
            "total_pages": 10,
            "total_users": 487
        }
    }
}
```

---

#### PUT /api/v1/admin/users/:id/subscription
Update user subscription (admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `admin_access`

**Request Body:**
```json
{
    "subscription_tier": "premium",
    "status": "active"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "User subscription updated successfully"
}
```

---

#### GET /api/v1/admin/stats
Get system-wide statistics (admin only)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Permission:** `admin_access`

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "total_users": 1247,
        "active_users_30d": 892,
        "free_users": 1100,
        "premium_users": 147,
        "total_entries": 45678,
        "entries_this_week": 3421,
        "total_stories_generated": 5234,
        "avg_entries_per_user": 36.6,
        "ai_api_usage": {
            "tokens_used_this_month": 1234567,
            "cost_this_month": 234.56
        }
    }
}
```

---

## Middleware Architecture

### 1. Authentication Middleware (authMiddleware.js)
```javascript
const jwt = require('jsonwebtoken');
const db = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        // 1. Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        const token = authHeader.substring(7);
        
        // 2. Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Get user from database
        const user = await db.User.findByPk(decoded.userId, {
            include: [{
                model: db.Role,
                include: [db.Permission]
            }]
        });
        
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }
        
        // 4. Attach user to request
        req.user = user;
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

module.exports = authMiddleware;
```

---

### 2. Authorization Middleware (authorize.js)
```javascript
const authorize = (...requiredPermissions) => {
    return async (req, res, next) => {
        try {
            // User must be authenticated first (via authMiddleware)
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            
            // Get user's permissions
            const userPermissions = req.user.Role.Permissions.map(p => p.name);
            
            // Master users have all permissions
            if (req.user.subscription_tier === 'master') {
                return next();
            }
            
            // Check if user has all required permissions
            const hasPermission = requiredPermissions.every(
                permission => userPermissions.includes(permission)
            );
            
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions',
                    required_permissions: requiredPermissions,
                    user_permissions: userPermissions
                });
            }
            
            next();
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Authorization check failed'
            });
        }
    };
};

module.exports = authorize;
```

---

### 3. Rate Limiting Middleware (rateLimiter.js)
```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../config/redis');

// Login rate limiter: 5 requests per 15 minutes per IP
const loginLimiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: 'rl:login:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        message: 'Too many login attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// API rate limiter: 100 requests per 15 minutes per user
const apiLimiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: 'rl:api:'
    }),
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Rate limit exceeded, please slow down'
    },
    keyGenerator: (req) => {
        return req.user ? req.user.id.toString() : req.ip;
    }
});

module.exports = { loginLimiter, apiLimiter };
```

---

### 4. Error Handler Middleware (errorHandler.js)
```javascript
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }
    
    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            success: false,
            message: 'Resource already exists',
            field: err.errors[0].path
        });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    
    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
```

---

## Background Jobs & Async Processing

### Job Queue Architecture

**Technology:** Bull (Redis-based job queue)

**Job Types:**
1. Weekly Story Generation
2. AI Reflection Generation
3. Pattern Insight Analysis
4. Monthly Report Generation
5. Email Notifications
6. Export File Generation

### Example: Weekly Story Generation Job

```javascript
// jobs/weeklyStoryJob.js
const Queue = require('bull');
const Anthropic = require('@anthropic-ai/sdk');
const db = require('../models');

const weeklyStoryQueue = new Queue('weekly-story-generation', {
    redis: process.env.REDIS_URL
});

// Producer: Add job to queue
const queueStoryGeneration = async (userId, weekStartDate, narrativeStyle) => {
    const job = await weeklyStoryQueue.add({
        userId,
        weekStartDate,
        narrativeStyle
    }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        }
    });
    
    return job.id;
};

// Consumer: Process job
weeklyStoryQueue.process(async (job) => {
    const { userId, weekStartDate, narrativeStyle } = job.data;
    
    // 1. Fetch all entries for that week
    const entries = await db.JournalEntry.findAll({
        where: {
            user_id: userId,
            entry_date: {
                [db.Sequelize.Op.between]: [weekStartDate, getWeekEndDate(weekStartDate)]
            }
        },
        order: [['entry_date', 'ASC']]
    });
    
    if (entries.length < 2) {
        throw new Error('Not enough entries to generate story');
    }
    
    // 2. Prepare prompt for Claude
    const prompt = buildStoryPrompt(entries, narrativeStyle);
    
    // 3. Call Claude API
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
            role: 'user',
            content: prompt
        }]
    });
    
    const storyContent = message.content[0].text;
    
    // 4. Parse and extract structured data
    const parsedStory = parseStoryResponse(storyContent);
    
    // 5. Save to database
    const story = await db.WeeklyStory.create({
        user_id: userId,
        week_start_date: weekStartDate,
        week_end_date: getWeekEndDate(weekStartDate),
        story_title: `Your Week: ${formatDateRange(weekStartDate)}`,
        story_content: parsedStory.content,
        narrative_style: narrativeStyle,
        emotional_journey: parsedStory.emotionalJourney,
        key_themes: parsedStory.themes,
        highlighted_quotes: parsedStory.quotes,
        strength_recognition: parsedStory.strength,
        entry_count: entries.length,
        ai_processing_time: job.processedOn - job.timestamp
    });
    
    // 6. Trigger notification
    await notifyUserStoryReady(userId, story.id);
    
    return { storyId: story.id };
});

module.exports = { queueStoryGeneration };
```

---

## Security Implementation

### 1. Password Security
```javascript
// utils/password.js
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!hasUpperCase) {
        return { valid: false, message: 'Password must contain uppercase letter' };
    }
    if (!hasLowerCase) {
        return { valid: false, message: 'Password must contain lowercase letter' };
    }
    if (!hasNumbers) {
        return { valid: false, message: 'Password must contain number' };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: 'Password must contain special character' };
    }
    
    return { valid: true };
};

module.exports = { hashPassword, comparePassword, validatePasswordStrength };
```

---

### 2. JWT Token Management
```javascript
// utils/jwt.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString('hex');
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken
};
```

---

### 3. Input Validation
```javascript
// validators/authValidator.js
const { body, validationResult } = require('express-validator');

const registerValidator = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email address'),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must meet requirements'),
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be 2-100 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = { registerValidator };
```

---

## Environment Variables

### .env.example
```bash
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mindweave_dev
DB_USER=postgres
DB_PASSWORD=your_password
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Redis (for rate limiting & job queue)
REDIS_URL=redis://localhost:6379

# Email (SendGrid or similar)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@mindweave.com

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_MONTHLY=price_xxxxx
STRIPE_PRICE_ANNUAL=price_xxxxx

# AWS S3 (for exports)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=mindweave-exports
AWS_REGION=us-east-1

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Development Workflow

### 1. Initial Setup Tasks

**Task 1: Project Initialization**
```bash
# Backend
mkdir mindweave-backend
cd mindweave-backend
npm init -y
npm install express sequelize pg pg-hstore bcryptjs jsonwebtoken dotenv cors helmet express-rate-limit express-validator winston @anthropic-ai/sdk bull redis
npm install --save-dev nodemon sequelize-cli

# Frontend
npx create-react-app mindweave-frontend
cd mindweave-frontend
npm install axios react-router-dom @mui/material @emotion/react @emotion/styled react-hook-form zod recharts date-fns
```

---

**Task 2: Database Setup**
```bash
# Create PostgreSQL database
createdb mindweave_dev

# Initialize Sequelize
npx sequelize-cli init

# Create models
npx sequelize-cli model:generate --name User --attributes email:string,password_hash:string,name:string
npx sequelize-cli model:generate --name Role --attributes name:string,description:text
# ... (create all models)

# Run migrations
npx sequelize-cli db:migrate

# Create seed files
npx sequelize-cli seed:generate --name demo-roles
npx sequelize-cli seed:generate --name demo-permissions
npx sequelize-cli seed:generate --name master-user

# Run seeds
npx sequelize-cli db:seed:all
```

---

**Task 3: Project Structure**
```
mindweave-backend/
├── config/
│   ├── database.js          # Sequelize config
│   ├── redis.js             # Redis connection
│   └── anthropic.js         # Claude API config
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── entryController.js
│   ├── storyController.js
│   ├── aiController.js
│   └── subscriptionController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── authorize.js
│   ├── rateLimiter.js
│   ├── errorHandler.js
│   └── validate.js
├── models/
│   ├── index.js
│   ├── User.js
│   ├── Role.js
│   ├── Permission.js
│   ├── JournalEntry.js
│   ├── WeeklyStory.js
│   └── ... (all models)
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── entryRoutes.js
│   ├── storyRoutes.js
│   ├── aiRoutes.js
│   └── subscriptionRoutes.js
├── services/
│   ├── authService.js
│   ├── aiService.js         # Claude API integration
│   ├── emailService.js
│   └── exportService.js
├── jobs/
│   ├── weeklyStoryJob.js
│   ├── aiReflectionJob.js
│   └── patternInsightJob.js
├── utils/
│   ├── jwt.js
│   ├── password.js
│   └── helpers.js
├── validators/
│   ├── authValidator.js
│   ├── entryValidator.js
│   └── ... (all validators)
├── migrations/
├── seeders/
├── tests/
├── .env.example
├── .env
├── .gitignore
├── package.json
└── server.js                 # Entry point
```

---

### 2. Master User Creation

**Seed File: seeders/YYYYMMDDHHMMSS-master-user.js**
```javascript
'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Get master role ID
        const [roles] = await queryInterface.sequelize.query(
            `SELECT id FROM roles WHERE name = 'master';`
        );
        const masterRoleId = roles[0].id;
        
        // Hash password
        const passwordHash = await bcrypt.hash('Master@123!Change', 12);
        
        // Insert master user
        await queryInterface.bulkInsert('users', [{
            email: 'master@mindweave.com',
            password_hash: passwordHash,
            name: 'Master Admin',
            role_id: masterRoleId,
            subscription_tier: 'master',
            is_active: true,
            is_verified: true,
            created_at: new Date(),
            updated_at: new Date()
        }]);
        
        console.log('Master user created:');
        console.log('Email: master@mindweave.com');
        console.log('Password: Master@123!Change');
        console.log('⚠️  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!');
    },
    
    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('users', {
            email: 'master@mindweave.com'
        });
    }
};
```

**Run seed:**
```bash
npx sequelize-cli db:seed --seed YYYYMMDDHHMMSS-master-user.js
```

**Master User Credentials (Development Only):**
```
Email: master@mindweave.com
Password: Master@123!Change
Permissions: ALL (admin_access + all features)
```

---

### 3. API Testing with Postman/Insomnia

**Collection Structure:**
```
MindWeave API
├── Auth
│   ├── Register
│   ├── Login
│   ├── Refresh Token
│   ├── Logout
│   ├── Forgot Password
│   └── Reset Password
├── Users
│   ├── Get Profile
│   ├── Update Profile
│   ├── Change Password
│   └── Get Permissions
├── Entries
│   ├── Create Entry
│   ├── Get All Entries
│   ├── Get Single Entry
│   ├── Update Entry
│   ├── Delete Entry
│   └── Get Stats
├── Stories
│   ├── Generate Story
│   ├── Get All Stories
│   ├── Get Single Story
│   └── Toggle Favorite
├── AI Features
│   ├── Get Reflections
│   ├── Get Insights
│   └── Generate Monthly Report
├── Subscriptions
│   ├── Get Subscription
│   ├── Create Checkout
│   └── Cancel Subscription
└── Admin (Master Only)
    ├── Get All Users
    ├── Update User Subscription
    └── Get System Stats
```

**Environment Variables in Postman:**
```
base_url: http://localhost:5000/api/v1
access_token: (set after login)
refresh_token: (set after login)
```

---

## Testing Strategy

### 1. Unit Tests (Jest)
```javascript
// tests/unit/services/authService.test.js
const authService = require('../../services/authService');
const db = require('../../models');

describe('AuthService', () => {
    describe('register', () => {
        it('should create a new user with hashed password', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'Test@123!',
                name: 'Test User'
            };
            
            const user = await authService.register(userData);
            
            expect(user.email).toBe(userData.email);
            expect(user.password_hash).not.toBe(userData.password);
            expect(user.role_id).toBe(1); // Default user role
        });
        
        it('should throw error if email already exists', async () => {
            const userData = {
                email: 'existing@example.com',
                password: 'Test@123!',
                name: 'Test User'
            };
            
            await authService.register(userData);
            
            await expect(authService.register(userData))
                .rejects
                .toThrow('Email already registered');
        });
    });
});
```

---

### 2. Integration Tests
```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../server');
const db = require('../../models');

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        await db.sequelize.sync({ force: true });
    });
    
    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'newuser@example.com',
                    password: 'NewUser@123!',
                    name: 'New User'
                });
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.access_token).toBeDefined();
            expect(response.body.data.user.email).toBe('newuser@example.com');
        });
        
        it('should return 400 for weak password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'newuser@example.com',
                    password: 'weak',
                    name: 'New User'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});
```

---

## Deployment Strategy

### 1. Development Environment
```bash
# Backend
npm run dev  # Uses nodemon for hot reload

# Frontend
npm start    # React development server
```

---

### 2. Production Deployment (Docker)

**Dockerfile (Backend)**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mindweave_prod
      POSTGRES_USER: mindweave
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
  
  backend:
    build: ./mindweave-backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./mindweave-backend:/app
      - /app/node_modules
  
  frontend:
    build: ./mindweave-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

---

## Performance Optimization

### 1. Database Indexing
- Index on `users.email` (frequent lookups)
- Index on `journal_entries.user_id, entry_date` (journal queries)
- Index on `weekly_stories.user_id, week_start_date` (story retrieval)
- Index on `refresh_tokens.token` (token validation)

### 2. Caching Strategy
```javascript
// Cache user permissions in Redis (5 min TTL)
const getUserPermissions = async (userId) => {
    const cacheKey = `permissions:${userId}`;
    
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }
    
    // Query database
    const permissions = await db.User.findByPk(userId, {
        include: [{
            model: db.Role,
            include: [db.Permission]
        }]
    });
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(permissions));
    
    return permissions;
};
```

### 3. Query Optimization
- Use `attributes` to select only needed fields
- Use `raw: true` for read-only queries
- Paginate all list endpoints
- Use connection pooling (min: 2, max: 10)

---

## Monitoring & Logging

### 1. Logging (Winston)
```javascript
// config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger;
```

### 2. Health Check Endpoint
```javascript
// GET /api/v1/health
router.get('/health', async (req, res) => {
    const health = {
        uptime: process.uptime(),
        timestamp: Date.now(),
        database: 'unknown',
        redis: 'unknown'
    };
    
    try {
        await db.sequelize.authenticate();
        health.database = 'connected';
    } catch (error) {
        health.database = 'disconnected';
    }
    
    try {
        await redis.ping();
        health.redis = 'connected';
    } catch (error) {
        health.redis = 'disconnected';
    }
    
    const status = health.database === 'connected' && health.redis === 'connected' 
        ? 200 
        : 503;
    
    res.status(status).json(health);
});
```

---

## Agent Task Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Initialize backend project with Node.js + Express
- [ ] Set up PostgreSQL database connection
- [ ] Create all database models with Sequelize
- [ ] Create and run migrations
- [ ] Create seed files for roles, permissions, and master user
- [ ] Implement JWT authentication (access + refresh tokens)
- [ ] Implement authorization middleware with RBAC
- [ ] Set up error handling middleware
- [ ] Configure environment variables
- [ ] Write unit tests for auth service

### Phase 2: Core Features (Week 3-4)
- [ ] Implement user registration and login endpoints
- [ ] Implement user profile endpoints
- [ ] Implement journal entry CRUD endpoints
- [ ] Add input validation for all endpoints
- [ ] Implement rate limiting
- [ ] Set up Redis for caching and job queues
- [ ] Create weekly story generation job with Bull
- [ ] Integrate Anthropic Claude API for story generation
- [ ] Implement AI reflection generation (async)
- [ ] Write integration tests for entry endpoints

### Phase 3: AI Features (Week 5)
- [ ] Implement pattern insight analysis job
- [ ] Create endpoints for AI reflections
- [ ] Create endpoints for pattern insights
- [ ] Implement monthly report generation
- [ ] Test AI feature rate limits and costs
- [ ] Add AI response caching

### Phase 4: Premium Features (Week 6)
- [ ] Implement subscription management endpoints
- [ ] Integrate Stripe for payments
- [ ] Create webhook handler for Stripe events
- [ ] Implement export functionality (PDF, TXT, JSON)
- [ ] Add cloud backup to AWS S3
- [ ] Test free vs premium tier permissions

### Phase 5: Admin & Polish (Week 7)
- [ ] Implement admin endpoints (user management, stats)
- [ ] Create audit logging system
- [ ] Add email verification flow
- [ ] Add password reset flow
- [ ] Implement notification system
- [ ] Set up automated database backups
- [ ] Write API documentation with Swagger

### Phase 6: Frontend Integration (Week 8-10)
- [ ] Set up React project structure
- [ ] Implement authentication context and protected routes
- [ ] Create login/register pages
- [ ] Build journal entry interface
- [ ] Build weekly story viewer
- [ ] Build insights dashboard
- [ ] Build settings page
- [ ] Implement offline support (PWA)
- [ ] Add loading states and error handling
- [ ] Test end-to-end user flows

### Phase 7: Testing & Deployment (Week 11-12)
- [ ] Perform load testing
- [ ] Security audit (OWASP Top 10)
- [ ] Optimize database queries
- [ ] Set up Docker containers
- [ ] Configure CI/CD pipeline
- [ ] Deploy to staging environment
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Monitor performance and errors
- [ ] Create user documentation

---

## Critical Security Checklist

- [ ] All passwords hashed with bcrypt (cost factor 12)
- [ ] JWT secrets are strong and environment-specific
- [ ] Rate limiting on all auth endpoints
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (via Sequelize parameterized queries)
- [ ] XSS protection (helmet middleware)
- [ ] CORS configured for frontend domain only
- [ ] HTTPS enforced in production
- [ ] Sensitive data never logged
- [ ] Regular security updates for dependencies
- [ ] Database backups automated and tested
- [ ] Audit logging for critical actions
- [ ] Master user password changed from default

---

## Success Criteria

### Technical Requirements Met:
✅ User authentication with JWT (access + refresh tokens)  
✅ Role-based access control (Free, Premium, Master)  
✅ PostgreSQL database with proper indexing  
✅ RESTful API with comprehensive endpoints  
✅ AI integration for story generation and insights  
✅ Background job processing for async tasks  
✅ Rate limiting and security best practices  
✅ Master user with all features unlocked  
✅ Subscription management with payment integration  
✅ Export functionality for user data  

### Performance Targets:
- API response time < 200ms (excluding AI calls)
- AI story generation < 30 seconds
- Database queries optimized with indexes
- 99.9% uptime in production
- Handle 1000+ concurrent users

### Code Quality:
- 80%+ test coverage
- ESLint/Prettier configured
- Code reviewed and documented
- Error handling comprehensive
- Logging configured for debugging

---

**Document Version:** 1.0  
**Last Updated:** May 21, 2026  
**Development Lead:** Backend Team  
**Status:** Ready for Implementation
