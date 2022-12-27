import mongoose from 'mongoose';

/**
 * BlockchainAttrs: interface to create new BlockchainModel Document
 */
interface BlockchainAttrs {
    /**
     * The name of the blockchain e.g. Bitcoin
     */
    name: string,

    /**
     * The symbol (Short form) representing the blockchain e.g. BTC
     */
    symbol: string,

    /**
     * The time (in seconds) this blockchain uses to create a new block (for example bitcoin uses 10 minutes)
     */
    blocktime: number,

    /**
     * variable to confirm if the blockchain is enabled or disabled
     */
    enabled: boolean,

    /**
     * number of the last block processed.
     */
    processedBlock: number,

    /**
     * This is to know if the blockchain can be adpated concurrenntly, i.e if multiple blocks can be processeed at a time or not
     */
    adaptConcurrently: number,

    /**
     * the options of the blockchain, this would be passed as contructor params
     */
    options: any
}

interface BlockchainModel extends mongoose.Model<BlockchainDoc> {
    build(attrs: BlockchainAttrs): BlockchainDoc;
}

export interface BlockchainDoc extends mongoose.Document {
    name: string,
    symbol: string,
    blocktime: number,
    enabled: boolean,
    processedBlock: number,
    adaptConcurrently: number,
    options: any
}

const blockchainSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        symbol: {
            type: String,
            required: true
        },
        blocktime: {
            type: Number,
            required: true,
        },
        enabled: {
            type: Boolean,
            default: false
        },
        processedBlock: {
            type: Number,
            required: true,
        },
        adaptConcurrently: {
            type: Number,
            required: true,
        },
        options: {
            type: Object,
            required: true,
        }
    },
    {
      toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
      }
    }
);

blockchainSchema.statics.build = (attrs: BlockchainAttrs) => {
    return new Blockchain(attrs);
};
  
const Blockchain = mongoose.model<BlockchainDoc, BlockchainModel>('Blockchain', blockchainSchema);
  
export { Blockchain };