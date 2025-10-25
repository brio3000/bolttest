# PkiGest Pro - Certificate Management System

A comprehensive certificate management application built with React, TypeScript, and Supabase. This system helps organizations track employee certifications, manage expiration dates, and maintain compliance.

## Features

- **User Management**: Role-based access control (Administrator & Gestionnaire)
- **Certificate Tracking**: Monitor employee certificates with automatic expiration status
- **Entity Management**: Organize by cities, entities, agencies, and groups
- **Document Management**: Store and organize employee documents
- **Dashboard Analytics**: Visual insights into certificate status and expiration
- **Email Notifications**: Configurable reminders for certificate expiration
- **Dark Mode**: Full dark mode support

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Styling**: Tailwind CSS (custom design system)
- **Charts**: Recharts

## Database Schema

The application uses the following main tables:
- `users` - Application users with role-based access
- `villes` - Cities
- `entites` - Entities/Companies
- `agences` - Agencies/Branches
- `certificats` - Certificate types
- `employes` - Employees
- `employe_certificats` - Employee certificates (junction table)
- `groupes` - Employee groups
- `dossiers` - Document folders
- `documents` - Employee documents
- `app_settings` - Application configuration

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Supabase account

### Setup Instructions

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Supabase Configuration**

   The database migrations have already been applied. The `.env` file contains your Supabase connection details:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

3. **Create Your First User**

   Since authentication is now enabled, you need to create users through Supabase:

   **Option A: Using Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Users
   - Click "Add User" and create a user with email/password
   - Then run this SQL in the SQL Editor to add user data:

   ```sql
   -- For an Administrator
   INSERT INTO users (id, email, role, nom)
   VALUES (
     'YOUR_AUTH_USER_ID',  -- Get this from auth.users table
     'admin@example.com',
     'Administrateur',
     'Admin User'
   );

   -- For a Gestionnaire
   INSERT INTO users (id, email, role, entite_id, nom)
   VALUES (
     'YOUR_AUTH_USER_ID',
     'manager@example.com',
     'Gestionnaire',
     '00000001-0000-0000-0000-000000000000',  -- Tech Solutions Inc.
     'Manager User'
   );
   ```

   **Option B: Using Supabase SQL Editor**

   You can create a user directly through SQL:
   ```sql
   -- This creates an auth user and app user in one go
   -- Note: You'll need to use Supabase Auth API for password-based auth
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Login**

   Use the email and password you created in step 3 to log in to the application.

## User Roles

### Administrateur (Administrator)
- Full access to all data across all entities
- Can manage cities, entities, agencies, certificate types
- Can create and manage all employees and certificates
- Access to system settings and configuration

### Gestionnaire (Manager)
- Limited to assigned entity
- Can view and manage employees within their entity
- Can manage certificates for their entity's employees
- Read-only access to reference data (cities, certificate types, etc.)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Project Structure

```
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard with charts
│   ├── Management.tsx   # Data management interface
│   ├── Settings.tsx     # Application settings
│   ├── Login.tsx        # Authentication
│   └── ...
├── hooks/              # Custom React hooks
│   └── useAppContext.tsx # Global state management
├── lib/                # Library configurations
│   └── supabase.ts     # Supabase client
├── services/           # Business logic
│   ├── dataService.ts  # Data operations
│   └── settingsService.ts # Settings management
├── supabase/
│   ├── migrations/     # Database migrations
│   └── functions/      # Edge functions
└── types.ts           # TypeScript definitions
```

## Security

- Row Level Security (RLS) is enabled on all tables
- Role-based access control enforced at database level
- Administrators have full access
- Gestionnaires restricted to their assigned entity
- All API calls require authentication

## Sample Data

The database is pre-seeded with sample data:
- 2 entities: Tech Solutions Inc. and Innovate Group
- 3 cities: Paris, Lyon, Marseille
- 4 employees with various certificates
- Certificate types: SST, Habilitation Électrique, AWS, PMP

## Troubleshooting

### Cannot login
- Verify you created a user in Supabase Authentication
- Ensure the user has a corresponding entry in the `users` table
- Check that your `.env` file has the correct Supabase credentials

### Data not loading
- Check browser console for errors
- Verify Supabase connection in the Network tab
- Ensure RLS policies are properly configured

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall if issues persist

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact your system administrator.
