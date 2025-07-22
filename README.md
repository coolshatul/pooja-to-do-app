# Pooja Checklist App

A beautiful, spiritual-themed to-do list app for managing Hindu religious ritual items with Google authentication and list sharing capabilities.

## Features

### Core Features
- ✅ Add, edit, and delete pooja items
- ✅ Mark items as collected with smooth animations
- ✅ Local storage for offline use
- ✅ Mobile-responsive design
- ✅ Clear all functionality

### Authentication & Sharing
- 🔐 Google Sign-In integration
- 📱 Multiple list management
- 🔗 Share lists with public links
- 👥 View shared lists from others
- ☁️ Cloud sync with Firebase

### Design
- 🎨 Spiritual theme with warm saffron and gold colors
- ✨ Smooth animations and micro-interactions
- 📱 Mobile-first responsive design
- 🌟 Glassmorphism effects and modern UI

## Setup Instructions

### 1. Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use existing one
3. Go to Authentication > Providers and enable Google
4. Create the database table (see SQL below)
5. Copy your project URL and anon key to `.env` file

### 2. Database Setup

Run this SQL in your Supabase SQL editor:

```sql
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

-- Create index for share codes
CREATE INDEX idx_pooja_lists_share_code ON pooja_lists(share_code);
```

### 3. Environment Setup

Create a `.env` file in your project root:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Usage

### For Non-Authenticated Users
- Create and manage a single pooja checklist
- Data persists in browser localStorage
- Full functionality except sharing

### For Authenticated Users
- Sign in with Google account
- Create multiple named lists
- Save lists to cloud (Firebase)
- Share lists publicly with generated links
- Access shared lists from others
- Sync across devices

### Sharing Lists
1. Sign in with Google
2. Create or select a list
3. Click the "Share" button
4. Toggle "Public" to generate a shareable link
5. Copy and share the link with others

## Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Deployment**: Ready for Netlify/Vercel

## API Structure

### PoojaList Interface
```typescript
interface PoojaList {
  id: string;
  title: string;
  items: PoojaItem[];
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  shareCode?: string;
}
```

### PoojaItem Interface
```typescript
interface PoojaItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Contributing

Feel free to contribute by:
- Adding new features
- Improving the UI/UX
- Fixing bugs
- Adding tests
- Improving documentation

## License

MIT License - feel free to use this project for personal or commercial purposes.