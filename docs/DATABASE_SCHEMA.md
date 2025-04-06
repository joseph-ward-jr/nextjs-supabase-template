# Blogster Database Schema Design

This document outlines the database schema for the Blogster application, including tables, relationships, Row Level Security (RLS) policies, triggers, functions, and Edge Functions.

## Database Views

### Core Views

1. **dashboard_stats**
   - Provides aggregated statistics for the dashboard
   - Requires authenticated user session for proper data access via RLS
   - Fields:
     - total_blogs (bigint) - Count of blogs owned by the authenticated user
     - published_blogs (bigint) - Count of published blogs owned by the authenticated user
     - new_blogs_30d (bigint) - Count of blogs created in the last 30 days
     - new_blogs_prev_30d (bigint) - Count of blogs created in the 30 days before that
     - total_views (bigint) - Total view count across all blogs
     - views_30d (bigint) - View count in the last 30 days
     - views_prev_30d (bigint) - View count in the 30 days before that
     - avg_bounce_rate (double precision) - Average bounce rate across all blogs
     - total_shares (bigint) - Total share count across all blogs
   - Note: All metrics are filtered by auth.uid() to ensure users only see their own data
   - Frontend Mapping: The API layer maps these fields to the frontend expected format, calculating derived metrics like engagement_rate and trending_score

## Database Tables

### Core Tables

1. **profiles**
   - Extends auth.users with profile information
   - Fields: id (PK), username, full_name, avatar_url, website, company, bio, created_at, updated_at
   - Created automatically when a user signs up via trigger function

2. **blogs**
   - Stores all blog content created by users
   - Fields: id (PK), title, slug, content (jsonb), status, meta_description, meta_keywords, featured_image, author_id (FK to profiles), persona_id (FK to personas), template_id (FK to blog_templates), ai_generated (boolean), word_count, reading_time, created_at, updated_at, published_at
   - Word count and reading time are calculated automatically via triggers

3. **personas**
   - Defines target audiences for content creation
   - Fields: id (PK), name, description, age_range, gender, interests (array), pain_points (array), goals (array), education_level, income_level, occupation, location, template (boolean), owner_id (FK to profiles), avatar_url (text, nullable), created_at, updated_at
   - System templates are marked with template=true

4. **blog_templates**
   - Defines structure for different blog layouts
   - Fields: id (PK), name, description, structure (jsonb), image_count, is_system (boolean), created_at, updated_at
   - Contains JSONB structure with section types and placeholders

### Supporting Tables

5. **blog_analytics**
   - Tracks performance metrics for published blogs
   - Fields: id (PK), blog_id (FK to blogs), views, unique_visitors, avg_time_on_page, bounce_rate, referrers, date, created_at, updated_at
   - Access limited to blog owners via RLS

6. **user_subscriptions**
   - Manages subscription plans and credits
   - Fields: id (PK), user_id (FK to auth.users), subscription_tier, start_date, end_date, is_active, credits_remaining, credits_used, stripe_customer_id, stripe_subscription_id, stripe_price_id, created_at, updated_at
   - Created with initial free credits when user signs up

7. **subdomain_settings**
   - Manages user's publishing domain
   - Fields: id (PK), user_id (FK to auth.users), subdomain, theme, custom_domain, is_custom_domain_verified, site_title, site_description, created_at, updated_at
   - Created automatically with default settings when user signs up

8. **blog_tags** and **blogs_to_tags**
   - blog_tags fields: id (PK), name, created_at
   - blogs_to_tags fields: blog_id (FK to blogs, PK), tag_id (FK to blog_tags, PK)
   - Implements a many-to-many relationship for blog categorization

9. **blog_revisions**
   - Automatically tracks version history of blog content
   - Fields: id (PK), blog_id (FK to blogs), content (jsonb), revision_number, created_by (FK to auth.users), created_at
   - Created via trigger when content is updated

10. **ai_generation_logs**
    - Records all AI generation activity
    - Fields: id (PK), user_id (FK to auth.users), tokens_used, prompt, completion, model, success (boolean), blog_id (FK to blogs), persona_id (FK to personas), template_id (FK to blog_templates), created_at
    - Successful generations trigger credit deduction

11. **image_assets**
    - Manages blog images (both uploaded and AI-generated)
    - Fields: id (PK), url, path, size, file_type, blog_id (FK to blogs), ai_generated (boolean), ai_prompt, created_by (FK to auth.users), created_at

