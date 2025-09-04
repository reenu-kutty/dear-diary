/*
  # Add emergency contact field to users

  1. New Tables
    - Add emergency_contact_email column to auth.users metadata
    
  2. Security
    - No RLS changes needed as this uses auth.users
    
  3. Changes
    - Add emergency_contact_email field for crisis notifications
*/

-- Add emergency contact email to user metadata
-- This will be stored in auth.users.raw_user_meta_data
-- No schema changes needed as Supabase auth handles metadata automatically