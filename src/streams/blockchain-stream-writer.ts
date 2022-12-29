import { Writable } from "stream";
import { Scanner } from "../services/scanner";
import { IBlockData } from "../blockchain/interfaces";
import { retryUntilSuccess } from "../helpers/retry-until-sucessful";

export class BlockchainStreamWriter extends Writable{

    constructor(private scanner: Scanner){
        super({ objectMode: true });
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
        const maxTx = 10000;
        const time = process.hrtime.bigint();

        // raise and event to our event provider that block has been recieved

        console.info(`[${this.scanner.model.name}] BLOCK #${chunk.height} HAS BEEN WRITTEN`);
    }
}