const express = require('express');
const router = express.Router();
const db = require('../db'); // Mundur 1 folder (..) untuk memanggil jembatan database

// ==========================================
// 1. ENDPOINT GET: MENGAMBIL SEMUA BERITA
// ==========================================
router.get('/', async (req, res) => {
    try {
        // Kita pakai JOIN agar nama Kategori dan Penulis ikut tampil, bukan cuma ID-nya saja!
        const query = `
            SELECT articles.id, articles.title, articles.content, articles.image, articles.created_at,
                   tbl_kategori.nama AS category_name,  
                   user.username AS author_name         
            FROM articles
            JOIN tbl_kategori ON articles.category_id = tbl_kategori.id
            JOIN user ON articles.user_id = user.id
            ORDER BY articles.created_at DESC
        `;

        const [rows] = await db.query(query);
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// ==========================================
// 2. ENDPOINT POST: MENAMBAH BERITA BARU
// ==========================================
router.post('/', async (req, res) => {
    try {
        const { title, content, image, category_id, user_id } = req.body;

        // Validasi sederhana
        if (!title || !content || !category_id || !user_id) {
            return res.status(400).json({ success: false, message: "Data tidak boleh kosong!" });
        }

        // Tanda '?' digunakan agar aman dari serangan Hacker (SQL Injection)
        const query = `INSERT INTO articles (title, content, image, category_id, user_id) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.query(query, [title, content, image || 'default.jpg', category_id, user_id]);

        res.status(201).json({ success: true, message: "Berita berhasil ditambahkan!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// ==========================================
// 3. ENDPOINT DELETE: MENGHAPUS BERITA
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        // 1. TANGKAP NOMOR ID DARI URL (Contoh: /api/articles/5 berarti ID-nya 5)
        const articleId = req.params.id;

        // 2. PERINTAHKAN DAPUR (MySQL) UNTUK MENGHAPUS
        const query = `DELETE FROM articles WHERE id = ?`;
        const [result] = await db.query(query, [articleId]);

        // 3. CEK APAKAH BERITANYA BENERAN ADA?
        // affectedRows itu jumlah baris yang berhasil dihapus di database
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Gagal dihapus! Berita dengan ID tersebut tidak ditemukan."
            });
        }

        // 4. KABARI JIKA BERHASIL
        res.status(200).json({
            success: true,
            message: `Mantap! Berita nomor ${articleId} telah hangus tak tersisa.`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

module.exports = router; // Wajib diekspor agar bisa dipakai oleh server.js

// ==========================================
// 3. ENDPOINT PUT: MENGUPDATE BERITA
// ==========================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Mengambil ID dari URL (misal: /api/articles/5)
        const { title, content, image, category_id} = req.body;

        // Validasi sederhana
        if (!title || !content || !category_id) {
            return res.status(400).json({ success: false, message: "Data tidak boleh kosong!" });
        }

        // Query UPDATE yang benar menggunakan SET dan WHERE
        // Gunakan tanda '?' agar aman dari SQL Injection
        const query = `
            UPDATE articles 
            SET title = ?, content = ?, image = ?, category_id = ?
            WHERE id = ?
        `;
        
        // Perhatikan urutan parameter di dalam array harus sama persis dengan urutan '?' di query
        const [result] = await db.query(query, [title, content, image || 'default.jpg', category_id, id]);

        // Jika tidak ada baris yang terpengaruh, berarti ID berita tidak ada di database
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Berita tidak ditemukan atau tidak ada perubahan!" });
        }

        res.json({ success: true, message: "Berita berhasil diupdate!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});



