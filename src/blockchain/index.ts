import { BSC } from "./eth-like/bsc/bsc";

/**
 * this map is to store all the provider/blockchains logics.
 */
const blockchains : Map<any, any> = new Map<any, any>([]);

/**
 * USAGE
 * import { IBlockchainExtractorExample } from './path-to-provider-file';
 * 
 * blockchains.set(``BlockchainName``, ``IBlockchainExtractorExample``)
 */

blockchains.set(BSC.blockchainName, BSC)


export default blockchains;