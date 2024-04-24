import { BSC } from "./eth-like/bsc/bsc";
import { ETH } from "./eth-like/eth/eth";
import { SOL } from "./solana/sol";

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
blockchains.set(ETH.blockchainName, ETH)
blockchains.set(SOL.blockchainName, SOL)

export default blockchains;