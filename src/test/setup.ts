import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongo: any;

beforeAll(async () => {
    /**
     * Initialize MongoDB Memory Server and save the instance so all tests can use it
     */
    mongo = new MongoMemoryServer();
    await mongo.start();
    const mongoUri = mongo.getUri();
    
    /**
     * Connect to MongoDB Memory Server
     */
    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    /**
     * Get and delete all data in the DB after each test is run
     */
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
});

afterAll(async () => {

    /**
     * Stop MongoDB Memory Server and close Mongoose after the tests
     */
    await mongoose.connection.close();
    await mongo.stop();
    
}, 180_000);
