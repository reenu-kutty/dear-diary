/*
  # Add emotional analysis cache table

  1. New Tables
    - `emotional_analysis_cache`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `date` (date, the specific date being analyzed)
      - `emotional_score` (numeric, score from 1-10)
      - `dominant_emotions` (text array, list of emotions)
      - `summary` (text, AI-generated summary)
      - `entry_count` (integer, number of entries for this date)
      - `last_entry_at` (timestamp, when the last entry was created for this date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `emotional_analysis_cache` table
    - Add policies for authenticated users to manage their own analysis data

  3. Indexes
    - Add index on user_id and date for efficient lookups
*/

CREATE TABLE IF NOT EXISTS emotional_analysis_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  emotional_score numeric(3,1) NOT NULL CHECK (emotional_score >= 1 AND emotional_score <= 10),
  dominant_emotions text[] DEFAULT '{}',
  summary text DEFAULT '',
  entry_count integer DEFAULT 0,
  last_entry_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE emotional_analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own emotional analysis"
  ON emotional_analysis_cache
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emotional analysis"
  ON emotional_analysis_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emotional analysis"
  ON emotional_analysis_cache
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emotional analysis"
  ON emotional_analysis_cache
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS emotional_analysis_cache_user_date_idx 
  ON emotional_analysis_cache (user_id, date);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_emotional_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_emotional_analysis_cache_updated_at
  BEFORE UPDATE ON emotional_analysis_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_emotional_analysis_updated_at();