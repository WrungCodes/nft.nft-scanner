import { BlockchainDoc } from "../models/blockchain";
import blockchains from "../blockchain/index"

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
            // Implement Read Stream and Write Stream then Pipe it
        }
        else
        { 
            console.log(`Missing Blockchain with symbol ${this.model.symbol}`) 
        }
    }
}