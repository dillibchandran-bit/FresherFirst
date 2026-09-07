-- Fix privacy leak on profiles table (exposing all emails)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

-- Allow employers and admins to view candidate profiles
-- We use a security definer function to avoid infinite recursion when querying profiles table
CREATE OR REPLACE FUNCTION can_view_profile(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  viewer_role user_role;
  target_role user_role;
BEGIN
  -- If querying self, allow
  IF auth.uid() = target_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Get roles
  SELECT role INTO viewer_role FROM profiles WHERE id = auth.uid();
  SELECT role INTO target_role FROM profiles WHERE id = target_user_id;

  -- Admins can view anyone
  IF viewer_role = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- Employers can view candidates and other employers in their company
  IF viewer_role = 'employer' THEN
    IF target_role = 'candidate' THEN
      RETURN TRUE;
    END IF;
    -- Note: We could add logic for employers viewing co-workers here if needed
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Profile visibility" ON profiles
FOR SELECT USING (can_view_profile(id));

-- Note: we need to drop the "Admins have full access" ON profiles FOR ALL because our new function covers selects, 
-- but we should keep it or rewrite it. Actually "Admins have full access" covers FOR ALL, so it is still active.

