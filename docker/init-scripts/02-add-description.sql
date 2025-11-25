ALTER TABLE agent_configs ADD COLUMN IF NOT EXISTS description TEXT DEFAULT 'A helpful AI assistant.';

-- Update existing agents with descriptions
UPDATE agent_configs SET description = 'A general-purpose AI assistant that can help with a wide range of tasks.' WHERE slug = 'general';
UPDATE agent_configs SET description = 'A specialized researcher that can search the web and scrape content to find information.' WHERE slug = 'researcher';
