import amqp from "amqplib";
import { writeBlock } from "../events/write-block";

const queue = "block-parsed-event";
const nft_recieved_queue = "nft-recieved-queue";

const blockParsedQueue =  async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URI ?? "amqp://localhost");
    const channel = await connection.createChannel();

    process.once("SIGINT", async () => {
      await channel.close();
      await connection.close();
    });
    await channel.assertQueue(queue, { durable: false });
    await channel.consume(
      queue,
      (message) => {
        if (message) {
          const parsedMessage = JSON.parse(message.content.toString())
          writeBlock(parsedMessage, () => {
            channel.sendToQueue(nft_recieved_queue, Buffer.from(JSON.stringify(parsedMessage)))
          })
        }
      },
      { noAck: true }
    );

    console.log(" [*] Waiting for messages. To exit press CTRL+C");
  } catch (err) {
    console.warn(err);
  }
};

export { blockParsedQueue };
