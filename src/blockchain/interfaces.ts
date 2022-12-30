/**
 * IBlockData carries the information on a scanned and extracted from a block
 */
export interface IBlockData {
    /**
     * The name of the Blockchain that the block was created in, e.g. ETH, BSC ..
     */
    provider: string;

    /**
     * The height of the block that was scanned 
     */
    height: number;

    /**
     * Time the block was created
     */
    timestamp?: string;

    /**
     * collection of all minted erc721 transaction that was included in the block
     */
    erc721: ERC721[];
}

/**
 * This is the ERC721 Data retrieved from each appliabale transactions in a block
 */
export interface ERC721 {
    /**
     * The contract address of the ERC721 
     */
    contractAddress: string;

    /**
     * Token ID of the NFT
     */
    tokenId: number;

    /**
     * Address of the owner of the NFT after the mint
     */
    ownerAddress?: string;
}

/**
 * Interface for all Providers to Implement to enable them to scan and extract info from thier blocks
 */
export interface IBlockchainExtractor {
    /**
     * Get the latest block of the providers blockchain
     */
    getLatestBlock(): Promise<number>;

    /**
     * this function is to take a block number, go through it and get all the NFT(ERC721) token in the block
     * and return them along side some extra infos of the block
     * @param blocknumber 
     */
    extract(blocknumber: number): Promise<IBlockData>;
}