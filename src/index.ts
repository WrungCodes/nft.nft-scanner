import mongoose from 'mongoose';
import { Blockchain, BlockchainDoc } from "./models/blockchain";
import { Scanner } from "./services/scanner";

const start = async () => {
    /**
     * This key is for mongodb database
     */
    if (!process.env.REDIS) {
        throw new Error('REDIS_URI must be defined');
    }

    /**
     * This key is for mongodb database
     */
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }

    /**
     * Here we try to connect to the mongodb database using the Key before procedding
     * This would save some errors from occuring, mostly errors due to Invalid Mongo Credentials
     * or Some Database unavalability
     */
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDb');
    } catch (err) {
        console.error(err);
    }

    let blockchainsInDatabase: (BlockchainDoc & {_id: mongoose.Types.ObjectId; })[] = [];

    /**
    * Get all enabled blockchains in the database so we can begin extracting
    */
    try {
        blockchainsInDatabase = await Blockchain.find({ enabled: true });
    } catch (err) {
        console.error(err);
    }

    for (const blockchain of blockchainsInDatabase) {
        
        try {
            const scanners : Scanner = new Scanner(blockchain)
            await scanners.init()
            console.log(`Scanner [${blockchain.name}] is starting ....`)
        } catch (error) {
            console.log(`Scanner [${blockchain.name}] error ${error} ....`)
        }
    }
}

start();