// Vercel ejecuta funciones Node con la firma (req, res).
// Un app de Express ES una función (req, res) => {...}, así que
// alcanza con exportarlo directo, sin ningún wrapper extra.
module.exports = require("../app");
