const axios = require('axios');

/**
 * Dedicated Backend Service for MongoDB Atlas Data API / App Services.
 * Reads MONGODB_API_KEY securely from environment variables.
 * Kept strictly backend-only; never exposed to React or the client.
 */
class MongoApiService {
  constructor() {
    this.apiKey = process.env.MONGODB_API_KEY || '';
    this.baseUrl = process.env.MONGODB_DATA_API_ENDPOINT || '';
    this.dataSource = process.env.MONGODB_DATA_SOURCE || 'Cluster0';
    this.database = process.env.MONGODB_DATABASE || 'cyberai';
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'api-key': process.env.MONGODB_API_KEY || ''
    };
  }

  isConfigured() {
    return Boolean(process.env.MONGODB_API_KEY && process.env.MONGODB_DATA_API_ENDPOINT);
  }

  async find(collection, filter = {}, limit = 50) {
    if (!this.isConfigured()) {
      return null;
    }
    try {
      const response = await axios.post(
        `${this.baseUrl}/action/find`,
        {
          dataSource: this.dataSource,
          database: this.database,
          collection,
          filter,
          limit
        },
        { headers: this.getHeaders(), timeout: 5000 }
      );
      return response.data?.documents || [];
    } catch (err) {
      console.warn(`[Mongo API Service] Atlas Data API query failed: ${err.message}`);
      return null;
    }
  }

  async findOne(collection, filter = {}) {
    if (!this.isConfigured()) {
      return null;
    }
    try {
      const response = await axios.post(
        `${this.baseUrl}/action/findOne`,
        {
          dataSource: this.dataSource,
          database: this.database,
          collection,
          filter
        },
        { headers: this.getHeaders(), timeout: 5000 }
      );
      return response.data?.document || null;
    } catch (err) {
      console.warn(`[Mongo API Service] Atlas Data API findOne failed: ${err.message}`);
      return null;
    }
  }

  async insertOne(collection, document) {
    if (!this.isConfigured()) {
      return null;
    }
    try {
      const response = await axios.post(
        `${this.baseUrl}/action/insertOne`,
        {
          dataSource: this.dataSource,
          database: this.database,
          collection,
          document
        },
        { headers: this.getHeaders(), timeout: 5000 }
      );
      return response.data?.insertedId || null;
    } catch (err) {
      console.warn(`[Mongo API Service] Atlas Data API insertOne failed: ${err.message}`);
      return null;
    }
  }

  async insertMany(collection, documents) {
    if (!this.isConfigured()) {
      return null;
    }
    try {
      const response = await axios.post(
        `${this.baseUrl}/action/insertMany`,
        {
          dataSource: this.dataSource,
          database: this.database,
          collection,
          documents
        },
        { headers: this.getHeaders(), timeout: 5000 }
      );
      return response.data?.insertedIds || [];
    } catch (err) {
      console.warn(`[Mongo API Service] Atlas Data API insertMany failed: ${err.message}`);
      return null;
    }
  }
}

module.exports = new MongoApiService();
