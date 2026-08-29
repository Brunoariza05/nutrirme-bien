const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "Falta la variable de entorno MONGODB_URI. Revisá tu archivo .env (local) o las Environment Variables en Vercel."
  );
}

// En serverless (Vercel), cada request puede llegar a una instancia nueva de la
// función. Guardamos la conexión en una variable global para reutilizarla entre
// invocaciones cuando sea posible, en vez de abrir una conexión nueva cada vez.
if (!global._mongoClientPromise) {
  const client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

async function getDb() {
  const client = await global._mongoClientPromise;
  return client.db(); // usa la base indicada en el connection string (nutrirme-bien)
}

module.exports = { getDb };