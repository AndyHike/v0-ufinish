-- Add position column to services table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'position'
    ) THEN
        ALTER TABLE services ADD COLUMN position INTEGER;
    END IF;
END $$;

-- Update positions for existing services if they are null
UPDATE services SET position = id::text::integer WHERE position IS NULL;

-- Insert default services if they don't exist
INSERT INTO services (id, position)
VALUES 
  ('d8e57c3a-dc1a-4dd4-a9c7-6a91f0a1a9b1', 1) -- Screen Replacement
ON CONFLICT (id) DO UPDATE SET position = 1;

INSERT INTO services (id, position)
VALUES 
  ('f2a7c8b9-e3d4-5f6g-7h8i-9j0k1l2m3n4o', 2) -- Battery Replacement
ON CONFLICT (id) DO UPDATE SET position = 2;

INSERT INTO services (id, position)
VALUES 
  ('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 3) -- Connectivity Issues
ON CONFLICT (id) DO UPDATE SET position = 3;

INSERT INTO services (id, position)
VALUES 
  ('q7r8s9t0-u1v2-w3x4-y5z6-a7b8c9d0e1f2', 4) -- Water Damage
ON CONFLICT (id) DO UPDATE SET position = 4;
