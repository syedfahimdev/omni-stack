-- Enable vector extension for future RAG
create extension if not exists vector;

-- Create the Agents Configuration Table
create table if not exists agent_configs (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique not null,
    system_prompt text not null,
    model_provider text not null default 'openai', -- 'openai', 'anthropic', 'ollama'
    model_name text not null default 'gpt-4o',     -- 'gpt-4o', 'llama3'
    temperature float default 0.7,
    is_active boolean default true,
    tools jsonb default '[]'::jsonb,
    custom_tools jsonb default '[]'::jsonb,
    created_at timestamp with time zone default now()
);

-- Seed a default "General Bot" so the app isn't empty
insert into agent_configs (name, slug, system_prompt, model_provider, model_name)
values 
('General Assistant', 'general', 'You are a helpful AI assistant.', 'openai', 'gpt-3.5-turbo')
on conflict (slug) do nothing;
