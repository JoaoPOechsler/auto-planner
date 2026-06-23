require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect, startConsumer } = require('./rabbitmq');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/vehicles', require('./routes/vehicles'));
app.use('/maintenances', require('./routes/maintenances'));

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

async function start() {
  const rabbitmqOk = await connect();
  if (rabbitmqOk) await startConsumer();

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`[Server] Rodando na porta ${port}`);
    console.log(`[Server] Health: http://localhost:${port}/health`);
  });
}

start();
