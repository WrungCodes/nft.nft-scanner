import mongoose from 'mongoose';
import dotenv from 'dotenv'
import amqp from "amqplib";
import { Blockchain, BlockchainDoc } from "./models/blockchain";
import { Scanner } from "./services/scanner";
import { blockParsedQueue } from "./queues/block-parsed-event"

const start = async () => {
    dotenv.config()

    /**
     * This key is for rabbitmq
     */
    if (!process.env.RABBITMQ_URI) {
        throw new Error('RABBITMQ_URI must be defined');
    }

    /**
     * This key is for mongodb database
     */
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }

    try {
        await amqp.connect(process.env.RABBITMQ_URI);
        console.log('Connected to RabbitMQ');
    } catch (err) {
        console.error(err);
    }

    blockParsedQueue()

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

        if(blockchainsInDatabase.length == 0){
            console.log('No blockchain to scan')
        }

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

    process.on('SIGINT', function() {
        console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
        process.exit(0);
    });

    process.on('uncaughtException', function(err) {
        console.log("Uncaught exception!", err);
    });
}

start();