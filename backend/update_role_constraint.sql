-- Drop the existing constraint
ALTER TABLE nurses_doctors DROP CONSTRAINT IF EXISTS check_role_valid;

-- Add the new constraint that includes 'Admin'
ALTER TABLE nurses_doctors 
ADD CONSTRAINT check_role_valid 
CHECK (role IN ('Nurse', 'Doctor', 'Admin'));
