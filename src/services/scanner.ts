import { BlockchainDoc } from "../models/blockchain";
import blockchains from "../blockchain/index"
import { BlockchainStreamReader } from "../streams/blockchain-stream-reader";
import { BlockchainStreamWriter } from "../streams/blockchain-stream-writer";

export class Scanner {
    constructor(
        /**
         * The Blockchain object gotten from the database, to get informations about the blockchain
         */
        public model: BlockchainDoc,
    ) { }

    async init() {

        if(blockchains.has(this.model.symbol))
        {
            const blockchainStreamReader = new BlockchainStreamReader(blockchains.get(this.model.symbol), this);
            const blockchainStreamWriter = new BlockchainStreamWriter(this)

            blockchainStreamReader.pipe(blockchainStreamWriter)
        }
        else
        { 
            console.log(`Missing Blockchain with symbol ${this.model.symbol}`) 
        }
    }
}