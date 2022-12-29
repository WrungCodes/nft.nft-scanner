import { Readable } from "stream";
import { IBlockData, IBlockchainExtractor } from "../blockchain/interfaces";
import { Scanner } from "../services/scanner";
import { retryUntilSuccess } from "../helpers/retry-until-sucessful";
import { timeout } from "../helpers/timeout";

export class BlockchainStreamReader extends Readable {
    private extractor: IBlockchainExtractor;
    private blocknumberToExtract: number;
    private blockchainHeight: number;

    constructor(adapter: Function, private scanner: Scanner) {
        super({
            objectMode: true,
        });
        
        this.extractor = Reflect.construct(adapter, [ this.scanner.model.options ]);

        /**
         * NT: if this is the first time the processedBlock will be zero and meaning processing
         *      would start form the block 1 hence also the +1
         */
        this.blocknumberToExtract = this.scanner.model.processedBlock + 1;
        this.blockchainHeight = 0;
    }

    async _read(size: number): Promise<void> {
        
        /**
         * Retry the readNextBlocks function for an infinite number of times till successful every 30 seconds
         */
        const blocks = await retryUntilSuccess(this, this.readNextBlocks, [], {
            sleep: 30 * 1000,
            retry: Infinity,
            failMessage: `[${this.scanner.model.name}] Blockchain Reader failed on the block #${this.blocknumberToExtract}`
        });

        /**
         * Push each block into the reader pipe so they can be acted on by the writers.
         */
        for (const block of blocks) {
            this.push({ ...block, blocknumber: this.blocknumberToExtract, height: this.blockchainHeight });

            /**
             * Increase the block number to extract so that the next cursor read will go for the next block.
             */
            this.blocknumberToExtract += 1;
        }
    }

    private async readNextBlocks() {
        try {
            /**
             * Get the current time of the running process
             */
            const startTime = process.hrtime.bigint();

            /**
             * stall process if the block to extract is currently higher than the blockchain block height 
             */
            while (this.blocknumberToExtract > this.blockchainHeight) {

                /**
                 * if the blockchain already has blocks, meaning has already been running, wait for the blocktime
                 */
                if (this.blockchainHeight > 0){
                    await timeout(this.scanner.model.blocktime)
                }

                /**
                 * Get latest blockheight after waiting for block time
                 */
                this.blockchainHeight = await this.extractor.getLatestBlock()             
            }

            /**
             * Get the number of blocks that can be processed concurrently.
             */
            const xNumOfInstances = this.scanner.model.adaptConcurrently

            /**
             * Now having got the number of blocks that can processed concurrently, we also have to know the number of blocks available for processing
             * we can now take the minimum of these and get how many blocks we will process.
             */
            const xNumOfInstancesLimit = Math.min(xNumOfInstances, (this.blockchainHeight - (this.blocknumberToExtract + 1)))

            const blocks: IBlockData[] = [];

            /**
             * If the extractor is behind more than one block, loop through and extract each block number 
             */
            if (xNumOfInstancesLimit > 1){

                const promises = [];

                for (let i = 0; i < xNumOfInstancesLimit; i++) {
                    promises.push(this.extractor.extract(this.blocknumberToExtract + i));
                }

                blocks.push(...await Promise.all(promises))
            }
            else
            {
                blocks.push(await this.extractor.extract(this.blocknumberToExtract))
            }

            return blocks
        } catch (error) {
            throw new Error(`Error on [readNextBlocks] ${error}`);
        }
    }
}