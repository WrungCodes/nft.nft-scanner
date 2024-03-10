import Bull from "bull";
import { Blockchain } from "../models/blockchain";
import { IBlockData } from "../blockchain/interfaces";
import { retryUntilSuccess } from "../helpers/retry-until-sucessful";

export const writeBlock = async ( data: IBlockData, callback: () => void ) => {
    await retryUntilSuccess(this, run, [ data, callback ], {
        sleep: 20 * 1000,
        retry: Infinity,
        failMessage: `Write Block failed, retrying`
    });
}

async function run(data: IBlockData, callback: () => void){
    try {
        /**
         * Find the blockchain entry of the provider blockdata passed
         */
        const bc = await Blockchain.findOne({ enabled: true, symbol: data.provider });

        if(bc == null) { throw new Error('invalid blockchain') }

        // TODO: Create a seperate service for tracting blockchain
        /**
         * This check is to ensure data integrity and make sure all data are ordered by block
         */
        if(data.height != bc.processedBlock + 1){
            console.log(`BLOCK[${data.height}] PROCESSED BLOCK[${bc.processedBlock}] OUT OF ORDER`)

            if(data.height <= bc.processedBlock + 1){
                return
            }
        }

        if(data.height == bc.processedBlock + 1){
            /**
             * Update the processed block and save the changes
             */
            bc.processedBlock = Math.max(data.height, bc.processedBlock)
            bc.save()

            console.log(`[${data.provider}] BLOCK #${data.height} QEUED SUCCESSFULLY`);
            callback();
        }

        /**
         * Raise an event for the uploading of the found erc721
         */
        // uploadAssetQueue.add(data, {  attempts: Infinity, backoff: 5000 })

    } catch (err) {
        throw new Error(`Error ${err}`)
    }
}