12. **activities**
   - Records user and system activities
   - Fields:
     - id (PK, uuid, default: uuid_generate_v4())
     - type (text, not null)
     - title (text, not null)
     - description (text, not null)
     - blog_id (FK to blogs, nullable)
     - metadata (jsonb, default: '{}')
     - created_at (timestamptz, default: now())
     - updated_at (timestamptz, default: now())
   - Foreign Keys:
     - blog_id references blogs(id)
   - Indexes:
     - Primary key on id
     - Index on type
     - Index on blog_id

### System Management Tables

13. **maintenance_schedules**
   - Manages system maintenance windows and notifications
   - Fields:
     - id (PK)
     - title (text, not null)
     - description (text)
     - start_time (timestamptz, not null)
     - end_time (timestamptz, not null)
     - status (enum: 'scheduled', 'in_progress', 'completed', 'cancelled')
     - severity (enum: 'low', 'medium', 'high', 'critical')
     - affected_services (text[])
     - notification_sent (boolean, default false)
     - created_by (FK to auth.users)
     - created_at (timestamptz)
     - updated_at (timestamptz)

14. **user_notification_preferences**
   - Controls user notification settings
   - Fields:
     - id (PK)
     - user_id (FK to auth.users, unique)
     - maintenance_notifications (boolean, default true)
     - blog_interaction_notifications (boolean, default true)
     - marketing_notifications (boolean, default true)
     - security_notifications (boolean, default true)
     - email_notifications (boolean, default true)
     - in_app_notifications (boolean, default true)
     - quiet_hours_start (time)
     - quiet_hours_end (time)
     - timezone (text, default 'UTC')
     - created_at (timestamptz)
     - updated_at (timestamptz)

15. **user_notifications**
   - Stores actual notifications
   - Fields:
     - id (PK)
     - user_id (FK to auth.users)
     - type (enum: 'maintenance', 'blog_interaction', 'security', 'marketing')
     - title (text, not null)
     - content (text)
     - link (text)
     - read (boolean, default false)
     - read_at (timestamptz)
     - expires_at (timestamptz)
     - priority (enum: 'low', 'medium', 'high', 'critical')
     - delivery_status (enum: 'pending', 'sent', 'failed')
     - created_at (timestamptz)
     - updated_at (timestamptz)

### Documentation System

16. **documentation_categories**
   - Organizes documentation hierarchy
   - Fields:
     - id (PK)
     - name (text, not null)
     - slug (text, unique, not null)
     - description (text)
     - parent_id (FK to documentation_categories, nullable)
     - order_position (integer)
     - is_visible (boolean, default true)
     - created_at (timestamptz)
     - updated_at (timestamptz)

17. **documentation_pages**
   - Stores documentation content
   - Fields:
     - id (PK)
     - category_id (FK to documentation_categories)
     - title (text, not null)
     - slug (text, unique, not null)
     - content (jsonb)
     - excerpt (text)
     - metadata (jsonb)
     - tags (text[])
     - search_vector (tsvector)
     - version (text)
     - status (enum: 'draft', 'published', 'archived')
     - last_reviewed_at (timestamptz)
     - last_reviewed_by (FK to auth.users)
     - created_by (FK to auth.users)
     - updated_by (FK to auth.users)
     - created_at (timestamptz)
     - updated_at (timestamptz)

18. **documentation_revisions**
   - Tracks documentation version history
   - Fields:
     - id (PK)
     - page_id (FK to documentation_pages)
     - content (jsonb)
     - metadata (jsonb)
     - version (text)
     - created_by (FK to auth.users)
     - created_at (timestamptz)

### Feature Management

19. **feature_flags**
   - Controls feature rollout
   - Fields:
     - id (PK)
     - name (text, unique, not null)
     - description (text)
     - enabled (boolean, default false)
     - rollout_percentage (integer, default 0)
     - conditions (jsonb)
     - strategy (enum: 'all', 'percentage', 'user_ids', 'subscription_tier')
     - created_by (FK to auth.users)
     - created_at (timestamptz)
     - updated_at (timestamptz)

