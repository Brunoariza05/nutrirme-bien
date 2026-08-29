require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getDb } = require("../lib/db");

async function migrate() {
  const rutaJson = path.join(__dirname, "..", "data", "content.json");
  const raw = fs.readFileSync(rutaJson, "utf-8");
  const content = JSON.parse(raw);

  const db = await getDb();
  await db.collection("content").updateOne(
    { _id: "site" },
    { $set: content },
    { upsert: true }
  );

  console.log("✅ Contenido migrado a MongoDB correctamente.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Error migrando el contenido:", err);
  process.exit(1);
});