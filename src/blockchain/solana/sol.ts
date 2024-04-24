import { ERC721, IBlockData, IBlockchainExtractor } from "../interfaces";
import { Connection, PublicKey, clusterApiUrl, ParsedTransaction, TransactionInstruction, ParsedInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

export class SOL implements IBlockchainExtractor {
    static blockchainName = 'SOL';
    
    provider: string = 'SOL';
    blockTime: number = 3;
    connection: Connection;

    constructor( options: { uri: string } ) 
    { 
        this.connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    }

    async getLatestBlock(): Promise<number> {
        const block = await this.connection.getSlot()
        console.log(await this.connection.getEpochInfo())
        return block;
    }

    async extract(blocknumber: number): Promise<IBlockData> {
        const block = await this.connection.getBlock(blocknumber, { 
            commitment: "confirmed", 
            maxSupportedTransactionVersion: 0, 
            transactionDetails: "full" 
        });
       
        const erc721: ERC721[] = [];
        if(!block){
            return {
                provider: this.provider,
                height: blocknumber,
                erc721
            }
        }

        for (const tx of block.transactions) {
            const transactions = await this.connection.getParsedTransactions(tx.transaction.signatures, { maxSupportedTransactionVersion: 0 })

            for(const transaction of transactions){
                if(!transaction) continue;
                const tokenInstructions = transaction.transaction.message.instructions.filter(i => 
                    i.programId === TOKEN_PROGRAM_ID
                );

                for (const inst of tokenInstructions) {
                    const parsed = (inst as ParsedInstruction).parsed;

                    const meta = transaction.meta
                    if(!meta) continue;

                    const involvedTokenBalances = meta.postTokenBalances?.filter(t => t.mint === parsed.info.mint && t.uiTokenAmount.decimals === 0);

                    if (!involvedTokenBalances || involvedTokenBalances.length === 0) continue; // Skip if no token balance with 0 decimals is involved
        
                    for (const tokenBalance of involvedTokenBalances) {
                        erc721.push({
                            contractAddress: TOKEN_PROGRAM_ID.toString(),
                            ownerAddress: tokenBalance.owner,
                            tokenId: parsed.mint
                        });
                    }

                    // if(parsed.type === 'mintTo' && parsed.info.amount === "1"){
                    //     erc721.push({
                    //         contractAddress: TOKEN_PROGRAM_ID.toString(),
                    //         ownerAddress: parsed.destination,
                    //         tokenId: parsed.mint
                    //     });
                    // }
                }
            }
        }

        return {
            provider: this.provider,
            height: blocknumber,
            timestamp: (block.blockTime as number).toString(),
            erc721
        }
    }
}

// switch (parsed.type) {
//     case 'mintTo':
//         if (parsed.info.amount === "1") { // Typical for NFTs
//             erc721.push({ type: 'Mint', details: parsed.info, mint: parsed.info.mint });
//         }
//         break;
//     case 'transfer':
//         if (parsed.info.amount === "1") { // Typical for NFTs
//             erc721.push({ type: 'Transfer', details: parsed.info, mint: parsed.info.mint });
//         }
//         break;
