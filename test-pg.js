const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.vbdbigxkuiaympzyzrfh:Tanakorn16149@aws-1-ap-south-1.pooler.supabase.com:5432/postgres'
});

async function run() {
    try {
        await client.connect();
        console.log("Connected successfully!");
        const res = await client.query('SELECT NOW()');
        console.log(res.rows[0]);
    } catch (err) {
        console.error("Connection error:", err.message, err);
    } finally {
        await client.end();
    }
}

run();
