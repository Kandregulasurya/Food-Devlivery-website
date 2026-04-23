import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns/promises';

async function main() {
  console.log('Node version:', process.version);
  console.log('OpenSSL version:', process.versions.openssl);

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set in environment');
    process.exit(1);
  }

  console.log('MONGO_URI set (hidden):', uri.replace(/:\/\/([^@]+)@/, '://<user>:<pwd>@'));

  // If SRV, try DNS SRV resolve
  try {
    const m = uri.match(/mongodb\+srv:\/\/([^/]+)/);
    if (m) {
      const host = m[1];
      console.log('Detected SRV host:', host);
      try {
        const srv = await dns.resolveSrv(`_mongodb._tcp.${host}`);
        console.log('SRV records:', srv);
      } catch (e) {
        console.error('SRV resolution failed:', e && e.message);
      }
    }
  } catch (e) {
    console.error('Error parsing URI for SRV test:', e && e.message);
  }

  // Try connecting with mongoose and print full error
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('Mongoose connected successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Mongoose connection error:');
    console.error(err);
    if (err && err.reason) {
      console.error('\nConnection reason:');
      console.error(err.reason);
    }
    process.exit(1);
  }
}

main();
