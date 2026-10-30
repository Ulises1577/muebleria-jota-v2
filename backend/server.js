import dns from 'node:dns';
import mongoose from 'mongoose';
import app from './src/app.js';
import { config } from './src/config/env.js';

const PORT = config.port;

const connectDatabase = async () => {
  if (!config.mongoUri) {
    console.warn('MONGODB_URI no definida. Se usará almacenamiento en memoria para demo.');
    return;
  }

  if (config.dnsServers.length > 0) {
    dns.setServers(config.dnsServers);
    console.log(`Resolución DNS configurada (${config.dnsServers.length} servidores)`);
  }

  await mongoose.connect(config.mongoUri);
  console.log('MongoDB conectado correctamente');
};

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log('================================');
    console.log('Servidor de Hermanos Jota activo');
    console.log(`URL Base: http://localhost:${PORT}`);
    console.log(`Catálogo: http://localhost:${PORT}/api/productos`);
    console.log(`Swagger:  http://localhost:${PORT}/api-docs`);
    console.log('================================');
  });
};

startServer().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exitCode = 1;
});
