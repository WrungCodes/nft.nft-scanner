import { BSC } from "./bsc";

describe('BSC provider test', () => {

    const provider = new BSC({ uri: 'https://bsc-dataseed1.binance.org' });


    test('can get latest block number', async () => {

        const height = await provider.getLatestBlock();
        expect(typeof height).toBe('number');
        expect(height).toBeGreaterThan(0);

    }, 180_000);


    test('can extract block info from a block', async () => {

        const blockdata = await provider.extract(24288021);

        expect(typeof blockdata).toBe('object')
        expect(typeof blockdata.provider).toBe('string')
        expect(typeof blockdata.height).toBe('number')

        expect(blockdata.provider).toBe('BSC')
        expect(blockdata.height).toBe(24288021)

    }, 180_000);
})