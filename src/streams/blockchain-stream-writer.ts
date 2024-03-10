import { Writable } from "stream";
import { Scanner } from "../services/scanner";
import { IBlockData } from "../blockchain/interfaces";
import { retryUntilSuccess } from "../helpers/retry-until-sucessful";
import amqp from "amqplib";

const block_parsed_event = "block-parsed-event"
export class BlockchainStreamWriter extends Writable{

    channel: any;
    connection: any;

    constructor(private scanner: Scanner){
        super({ objectMode: true });
    }

    async getConnection(){
        if(!this.connection){
            const connection = await amqp.connect(process.env.RABBITMQ_URI ?? "amqp://localhost");
            return connection
        }
        return this.connection
    }

    async getChannel(){
        if(!this.channel && !this.connection){
            const connection = await this.getConnection();
            const channel = await connection.createChannel();
            await channel.assertQueue(block_parsed_event, { durable: false });
            return channel
        }
        return this.channel
    }

    async _write(chunk: IBlockData, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): Promise<void> {

        await retryUntilSuccess(this, this.writeBlock, [chunk], {
            sleep: 30 * 1000,
            retry: Infinity,
            failMessage: `Blockchain Stream Writer for ${this.scanner.model.name} failed`
        });
        
        callback();
    }

    private async writeBlock(chunk: IBlockData): Promise<void> {
        // const maxTx = 10000;
        // const time = process.hrtime.bigint();

        // raise and event to our event provider that block has been recieved
        try {
            const channel = await this.getChannel()
            channel.sendToQueue(block_parsed_event, Buffer.from(JSON.stringify(chunk)))

            console.log(`[${this.scanner.model.name}] BLOCK #${chunk.height} HAS BEEN WRITTEN`);
        } catch (error) {
            console.error(error);
            if (this.connection) await this.connection.close();
        }
    }
}