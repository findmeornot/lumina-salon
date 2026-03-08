const env = require('./config/env');
const app = require('./app');
const { verifyDbConnection } = require('./config/db');
const { registerCronJobs } = require('./cron/jobs');

const bootstrap = async () => {
  try {
    await verifyDbConnection();
    const server = app.listen(env.port, env.host, () => {
      console.log(`Lumina backend running on http://${env.host}:${env.port}`);
      console.log('MySQL connection OK');
    });
    server.on('error', (err) => {
      if (err.code === 'EACCES') {
        console.error(`Port permission denied for ${env.host}:${env.port}. Try changing PORT (e.g. 5001) or set HOST=127.0.0.1 in backend/.env`);
        process.exit(1);
      }
      console.error(err);
      process.exit(1);
    });
    registerCronJobs();
  } catch (err) {
    console.error('Failed to connect to MySQL. Check DB_* in backend/.env');
    console.error(err.message);
    process.exit(1);
  }
};

bootstrap();

