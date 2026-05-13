const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import jembatan yang kita buat tadi
require('dotenv').config();

const app = express();

app.use(cors()); // Izin agar React bisa akses backend
app.use(express.json()); // Izin agar server bisa baca data format JSON


app.get('/', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 'Koneksi Berhasil!' AS status");
        res.json({
            pesan: "Halo dari Server Portal Berita!",
            database: rows[0].status
        });
    } catch (error) {
        res.status(500).json({ error: "Database tidak nyambung: " + error.message });
    }
});

const articleRoutes = require('./routes/articleRoutes'); app.use('/api/articles', articleRoutes); // Artinya: Semua request ke localhost:5000/api/articles akan diurus oleh articleRoutes.js 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server nyala di: http://localhost:${PORT}`);
});


