import mongoose from "mongoose";
import { Blockchain, BlockchainDoc } from "../models/blockchain";
import { Scanner } from "../services/scanner";

describe('Start App', () => {

    let blockchainsInDatabase : (BlockchainDoc & {_id: mongoose.Types.ObjectId; })[] = [];

    beforeAll( async () => {

        await Blockchain.build({
            name: 'Binance Smart Chain',
            symbol: 'BSC',
            blocktime: 3,
            processedBlock: 10000,
            enabled: true,
            adaptConcurrently: 3,
            options: { uri: 'https://bsc-dataseed1.binance.org' }
        }).save()

        blockchainsInDatabase = await Blockchain.find({ enabled: true });

        console.log(blockchainsInDatabase)
    });

    it('Start App', async () => {
        // let count = 3
        // for (const blockchain of blockchainsInDatabase) 
        // {
        //     try {
        //         const scanners : Scanner = new Scanner(blockchain)
        //         await scanners.init()
        //         console.log(`Scanner [${blockchain.name}] is starting ....`)
        //     } catch (error) {
        //         console.log(`Scanner [${blockchain.name}] error ${error} ....`)
        //     }
        // }
    });
})