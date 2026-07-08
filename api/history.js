const mysql = require('mysql2/promise');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false },
        });

        const [rows] = await connection.execute(
            `SELECT username, event_type, target_name, detail, created_at
       FROM player_events
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
            [limit]
        );

        res.status(200).json({ events: rows });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to load history' });
    } finally {
        if (connection) await connection.end();
    }
};