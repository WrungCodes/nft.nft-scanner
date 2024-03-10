import { ERC721, IBlockData, IBlockchainExtractor } from "../interfaces";
import BigNumber from 'bignumber.js';

/**
 * Extra Blockchain features for etherium like blockchains
 */
export interface EthLikeFeatures {

    /**
     * The name given or attached to the found ERC721 like token BSC its BEP20
     */
    erc721ProviderName?: string;

    /**
     * The name of the native currency name e.g ETH, BNB ...
     */
    nativeProviderName: string;

    /**
     * Representation of a zero address
     */
    zeroAddress: string

    /**
     * The list of likely events for a mint operation on the eth like blockchain e.g. 'Mint(uint256)'
     */
    eventSignatures: any[]
}

export abstract class EthLike implements IBlockchainExtractor {
    /**
     * Provider is the blockchain provider of the ETH blockchain like e.g ETH, BSC
     */
    abstract provider: string;

    /**
     * the blocktime of the blockchain in seconds
     */
    abstract blockTime: number;

    /**
     * Web3 Package. e.g require('web3') 
     */
    protected web3: any;

    /**
     * web3 instance loaded with uri
     */
    protected api: any;

    features: EthLikeFeatures = {
        erc721ProviderName: 'ERC20',
        nativeProviderName: 'ETH',
        eventSignatures: [ 'Transfer(address,address,uint256)' ],
        zeroAddress: '0x0000000000000000000000000000000000000000000000000000000000000000'
    };

    async getLatestBlock(): Promise<number> {
        return this.api.eth.getBlockNumber();
    }

    async extract(blocknumber: number): Promise<IBlockData> {
        const erc721: ERC721[] = [];

        /**
         * Ge Full BlockData for eth like Blockchain
         */
        const block: IBlockETHLike = await this.api.eth.getBlock(new BigNumber(blocknumber), true)

        /**
         * Receipts of the transaction
         */
        const txData: any[] = [];

        if (block.transactions && block.transactions.length) {

            for( const trans of block.transactions ) 
            {
                const receipt = await this.api.eth.getTransactionReceipt(trans.hash)
                txData.push([trans.hash, receipt])
            }

            for (const [hash, receipt] of txData) 
            {
                // see if any smart contract execution and it's results
                for (const log of receipt.logs) 
                {

                    if(
                        /**
                         * All ERC721 Token Mint are events with Transfer Signature so, the first topics must be the Transfer Signature.
                         */
                        log.topics[0] === this.features.eventSignatures[0]

                        /**
                         * All ERC721 Token Mint have 4 topics, unlike for example erc20 token transfer with just 3 topics
                         */
                        && log.topics.length === 4 

                        /**
                         * Since ERC721 token mint is just transfer from a zero address to another, the second topic which is the from 
                         * address needs to be a zero address
                         */
                        && log.topics[1] === this.features.zeroAddress
                    )
                        {
                            erc721.push({
                                contractAddress: log.address,
                                ownerAddress: this.api.eth.abi.decodeParameter('address', log.topics[2]).toLowerCase(),
                                tokenId: this.api.eth.abi.decodeParameter('uint256', log.topics[3])
                            })
                    }
                }
            }
        }

        const blockData: IBlockData = {
            provider: this.provider,
            height: blocknumber,
            erc721,
            timestamp: block.timestamp.toString()
        }

        return blockData;
    }
}

export interface IBlockETHLike {
    number: number;
    hash: string;
    parentHash: string;
    nonce: number;
    sha3Uncles: string;
    logsBloom: string;
    transactionRoot: string;
    stateRoot: string;
    miner: string;
    difficulty: string;
    totalDifficulty: string;
    extraData: string;
    size: number;
    gasLimit: number;
    gasUsed: number;
    timestamp: number;
    transactions: ITransactionETHLike[];
    uncles: string[];
}

export interface ITransactionETHLike {
    hash: string;
    nonce: number;
    blockHash: string;
    blockNumber: number;
    transactionIndex: number;
    from: string;
    to: string;
    value: string;
    gasPrice: string;
    gas: number;
    input: string;
}

export interface IReceiptETHLike {
    status: boolean;
    blockHash: string;
    blockNumber: number;
    transactionHash: string;
    transactionIndex: number;
    from: string;
    to: string;
    contractAddress: string;
    cumulativeGasUsed: number;
    gasUsed: number;
    logs: ILogETHLike[];
}

export interface ILogETHLike {
    address: string;
    data: string;
    topics: string[];
    logIndex: number;
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    blockNumber: number;
}