import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.DATABASE_URL;
const options: MongoClientOptions = {
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000, // Important for fast failure detection
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  console.error('❌ MONGODB_ERROR: DATABASE_URL is missing in .env.local');
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    console.log('🔌 MONGODB_LOG: Initializing new connection pool...');
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .then((client) => {
        console.log('✅ MONGODB_LOG: Connected to MongoDB successfully.');
        return client;
      })
      .catch((err) => {
        console.error('❌ MONGODB_ERROR: Connection failed!', err.message);
        if (err.message.includes('IP address')) {
          console.error('👉 ACTION REQUIRED: Ensure your current IP is whitelisted in MongoDB Atlas.');
        }
        throw err;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb() {
  try {
    const client = await clientPromise;
    return client.db();
  } catch (err) {
    console.error('❌ MONGODB_ERROR: getDb() failed because the client failed to connect.');
    throw err;
  }
}
