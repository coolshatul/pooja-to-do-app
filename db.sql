-- Create the pooja_lists table
CREATE TABLE pooja_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE,
  share_code TEXT UNIQUE
);

-- Enable Row Level Security
ALTER TABLE pooja_lists ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own lists" ON pooja_lists
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can read public lists" ON pooja_lists
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own lists" ON pooja_lists
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own lists" ON pooja_lists
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own lists" ON pooja_lists
  FOR DELETE USING (auth.uid() = owner_id);


CREATE INDEX IF NOT EXISTS idx_pooja_lists_owner_id ON pooja_lists (owner_id);

CREATE INDEX IF NOT EXISTS idx_pooja_lists_share_code_public ON pooja_lists (share_code, is_public);