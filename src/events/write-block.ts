import Bull from "bull";
import { Blockchain } from "../models/blockchain";
import { IBlockData } from "../blockchain/interfaces";

export const writeBlock = async ( job: Bull.Job<IBlockData>, uploadAssetQueue: Bull.Queue<IBlockData> ) => {
    try {
        const bc = await Blockchain.findOne({ enabled: true, symbol: job.data.provider });

        if(bc == null) { throw new Error('invalid blockchain') }

        if(job.data.height != bc.processedBlock + 1){
            throw new Error("Block out of order");
        }

        bc.processedBlock = job.data.height
        bc.save()

        uploadAssetQueue.add(job.data, {  attempts: Infinity, backoff: 5000 })

    } catch (err) {
        throw new Error(`Error ${err}`)
    }
}
