import Bull from "bull";
import mongoose from "mongoose";
import { Blockchain, BlockchainDoc } from "../models/blockchain";
import { IBlockData } from "../blockchain/interfaces";

console.log('Started')

const queue = new Bull(
    'write-block', 
    process.env.REDIS ?? 'redis://127.0.0.1:6379', 
);

const erc721Queue = new Bull(
    'send-erc721', 
    process.env.REDIS ?? 'redis://127.0.0.1:6379', 
);

queue.process(async (job) => {
    await connect( job );

});

let connected = false;

const connect = async ( job: Bull.Job<IBlockData> ) => {
    /**
    * Get all enabled blockchains in the database so we can begin extracting
    */
    try {
        if(connected == false){ connected = await init() }

        const bc = await Blockchain.findOne({ enabled: true, symbol: job.data.provider });

        if(bc == null) { throw new Error('invalid blockchain') }

        if(job.data.height != bc.processedBlock + 1){
            throw new Error("Block out of order");
        }

        bc.processedBlock = job.data.height
        bc.save()

        erc721Queue.add(job.data, {  attempts: Infinity, backoff: 5000 })

    } catch (err) {
        throw new Error(`Error ${err}`)
    }
}

const init = async () => {

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

    console.log('Connecting to DB')

    return true
}
