// pages/api/db-health.ts

// -- OUTDATED CODE, WE SWITCHED TO POSTGRES! -- //

// import type { NextApiRequest, NextApiResponse } from 'next';
// import mariadb from 'mariadb';

// const pool = mariadb.createPool({
//   host: process.env.MYSQL_HOST,
//   port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DATABASE,
//   connectionLimit: 5,
// });

// type ResponseData = {
//   status: 'ok' | 'error';
//   message?: string;
// };

// export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
//   if (process.env.NODE_ENV !== 'development') {
//     return res.status(403).json({
//       status: 'error',
//       message: 'This endpoint is only available in development mode.',
//     });
//   }

//   try {
//     const conn = await pool.getConnection();
//     await conn.query('SELECT 1');
//     conn.release();

//     return res.status(200).json({ status: 'ok' });
//   } catch (error) {
//     console.error('DB connection test failed:', error);
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//     return res.status(500).json({ status: 'error', message: errorMessage });
//   }
// }
