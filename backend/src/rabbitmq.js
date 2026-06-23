const amqp = require('amqplib');

const QUEUE = 'maintenance_events';

let channel = null;

async function connect() {
  try {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost';
    const conn = await amqp.connect(url);
    channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    console.log('[RabbitMQ] Conectado | fila:', QUEUE);

    conn.on('error', () => { channel = null; });
    conn.on('close', () => { channel = null; });

    return true;
  } catch (err) {
    console.warn('[RabbitMQ] Indisponível, continuando sem mensageria:', err.message);
    return false;
  }
}

async function publish(event, data) {
  if (!channel) return;
  try {
    const msg = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
    channel.sendToQueue(QUEUE, Buffer.from(msg), { persistent: true });
    console.log(`[RabbitMQ] Publicado: ${event}`);
  } catch (err) {
    console.error('[RabbitMQ] Erro ao publicar:', err.message);
  }
}

async function startConsumer() {
  if (!channel) return;
  await channel.consume(QUEUE, (msg) => {
    if (!msg) return;
    const { event, data, timestamp } = JSON.parse(msg.content.toString());
    console.log(`[RabbitMQ] Evento recebido: ${event} | ${timestamp}`);
    console.log('[RabbitMQ] Dados:', JSON.stringify(data, null, 2));
    channel.ack(msg);
  });
  console.log('[RabbitMQ] Consumidor aguardando eventos...');
}

module.exports = { connect, publish, startConsumer };
