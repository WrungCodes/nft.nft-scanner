import { ETH } from "./eth";

describe('ETH provider test', () => {

    const provider = new ETH({ uri: 'https://mainnet.infura.io/v3/3fa92291caad4246a60fdc03ec444a57' });


    test('can get latest block number', async () => {

        const height = await provider.getLatestBlock();
        expect(typeof height).toBe('number');
        expect(height).toBeGreaterThan(0);

    }, 180_000);


    test('can extract block info from a block', async () => {

        const blockdata = await provider.extract(16270003);

        expect(typeof blockdata).toBe('object')
        expect(typeof blockdata.provider).toBe('string')
        expect(typeof blockdata.height).toBe('number')

        expect(blockdata.provider).toBe('ETH')
        expect(blockdata.height).toBe(16270003)
    }, 180_000);
})