20. **feature_flag_logs**
   - Audit trail for feature flag changes
   - Fields:
     - id (PK)
     - flag_id (FK to feature_flags)
     - action (enum: 'created', 'updated', 'deleted')
     - previous_state (jsonb)
     - new_state (jsonb)
     - changed_by (FK to auth.users)
     - created_at (timestamptz)

### Chatbot System

21. **chatbot_intents**
   - Defines conversation purposes
   - Fields:
     - id (PK)
     - name (text, unique, not null)
     - description (text)
     - training_phrases (text[])
     - parameters (jsonb)
     - responses (jsonb[])
     - follow_up_intents (text[])
     - category (enum: 'support', 'sales', 'onboarding', 'technical')
     - created_at (timestamptz)
     - updated_at (timestamptz)

22. **chatbot_conversations**
   - Tracks chat sessions
   - Fields:
     - id (PK)
     - session_id (uuid, unique)
     - user_id (FK to auth.users, nullable)
     - initial_intent (FK to chatbot_intents)
     - context (jsonb)
     - metadata (jsonb)
     - status (enum: 'active', 'completed', 'abandoned')
     - satisfaction_score (integer)
     - feedback (text)
     - started_at (timestamptz)
     - ended_at (timestamptz)
     - created_at (timestamptz)
     - updated_at (timestamptz)

23. **chatbot_messages**
   - Individual chat messages
   - Fields:
     - id (PK)
     - conversation_id (FK to chatbot_conversations)
     - role (enum: 'user', 'assistant', 'system')
     - content (text)
     - intent_detected (FK to chatbot_intents)
     - confidence_score (float)
     - tokens_used (integer)
     - metadata (jsonb)
     - created_at (timestamptz)

24. **chatbot_analytics**
   - Aggregated chatbot metrics
   - Fields:
     - id (PK)
     - date (date)
     - total_conversations (integer)
     - avg_conversation_length (interval)
     - avg_response_time (interval)
     - top_intents (jsonb)
     - satisfaction_metrics (jsonb)
     - conversion_metrics (jsonb)
     - error_rates (jsonb)
     - created_at (timestamptz)

### Extended Feature Tables

#### Content Creation & Enhancement

25. **blog_ideas**
   - Stores AI-generated blog topic ideas
   - Fields:
     - id (PK)
     - user_id (FK to auth.users)
     - title (text, not null)
     - description (text)
     - keywords (text[])
     - industry_category (text)
     - trending_score (float)
     - engagement_potential (float)
     - difficulty_level (enum: 'beginner', 'intermediate', 'advanced')
     - estimated_word_count (integer)
     - status (enum: 'new', 'saved', 'in_progress', 'completed', 'discarded')
     - blog_id (FK to blogs, nullable)
     - created_at (timestamptz)
     - updated_at (timestamptz)

26. **writers_block_sessions**
   - Tracks writing assistance sessions
   - Fields:
     - id (PK)
     - user_id (FK to auth.users)
     - blog_id (FK to blogs)
     - initial_content (text)
     - content_fragment (text)
     - suggestions (jsonb)
     - selected_suggestion_id (text, nullable)
     - tokens_used (integer)
     - created_at (timestamptz)

27. **voice_recordings**
   - Manages audio recordings for transcription
   - Fields:
     - id (PK)
     - user_id (FK to auth.users)
     - file_url (text)
     - file_path (text)
     - duration_seconds (integer)
     - file_size_bytes (integer)
     - transcription_status (enum: 'pending', 'processing', 'completed', 'failed')
     - transcription_text (text)
     - blog_id (FK to blogs, nullable)
     - created_at (timestamptz)
     - updated_at (timestamptz)

28. **research_sources**
   - Stores reference materials for blog content
   - Fields:
     - id (PK)
     - user_id (FK to auth.users)
     - blog_id (FK to blogs, nullable)
     - title (text)
     - url (text)
     - author (text)
     - publication_date (date, nullable)
     - content_excerpt (text)
     - source_type (enum: 'article', 'study', 'book', 'statistics', 'video', 'podcast', 'other')
     - relevance_score (float)
     - validity_score (float)
     - citation_format (jsonb)
     - created_at (timestamptz)

#### Publishing & Distribution

