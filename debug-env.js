require('dotenv').config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;

console.log("--- DEBUG ENV ---");
if (!dbUrl) {
    console.error("❌ DATABASE_URL is UNDEFINED!");
} else {
    // Mask password using simple regex for safety logging
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':***@');
    console.log("✅ DATABASE_URL found:", maskedUrl);

    // Check for common issues
    if (dbUrl.includes("YOUR_PASSWORD")) console.error("⚠️ Contains placeholder [YOUR_PASSWORD]");
    if (!dbUrl.includes("sslmode=require")) console.error("⚠️ Missing sslmode=require");
    if (dbUrl.includes(" ")) console.error("⚠️ URL contains spaces!");
}

console.log("--- TEST CONNECTION ---");
const postgres = require('postgres');

async function testConnection() {
    if (!dbUrl) return;

    try {
        const sql = postgres(dbUrl, { max: 1 });
        const result = await sql`SELECT version()`;
        console.log("✅ Connection Successful!");
        console.log("Version:", result[0].version);
        await sql.end();
    } catch (err) {
        console.error("❌ Connection Failed:");
        console.error(err);
    }
}

testConnection();
