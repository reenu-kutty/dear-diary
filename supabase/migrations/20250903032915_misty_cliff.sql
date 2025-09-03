/*
  # Add prompt support to journal entries

  1. Schema Changes
    - Add `prompt` column to `journal_entries` table to store the writing prompt used
    - Add `prompt_response` column to distinguish between the prompt and user's response

  2. Security
    - No changes to existing RLS policies needed
    - New columns inherit existing security model
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_entries' AND column_name = 'prompt'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN prompt text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_entries' AND column_name = 'prompt_response'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN prompt_response text DEFAULT '';
  END IF;
END $$;