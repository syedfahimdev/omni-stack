-- Create schema
CREATE SCHEMA IF NOT EXISTS vault;

-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA vault;

-- Create secrets table
CREATE TABLE IF NOT EXISTS vault.secrets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text,
    description text,
    secret text NOT NULL, -- This will store the ENCRYPTED value
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Encryption Key (In production, this should be managed better, e.g. separate env var)
-- For this setup, we define a constant or use a specific key.
-- We will create a wrapper function to insert secrets safely.

CREATE OR REPLACE FUNCTION vault.create_secret(name text, secret_value text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
    new_id uuid;
    encryption_key text := 'omnistack_internal_vault_key_2025'; -- HARDCODED KEY FOR DEMO
BEGIN
    INSERT INTO vault.secrets (name, secret)
    VALUES (name, vault.pgp_sym_encrypt(secret_value, encryption_key))
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$;

-- Function to get decrypted secret
CREATE OR REPLACE FUNCTION get_decrypted_secret(secret_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
    decrypted_secret text;
    encryption_key text := 'omnistack_internal_vault_key_2025'; -- SAME KEY
BEGIN
    SELECT vault.pgp_sym_decrypt(secret::bytea, encryption_key) INTO decrypted_secret
    FROM vault.secrets
    WHERE id = secret_id;
    
    RETURN decrypted_secret;
END;
$$;

-- Add model_api_key_id to agent_configs
ALTER TABLE agent_configs 
ADD COLUMN IF NOT EXISTS model_api_key_id uuid REFERENCES vault.secrets(id);

-- Grant access
GRANT USAGE ON SCHEMA vault TO service_role;
GRANT SELECT ON vault.secrets TO service_role;
GRANT EXECUTE ON FUNCTION vault.create_secret(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION get_decrypted_secret(uuid) TO service_role;
