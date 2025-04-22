-- Create services_translations table if it doesn't exist
CREATE TABLE IF NOT EXISTS services_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, locale)
);

-- Insert translations for Screen Replacement service
INSERT INTO services_translations (service_id, locale, name, description)
VALUES 
  ('d8e57c3a-dc1a-4dd4-a9c7-6a91f0a1a9b1', 'uk', 'Заміна екрану', 'Професійна заміна розбитого або пошкодженого екрану.'),
  ('d8e57c3a-dc1a-4dd4-a9c7-6a91f0a1a9b1', 'en', 'Screen Replacement', 'Professional replacement of broken or damaged screens.'),
  ('d8e57c3a-dc1a-4dd4-a9c7-6a91f0a1a9b1', 'cs', 'Výměna displeje', 'Profesionální výměna rozbitého nebo poškozeného displeje.');

-- Insert translations for Battery Replacement service
INSERT INTO services_translations (service_id, locale, name, description)
VALUES 
  ('f2a7c8b9-e3d4-5f6g-7h8i-9j0k1l2m3n4o', 'uk', 'Заміна батареї', 'Відновлення тривалості роботи вашого телефону з новою батареєю.'),
  ('f2a7c8b9-e3d4-5f6g-7h8i-9j0k1l2m3n4o', 'en', 'Battery Replacement', 'Restore your phone''s battery life with a new battery.'),
  ('f2a7c8b9-e3d4-5f6g-7h8i-9j0k1l2m3n4o', 'cs', 'Výměna baterie', 'Obnovení výdrže vašeho telefonu s novou baterií.');

-- Insert translations for Connectivity Issues service
INSERT INTO services_translations (service_id, locale, name, description)
VALUES 
  ('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'uk', 'Проблеми з підключенням', 'Ремонт Wi-Fi, Bluetooth та інших проблем з підключенням.'),
  ('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'en', 'Connectivity Issues', 'Fix Wi-Fi, Bluetooth, and other connectivity problems.'),
  ('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'cs', 'Problémy s připojením', 'Oprava Wi-Fi, Bluetooth a dalších problémů s připojením.');

-- Insert translations for Water Damage service
INSERT INTO services_translations (service_id, locale, name, description)
VALUES 
  ('q7r8s9t0-u1v2-w3x4-y5z6-a7b8c9d0e1f2', 'uk', 'Захист від води', 'Відновлення телефонів після пошкодження водою.'),
  ('q7r8s9t0-u1v2-w3x4-y5z6-a7b8c9d0e1f2', 'en', 'Water Damage', 'Recovery of phones after water damage.'),
  ('q7r8s9t0-u1v2-w3x4-y5z6-a7b8c9d0e1f2', 'cs', 'Ochrana proti vodě', 'Obnova telefonů po poškození vodou.');
