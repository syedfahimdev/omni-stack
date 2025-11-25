# Neo4j Connection Guide

## Access Neo4j Browser
**URL:** http://neo4j.app.localhost

## Connection Details

When you first open Neo4j Browser, you'll see a connection form. Use these settings:

### Connection URL (Connect URL)
Use **ONE** of these options:

**Option 1 (Recommended for local):**
```
neo4j://neo4j:7687
```

**Option 2 (Also works):**
```
bolt://neo4j:7687
```

**Option 3 (If above don't work):**
```
neo4j://localhost:7687
```

### Authentication
- **Username:** `neo4j`
- **Password:** `omnistack_neo4j_secure_password_2024`

## Common Connection Errors

### Error: "ServiceUnavailable: WebSocket connection failure"
**Solution:** Make sure you're using the docker service name in the URL:
- ✅ Use: `neo4j://neo4j:7687` or `bolt://neo4j:7687`
- ❌ Don't use: `localhost` from inside the browser

### Error: "Failed to connect"
**Check if Neo4j is running:**
```bash
docker logs omni-neo4j --tail 20
```

Look for: "Started" and "Bolt enabled on 0.0.0.0:7687"

### Error: "Authentication failed"
**Verify password from .env file:**
```bash
grep NEO4J_AUTH /Users/farhan/Documents/omni-stack/.env
```

Should show: `NEO4J_AUTH=neo4j/omnistack_neo4j_secure_password_2024`

## After First Login

On your first successful login, Neo4j may ask you to change the password. You can:
1. Change it to a new password (recommended)
2. Or keep using the same password

If you change it, remember to update the `.env` file with the new password!

## Quick Test

After connecting, try running this Cypher query to test:
```cypher
RETURN "Hello from Neo4j!" AS message
```

This should return a result with your message.

## Troubleshooting Commands

**Restart Neo4j:**
```bash
docker-compose restart neo4j
```

**Check Neo4j logs:**
```bash
docker logs omni-neo4j -f
```

**Check if bolt port is accessible:**
```bash
docker exec omni-neo4j netstat -tln | grep 7687
```
