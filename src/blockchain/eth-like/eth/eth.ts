import { EthLike, EthLikeFeatures } from "../eth-like";
import Web3 from 'web3';

export class ETH extends EthLike {
    static blockchainName = 'ETH';
    
    provider: string = 'ETH';

    blockTime: number = 3;

    features: EthLikeFeatures = {
        nativeProviderName: 'ETH',
        erc721ProviderName: 'ERC721',
        zeroAddress: '0x0000000000000000000000000000000000000000000000000000000000000000',
        eventSignatures: [ Web3.utils.sha3('Transfer(address,address,uint256)') ]
    };

    constructor( options: { uri: string } ) 
    { 
        super();
        this.web3 =  Web3;
        this.api = new this.web3(options.uri);
        this.api.utils.hexToNumber = (value:any) => {
            if (!value) {
                return value;
            }
            try {
                return  parseInt(value, 16);
            } catch (e) {
                return  value.toString();
            }
        };
    }
}