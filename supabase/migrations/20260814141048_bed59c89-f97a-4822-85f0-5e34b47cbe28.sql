/*
# Create projects table for employer project creation

1. New Tables
- `projects` stores the projects created by employers.
- `id` is the generated UUID primary key.
- `project_name` stores the required project name.
- `client_name` stores the required employer/client name.
- `project_code` stores the unique human-readable code shown after creation.
- `created_at` stores when the project was created.

2. Security
- Row Level Security is enabled on `projects`.
- This app has no sign-in screen, so anon and authenticated roles can use the project form and read the resulting records.
- Four separate CRUD policies are defined for the table.

3. Important Notes
- `project_code` is unique so duplicate codes cannot be stored.
- No user ownership column is added because this flow does not require accounts.
*/

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  client_name text NOT NULL,
  project_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
CREATE POLICY "Public can view projects"
  ON public.projects FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can create projects" ON public.projects;
CREATE POLICY "Public can create projects"
  ON public.projects FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update projects" ON public.projects;
CREATE POLICY "Public can update projects"
  ON public.projects FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete projects" ON public.projects;
CREATE POLICY "Public can delete projects"
  ON public.projects FOR DELETE
  TO anon, authenticated
  USING (true);