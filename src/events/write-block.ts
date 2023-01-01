import Bull from "bull";
import { Blockchain } from "../models/blockchain";
import { IBlockData } from "../blockchain/interfaces";
import { retryUntilSuccess } from "../helpers/retry-until-sucessful";

export const writeBlock = async ( job: Bull.Job<IBlockData>, uploadAssetQueue: Bull.Queue<IBlockData> ) => {
    await retryUntilSuccess(this, run, [job, uploadAssetQueue], {
        sleep: 20 * 1000,
        retry: Infinity,
        failMessage: `Write Block failed, retrying`
    });
}

async function run(job: Bull.Job<IBlockData>, uploadAssetQueue: Bull.Queue<IBlockData>){
    try {
        /**
         * Find the blockchain entry of the provider blockdata passed
         */
        const bc = await Blockchain.findOne({ enabled: true, symbol: job.data.provider });

        if(bc == null) { throw new Error('invalid blockchain') }

        // TODO: Create a seperate service for tracting blockchain
        // /**
        //  * This check is to ensure data integrity and make sure all data are ordered by block
        //  */
        // if(job.data.height != bc.processedBlock + 1){
        //     console.log(`BLOCK[${job.data.height}] PROCESSED BLOCK[${bc.processedBlock}] OUT OF ORDER`)
        // }

        /**
         * Update the processed block and save the changes
         */
        bc.processedBlock = Math.max(job.data.height, bc.processedBlock)
        bc.save()

        /**
         * Raise an event for the uploading of the found erc721
         */
        uploadAssetQueue.add(job.data, {  attempts: Infinity, backoff: 5000 })

        
        console.log(`[${job.data.provider}] BLOCK #${job.data.height} QEUED SUCCESSFULLY`);

    } catch (err) {
        throw new Error(`Error ${err}`)
    }
}