29. **social_media_profiles**
   - Manages connected social accounts
   - Fields:
     - id (PK)
     - user_id (FK to auth.users)
     - platform (enum: 'twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'pinterest', 'youtube')
     - profile_id (text)
     - profile_name (text)
     - access_token (text)
     - access_token_expires_at (timestamptz)
     - refresh_token (text)
     - is_connected (boolean)
     - created_at (timestamptz)
     - updated_at (timestamptz)

30. **social_media_posts**
   - Stores platform-specific content versions
   - Fields:
     - id (PK)
     - blog_id (FK to blogs)
     - social_profile_id (FK to social_media_profiles)
     - content (text)
     - image_urls (text[])
     - hashtags (text[])
     - scheduled_time (timestamptz, nullable)
     - post_status (enum: 'draft', 'scheduled', 'published', 'failed')
     - platform_post_id (text, nullable)
     - engagement_metrics (jsonb)
     - created_at (timestamptz)
     - updated_at (timestamptz)

31. **email_newsletters**
   - Manages email content distribution
   - Fields:
     - id (PK)
     - user_id (FK to auth.users)
     - title (text)
     - subject_line (text)
     - content (jsonb)
     - blog_ids (uuid[])
     - template_id (text)
     - scheduled_time (timestamptz, nullable)
     - status (enum: 'draft', 'scheduled', 'sent', 'failed')
     - recipient_count (integer)
     - open_rate (float)
     - click_rate (float)
     - created_at (timestamptz)
     - updated_at (timestamptz)

32. **platform_republishing**
   - Tracks cross-platform publishing
   - Fields:
     - id (PK)
     - blog_id (FK to blogs)
     - platform (enum: 'medium', 'linkedin', 'dev_to', 'hashnode', 'wordpress')
     - platform_post_id (text)
     - platform_url (text)
     - canonical_url (text)
     - publication_status (enum: 'draft', 'published', 'failed')
     - view_count (integer)
     - engagement_metrics (jsonb)
     - created_at (timestamptz)
     - updated_at (timestamptz)

#### SEO & Analytics

33. **keyword_research**
   - Stores SEO keyword data
   - Fields:
     - id (PK)
     - user_id (FK to auth.users)
     - keyword (text, not null)
     - search_volume (integer)
     - keyword_difficulty (float)
     - cpc (float)
     - competition (float)
     - related_keywords (text[])
     - serp_features (text[])
     - intent (enum: 'informational', 'navigational', 'commercial', 'transactional')
     - blog_id (FK to blogs, nullable)
     - created_at (timestamptz)
     - updated_at (timestamptz)

34. **content_freshness**
   - Tracks content age and update requirements
   - Fields:
     - id (PK)
     - blog_id (FK to blogs)
     - last_updated (timestamptz)
     - freshness_score (float)
     - update_priority (enum: 'low', 'medium', 'high', 'critical')
     - recommended_updates (jsonb)
     - traffic_trend (float)
     - competitive_gap_score (float)
     - outdated_information (jsonb)
     - checked_at (timestamptz)
     - created_at (timestamptz)
     - updated_at (timestamptz)

35. **serp_positions**
   - Tracks search engine rankings
   - Fields:
     - id (PK)
     - blog_id (FK to blogs)
     - keyword_id (FK to keyword_research)
     - rank_position (integer)
     - previous_position (integer)
     - change (integer)
     - url (text)
     - search_engine (enum: 'google', 'bing', 'duckduckgo')
     - search_locale (text)
     - device_type (enum: 'desktop', 'mobile')
     - featured_snippet (boolean)
     - check_date (date)
     - created_at (timestamptz)

36. **competitor_content**
   - Monitors competitor performance
   - Fields:
     - id (PK)
     - user_id (FK to auth.users)
     - competitor_domain (text)
     - content_url (text)
     - title (text)
     - publish_date (date, nullable)
     - word_count (integer)
     - keywords (text[])
     - rank_positions (jsonb)
     - estimated_traffic (integer)
     - topic_category (text)
     - content_quality_score (float)
     - relevance_to_user (float)
     - created_at (timestamptz)
     - updated_at (timestamptz)

#### Audience & Collaboration

37. **reader_profiles**
   - Analyzes audience segments
   - Fields:
     - id (PK)
     - user_id (FK to auth.users)
     - segment_name (text)
     - demographic_data (jsonb)
     - interests (text[])
     - behavior_patterns (jsonb)
     - engagement_metrics (jsonb)
     - content_preferences (jsonb)
     - segment_size (integer)
     - created_at (timestamptz)
     - updated_at (timestamptz)

38. **content_calendar**
   - Manages content scheduling
   - Fields:
     - id (PK)
     - user_id (FK to auth.users)
     - title (text)
     - description (text)
     - scheduled_date (date)
     - scheduled_time (time, nullable)
     - blog_id (FK to blogs, nullable)
     - content_type (enum: 'blog', 'newsletter', 'social')
     - status (enum: 'planned', 'in_progress', 'ready', 'published')
     - topic_category (text)
     - target_audience (text[])
     - optimal_time_score (float)
     - created_at (timestamptz)
     - updated_at (timestamptz)

39. **interactive_content**
   - Stores interactive elements
   - Fields:
     - id (PK)
     - user_id (FK to auth.users)
     - blog_id (FK to blogs, nullable)
     - content_type (enum: 'quiz', 'poll', 'survey', 'calculator')
     - title (text)
     - description (text)
     - structure (jsonb)
     - style_settings (jsonb)
     - tracking_id (text)
     - participation_count (integer)
     - completion_rate (float)
     - created_at (timestamptz)
     - updated_at (timestamptz)

40. **team_collaboration**
   - Manages multi-user workflows
   - Fields:
     - id (PK)
     - organization_id (text)
     - blog_id (FK to blogs)
     - assigned_to (FK to auth.users)
     - assigned_by (FK to auth.users)
     - role (enum: 'author', 'editor', 'reviewer', 'approver')
     - status (enum: 'assigned', 'in_progress', 'awaiting_review', 'reviewed', 'approved', 'rejected')
     - comments (jsonb)
     - due_date (timestamptz, nullable)
     - completed_at (timestamptz, nullable)
     - created_at (timestamptz)
     - updated_at (timestamptz)

41. **content_monetization**
   - Tracks revenue generation
   - Fields:
     - id (PK)
     - user_id (FK to auth.users)
     - blog_id (FK to blogs, nullable)
     - monetization_type (enum: 'affiliate', 'sponsored', 'paywall', 'advertisement')
     - provider (text)
     - reference_id (text)
     - placement_data (jsonb)
     - revenue (float)
     - impressions (integer)
     - clicks (integer)
     - conversion_count (integer)
     - conversion_rate (float)
     - created_at (timestamptz)
     - updated_at (timestamptz)

## Row Level Security (RLS) Policies

The database implements a comprehensive set of RLS policies to ensure data security:

### Blogs
- **Users can view published blogs**: (status = 'published' OR auth.uid() = author_id)
- **Users can create their own blogs**: auth.uid() = author_id
- **Users can update their own blogs**: auth.uid() = author_id
- **Users can delete their own blogs**: auth.uid() = author_id

### Personas
- **Users can view template personas or their own**: (template = true OR auth.uid() = owner_id)
- **Users can create their own personas**: auth.uid() = owner_id
- **Users can update their own personas**: (auth.uid() = owner_id AND template = false)
- **Users can delete their own personas**: (auth.uid() = owner_id AND template = false)
- **Users can copy template personas**: (template = true) - *Note: Copy logic handled in application/API layer, RLS ensures read access.*
- *Admin role may have permissions to create/update/delete template personas.*

### Blog Templates
- **Everyone can view system blog templates**: true (no filter)

### Profiles
- **Users can view their own profile**: auth.uid() = id
- **Users can update their own profile**: auth.uid() = id

### User Subscriptions
- **Users can view their own subscriptions**: auth.uid() = user_id

### Subdomain Settings
- **Users can view their own subdomain settings**: auth.uid() = user_id
- **Users can update their own subdomain settings**: auth.uid() = user_id

### Blog Tags
- **Everyone can view blog tags**: true (no filter)

### Blog Revisions
- **Users can view revisions for their own blogs**: EXISTS (SELECT 1 FROM blogs WHERE blogs.id = blog_revisions.blog_id AND blogs.author_id = auth.uid())

### AI Generation Logs
- **Users can view their own AI generation logs**: auth.uid() = user_id

### Blog Analytics
- **Users can view analytics for their own blogs**: EXISTS (SELECT 1 FROM blogs WHERE blogs.id = blog_analytics.blog_id AND blogs.author_id = auth.uid())

### Image Assets
- **Users can view images from published blogs or their own blogs**: (created_by = auth.uid() OR EXISTS (SELECT 1 FROM blogs WHERE blogs.id = image_assets.blog_id AND (blogs.status = 'published' OR blogs.author_id = auth.uid())))
- **Users can insert their own images**: created_by = auth.uid()
- **Users can update their own images**: created_by = auth.uid()
- **Users can delete their own images**: created_by = auth.uid()

### Blogs to Tags
- **Users can associate tags with their own blogs**: EXISTS (SELECT 1 FROM blogs WHERE blogs.id = blogs_to_tags.blog_id AND blogs.author_id = auth.uid())

### System Management Tables
- **maintenance_schedules**
  - View: authenticated users can view all maintenance schedules
  - Create/Update/Delete: only users with admin role
- **user_notification_preferences**
  - View/Update: Only the owner can view/update their preferences
- **user_notifications**
  - View/Update: Only the owner can view/update their notifications

### Documentation System
- **documentation_categories**
  - View: All authenticated users
  - Create/Update/Delete: Only admin users
- **documentation_pages**
  - View: All authenticated users can view published docs
  - Create/Update: Only admin users
- **documentation_revisions**
  - View: Admin users only
  - Create: Automatic via trigger

### Feature Management
- **feature_flags**
  - View: All authenticated users
  - Create/Update: Only admin users
- **feature_flag_logs**
  - View: Admin users only

### Chatbot System
- **chatbot_intents**
  - View: Service role only
  - Create/Update: Admin users only
- **chatbot_conversations**
  - View: Users can view their own conversations
  - Create: Any authenticated user
- **chatbot_messages**
  - View: Users can view messages from their conversations
  - Create: Any authenticated user for 'user' role
- **chatbot_analytics**
  - View: Admin users only

### Activities
- **Users can view activities related to their blogs**: EXISTS (SELECT 1 FROM blogs WHERE blogs.id = activities.blog_id AND blogs.author_id = auth.uid())
- **Users can create activities**: true
- **Users can update their own activities**: EXISTS (SELECT 1 FROM blogs WHERE blogs.id = activities.blog_id AND blogs.author_id = auth.uid())
- **Users can delete their own activities**: EXISTS (SELECT 1 FROM blogs WHERE blogs.id = activities.blog_id AND blogs.author_id = auth.uid())

## Triggers and Functions

### Trigger Functions

1. **handle_new_user**
   - Automatically creates profile, free subscription, and subdomain on signup
   - Assigns initial 3 free credits to new users
   - Triggered by: INSERT on auth.users

2. **update_blog_metrics**
   - Automatically calculates word count and reading time
   - Estimates reading time based on 200 words per minute
   - Triggered by: INSERT or UPDATE of content on blogs

3. **create_blog_revision**
   - Automatically creates revisions when blog content changes
   - Tracks revision number for sequential history
   - Only creates a revision if content has actually changed
   - Triggered by: UPDATE on blogs when content changes

4. **use_generation_credit**
   - Deducts credits when AI generation is successful
   - Updates credits_remaining and credits_used
   - Triggered by: INSERT on ai_generation_logs when success = true

5. **update_updated_at_column**
   - Generic function to update updated_at timestamp
   - Used by multiple tables to maintain last modified time
   - Triggered by: UPDATE on various tables

6. **handle_maintenance_notification**
   - Sends notifications when maintenance schedules are created/updated
   - Respects user notification preferences
   - Triggered by: INSERT or UPDATE on maintenance_schedules

7. **update_documentation_search_vector**
   - Updates search_vector when documentation content changes
   - Handles multiple languages and custom weights
   - Triggered by: INSERT or UPDATE on documentation_pages

8. **create_documentation_revision**
   - Creates new revision when documentation is updated
   - Similar to blog revision system
   - Triggered by: UPDATE on documentation_pages

9. **log_feature_flag_changes**
   - Records all changes to feature flags
   - Maintains audit trail
   - Triggered by: INSERT, UPDATE, or DELETE on feature_flags

10. **update_chatbot_analytics**
    - Aggregates conversation metrics
    - Updates analytics tables
    - Triggered by: INSERT on chatbot_messages

### Active Triggers

- **on_blog_content_update**: Calls create_blog_revision on blogs table
- **update_blog_metrics**: Calls update_blog_metrics on blogs table
- **update_*_updated_at**: Calls update_updated_at_column on multiple tables
- **on_ai_generation**: Calls use_generation_credit on ai_generation_logs table
- **on_maintenance_schedule_change**: Calls handle_maintenance_notification
- **on_documentation_update**: Calls update_documentation_search_vector and create_documentation_revision
- **on_feature_flag_change**: Calls log_feature_flag_changes
- **on_chatbot_message**: Calls update_chatbot_analytics

## Edge Functions

1. **handle_maintenance_notifications**
   - Sends notifications based on maintenance schedule
   - Respects user notification preferences
   - Handles different notification channels

2. **process_chatbot_message**
   - Processes incoming messages
   - Performs intent detection
   - Manages conversation context
   - Generates appropriate responses

3. **update_feature_flags**
   - Evaluates feature flag conditions
   - Updates user permissions
   - Logs flag state changes

4. **search_documentation**
   - Performs full-text search
   - Handles relevance ranking
   - Returns formatted results

## Database Migration History

The database has been set up through a series of migrations, including:

1. Initial table creation
2. Function and trigger creation
   - create_user_signup_handler
   - create_updated_at_triggers
   - create_blog_revision_handler
   - create_blog_metrics_handler
   - create_credit_usage_handler
3. Improvements to functions' search paths for security
   - fix_handle_new_user_search_path
   - fix_update_updated_at_column_search_path
   - fix_create_blog_revision_search_path
   - fix_update_blog_metrics_search_path
   - fix_use_generation_credit_search_path
4. System Management and Documentation
   - create_system_management_tables
   - create_documentation_system
   - create_feature_management
   - create_chatbot_system
   - create_notification_handlers
   - create_documentation_search
   - create_chatbot_analytics

## Security Considerations

The database is designed with security in mind:

1. **Row Level Security** protects data from unauthorized access
2. **Security Definer Functions** ensure operations run with necessary privileges
3. **Search Paths** are explicitly set to prevent search path attacks
4. **Feature Flag Security**
   - Strict access control for flag management
   - Audit logging for all changes
   - Secure evaluation of conditions
5. **Chatbot Security**
   - Message content sanitization
   - Rate limiting for message creation
   - Secure handling of user context

## Performance Considerations

1. **Indexing Strategy**
   - Primary keys on all tables
   - Foreign keys for relationship integrity
   - Additional indexes on frequently queried columns

2. **Efficient RLS policies**
   - Designed to leverage existing indexes
   - Use EXISTS subqueries for optimal performance

3. **JSONB for flexibility**
   - Blog content stored as JSONB for flexibility
   - Template structures stored as JSONB for customization

4. **Partitioning Strategy**
   - Partition chatbot_messages by month
   - Partition user_notifications by status and date

5. **Materialized Views**
   - Chatbot analytics summaries
   - Documentation search results
   - Feature flag evaluations

## Future Enhancements

Potential areas for future schema enhancements:

1. **Team collaboration**
   - Add role-based access control for teams
   - Enhance RLS policies to support team permissions

2. **Enhanced analytics**
   - Add more detailed metrics and dimensions
   - Create aggregation functions for trend analysis

3. **Multi-language support**
   - Extend content model to support translations
   - Add language preference to user profiles

4. **API rate limiting**
   - Track API usage per user
   - Implement tier-based rate limits 

5. **Enhanced Chatbot Features**
   - Integration with external NLP services
   - Advanced conversation flow management
   - Automated training data generation

6. **Documentation Improvements**
   - Version control integration
   - Automated link checking
   - Change notification system

## Testing Considerations

### Test Data Generation
- The schema supports factory-based test data generation through well-defined relationships
- Each table can be seeded independently or as part of related entity graphs
- The `template` flag in personas and `is_system` in blog_templates enable consistent baseline data

### Test Isolation
- RLS policies must be considered when testing in different contexts
- Transaction support enables isolated test runs without data persistence
- Triggers like `create_blog_revision` should be considered when testing content updates

### Performance Testing Points
- `blogs` table update operations trigger multiple actions (metrics calculation, revision creation)
- AI credit deduction provides measurable performance checkpoints
- Analytics tables offer natural points for load testing and performance monitoring

### Additional Test Points
- Chatbot conversation flow testing
- Feature flag condition evaluation
- Documentation search accuracy
- Notification delivery confirmation
- Maintenance schedule handling