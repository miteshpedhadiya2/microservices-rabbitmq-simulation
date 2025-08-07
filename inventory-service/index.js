import amqp from 'amqplib';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const ORDER_QUEUE = process.env.ORDER_QUEUE;
const MAX_RETRIES = 5;

async function start() {
	let retries = 0;
	let connection;

	while (retries < MAX_RETRIES) {
		try {
			connection = await amqp.connect(RABBITMQ_URL);
			break; // Exit loop if connection is successful
		} catch (error) {
			retries++;
			console.error(
				`Notification service connection failed: (attempt ${retries})`,
				error.message
			);
			if (retries === MAX_RETRIES) {
				console.error('Max retries reached. Exiting...');
				return;
			} else {
				await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before retrying
			}
			continue; // Retry connection
		}
	}

	if (!connection) {
		console.error('Failed to connect to RabbitMQ');
		return;
	}

	try {
		const channel = await connection.createChannel();
		await channel.assertQueue(ORDER_QUEUE, { durable: true });

		channel.consume(ORDER_QUEUE, (msg) => {
			const order = JSON.parse(msg.content.toString());
			console.log(
				`Inventory updated for order: ${order.product}, quantity: ${order.quantity}`
			);
			channel.ack(msg); // Acknowledge the message
		});
	} catch (error) {
		console.error('Error occurred while consuming messages:', error.message);
	} finally {
		await connection.close();
	}
}

start();
