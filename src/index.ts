import mongoose from 'mongoose';

const start = async () => {
    /**
     * This key is for mongodb database
     */
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }

    /**
     * Here we try to connect to the mongodb database using the Key before procedding
     * This would save some errors from occuring, mostly errors due to Invalid Mongo Credentials
     * or Some Database unavalability
     */
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDb');
    } catch (err) {
        console.error(err);
    }
}

start();