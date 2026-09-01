import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dns from 'dns'

dotenv.config()

// Ensure robust SRV DNS resolution for Atlas clusters on Windows and cloud environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch {
  // Use system default if setServers is unavailable
}

let MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inkdabba-hub'

// If MongoDB Atlas URI lacks a database name before '?', default cleanly to /inkdabba-hub
if (MONGO_URI.includes('.mongodb.net/?')) {
  MONGO_URI = MONGO_URI.replace('.mongodb.net/?', '.mongodb.net/inkdabba-hub?')
} else if (MONGO_URI.endsWith('.mongodb.net') || MONGO_URI.endsWith('.mongodb.net/')) {
  MONGO_URI = MONGO_URI.replace(/\/?$/, '/inkdabba-hub')
}

export async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGO_URI)
    console.log(`[MongoDB] Connected successfully to ${conn.connection.host}/${conn.connection.name}`)
    return conn
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message)
    process.exit(1)
  }
}
