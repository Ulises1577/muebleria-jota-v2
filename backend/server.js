import app from './src/app.js';
import { config } from './src/config/env.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Servidor de Hermanos Jota activo`);
  console.log(`URL Base: http://localhost:${PORT}`);
  console.log(`Catálogo: http://localhost:${PORT}/api/productos`);
  console.log(`===============================================`);
});
