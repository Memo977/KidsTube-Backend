const mongoose = require('mongoose');
const connectDatabase = async () => {
  try {
    console.log('Connecting to MongoDB:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Terminar el proceso con error en caso de fallo crítico
    process.exit(1);
  }
};

module.exports = connectDatabase;