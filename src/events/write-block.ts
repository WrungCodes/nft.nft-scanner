import Bull from "bull";
import { Blockchain } from "../models/blockchain";
import { IBlockData } from "../blockchain/interfaces";

export const writeBlock = async ( job: Bull.Job<IBlockData>, uploadAssetQueue: Bull.Queue<IBlockData> ) => {
    try {
        /**
         * Find the blockchain entry of the provider blockdata passed
         */
        const bc = await Blockchain.findOne({ enabled: true, symbol: job.data.provider });

        if(bc == null) { throw new Error('invalid blockchain') }

        /**
         * This check is to ensure data integrity and make sure all data are ordered by block
         */
        if(job.data.height != bc.processedBlock + 1){
            throw new Error("Block out of order");
        }

        /**
         * Update the processed block and save the changes
         */
        bc.processedBlock = job.data.height
        bc.save()

        /**
         * Raise an event for the uploading of the found erc721
         */
        uploadAssetQueue.add(job.data, {  attempts: Infinity, backoff: 5000 })

    } catch (err) {
        throw new Error(`Error ${err}`)
    }
}
