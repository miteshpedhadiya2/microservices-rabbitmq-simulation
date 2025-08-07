// * ORDER SERVICE
import express from 'express';
import amqp from 'amqplib';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.ORDER_SERVICE_PORT;
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const ORDER_QUEUE = process.env.ORDER_QUEUE;
const MAX_RETRIES = 5;

app.use(express.json());

app.post('/order', async (req, res) => {
	let retries = 0;
	let connection;

	while (retries < MAX_RETRIES) {
		try {
			connection = await amqp.connect(RABBITMQ_URL);
			break; // Exit loop if connection is successful
		} catch (err) {
			retries++;
			console.error(
				`Rabbit connection failed (attempt ${retries}):`,
				err.message
			);
			if (retries === MAX_RETRIES) {
				console.error('Max retries reached. Exiting...');
				return res.status(500).json({ error: 'Failed to connect to RabbitMQ' });
			} else {
				await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before retrying
			}
			continue; // Retry connection
		}
	}

	if (!connection) {
		return res.status(500).json({ error: 'Failed to connect to RabbitMQ' });
	}

	try {
		const channel = await connection.createChannel();
		await channel.assertQueue(ORDER_QUEUE, { durable: true });
		const order = req.body;

		channel.sendToQueue(ORDER_QUEUE, Buffer.from(JSON.stringify(order)), {
			persistent: true,
		});

		res
			.status(201)
			.json({ message: 'Order received and queued successfully!' });
	} catch (err) {
		console.error('Failed to send order to queue:', err.message);
		res.status(500).json({ error: 'Failed to process order' });
	} finally {
		setTimeout(() => connection.close(), 500);
	}
});

app.listen(PORT, () => {
	console.log(`Order Service is running on port ${PORT}`);
});
