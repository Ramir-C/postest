import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// Para rutas relativas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// 🔹 Conexión a MySQL
const db = await mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

// 🔹 Crear tabla si no existe
await db.query(`
  CREATE TABLE IF NOT EXISTS respuestas1 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    age INT,
    user_group VARCHAR(100),
    school VARCHAR(150),
    correctCount INT,
    incorrectCount INT,
    correctAnswers TEXT,
    incorrectAnswers TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log("✅ Tabla lista");

// 🔹 Rutas HTML
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/resultados", (req, res) => res.sendFile(path.join(__dirname, "public", "resultados.html")));

// 🔹 Guardar respuestas
app.post("/save", async (req, res) => {
  try {
    const { username, age, group, school, correctCount, incorrectCount, correctAnswers, incorrectAnswers } = req.body;
    await db.query(
      `INSERT INTO respuestas1 
      (username, age, user_group, school, correctCount, incorrectCount, correctAnswers, incorrectAnswers)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, age, group, school, correctCount, incorrectCount, correctAnswers, incorrectAnswers]
    );

    res.json({ message: "Respuestas guardadas con éxito", correctCount, incorrectCount, correctAnswers, incorrectAnswers });
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    res.status(500).json({ error: "Error al guardar respuestas" });
  }
});

// 🔹 Consultar resultados
app.get("/respuestas1", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM respuestas1 ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener resultados:", error);
    res.status(500).json({ error: "Error al obtener resultados" });
  }
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

