using System;
using System.IO;
using System.Text;

class RebuildCleanLoadState {
    static void Main() {
        string serverPath = @"d:\antigravity\server.js";
        string serverCode = File.ReadAllText(serverPath, Encoding.UTF8);

        string cleanLoadStateFunc = @"// Helper to load state from Supabase PostgreSQL or local db.json
async function loadState() {
  const localState = readJsonFile(path.join(__dirname, 'db.json'));
  localState.dbVersion = '21.26';

  if (DATABASE_URL) {
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      await client.query(""SET client_encoding = 'UTF8'"");
      await client.query('CREATE TABLE IF NOT EXISTS app_state (id INT PRIMARY KEY, state_json TEXT)');
      const res = await client.query('SELECT state_json FROM app_state WHERE id = 1');
      if (res.rows.length > 0) {
        let dbState = {};
        try {
          let rawDb = res.rows[0].state_json;
          if (rawDb && rawDb.charCodeAt(0) === 0xFEFF) rawDb = rawDb.slice(1);
          dbState = JSON.parse(rawDb);
        } catch (e) {
          console.warn('Could not parse Postgres state_json:', e.message);
        }

        if (!dbState || !Array.isArray(dbState.leads) || dbState.leads.length === 0 || !Array.isArray(dbState.users) || dbState.users.length === 0) {
          console.log('Postgres DB state is empty, initializing with local db.json...');
          await client.query('INSERT INTO app_state (id, state_json) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET state_json = $1', [JSON.stringify(localState)]);
          await client.end();
          return sanitizeServerState(localState);
        }
        dbState.dbVersion = '21.26';
        await client.end();
        return sanitizeServerState(dbState);
      } else {
        await client.query('INSERT INTO app_state (id, state_json) VALUES (1, $1)', [JSON.stringify(localState)]);
        await client.end();
        return sanitizeServerState(localState);
      }
    } catch (err) {
      console.error('Database connection error, falling back to local db.json:', err);
      try { await client.end(); } catch (e) {}
      return sanitizeServerState(localState);
    }
  }
  return sanitizeServerState(localState);
}";

        int loadStart = serverCode.IndexOf("// Helper to load state from Supabase PostgreSQL");
        int saveStart = serverCode.IndexOf("async function saveState(newState)");

        if (loadStart == -1 || saveStart == -1) {
            Console.WriteLine("ERROR: Could not locate loadState bounds!");
            return;
        }

        string before = serverCode.Substring(0, loadStart);
        string after = serverCode.Substring(saveStart);

        string cleanServerJs = before + cleanLoadStateFunc + "\n\n" + after;

        File.WriteAllText(serverPath, cleanServerJs, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\server.js", cleanServerJs, new UTF8Encoding(false));

        Console.WriteLine("RebuildCleanLoadState completed successfully!");
    }
}
