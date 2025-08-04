// FIXED SERVER STARTUP - RAILWAY COMPATIBLE

// Start server immediately for Railway
const startServer = async () => {
  console.log('🚀 Starting Geography Hub server...');
  console.log('📍 Node.js version:', process.version);
  console.log('📍 Environment:', process.env.NODE_ENV || 'development');
  
  // START SERVER FIRST - this is crucial for Railway
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Railway URL: https://world-geography-production.up.railway.app`);
    console.log(`🔗 Health check: https://world-geography-production.up.railway.app/health`);
    console.log(`🎯 AI Geography Hub: https://world-geography-production.up.railway.app/ai-geography-hub`);
    console.log(`📚 Browse lessons: https://world-geography-production.up.railway.app/browse`);
    
    // Initialize database AFTER server starts accepting connections
    initializeServices();
  });
  
  // Handle server errors
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
    }
  });
  
  return server;
};

startServer();

// Graceful shutdown handling for Railway
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
