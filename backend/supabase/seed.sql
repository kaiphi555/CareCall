-- ============================================================
-- CareCall Seed Data
-- Run AFTER schema.sql in the Supabase SQL Editor
-- NOTE: These use hardcoded UUIDs so the foreign keys line up.
-- ============================================================

-- Insert default wellness questions
insert into wellness_questions (id, question, options) values
  ('00000000-0000-0000-0000-000000000a01', 'How are you feeling today?', '["Great", "Good", "Okay", "Not well"]'),
  ('00000000-0000-0000-0000-000000000a02', 'Did you eat breakfast?', '["Yes", "No", "A little"]'),
  ('00000000-0000-0000-0000-000000000a03', 'Are you feeling dizzy or uncomfortable?', '["No", "A little dizzy", "Yes, uncomfortable"]'),
  ('00000000-0000-0000-0000-000000000a04', 'Did you sleep well last night?', '["Yes", "Somewhat", "No"]');
