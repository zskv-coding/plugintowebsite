const mysql = require('mysql2/promise');

module.exports = async (req, res) => {
  // Allow the page to call this from the browser
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');

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
      `SELECT username, kills, deaths, zombies_killed
       FROM player_stats
       ORDER BY kills DESC
       LIMIT 100`
    );

    res.status(200).json({ players: rows });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  } finally {
    if (connection) await connection.end();
  }
};
