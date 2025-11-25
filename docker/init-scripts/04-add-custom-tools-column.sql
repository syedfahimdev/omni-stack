-- Add custom_tools column to agent_configs if it doesn't exist
ALTER TABLE agent_configs 
ADD COLUMN IF NOT EXISTS custom_tools jsonb DEFAULT '[]'::jsonb;
