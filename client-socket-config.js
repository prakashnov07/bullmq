// Client-side Socket.IO configuration for production
// Use this in your frontend application

const socketConfig = {
  transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
  upgrade: true,
  rememberUpgrade: true,
  timeout: 20000,
  forceNew: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  maxReconnectionAttempts: 5,
  // Add auth if needed
  // auth: {
  //   token: 'your-auth-token'
  // }
};

// Production connection
const socket = io(process.env.REACT_APP_SERVER_URL || 'https://yourdomain.com', socketConfig);

// Connection event handlers
socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  
  // Specific error handling
  if (error.message === 'xhr post error') {
    console.log('🔄 Retrying with polling transport only...');
    socket.io.opts.transports = ['polling'];
  }
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
  
  if (reason === 'io server disconnect') {
    // Server disconnected, reconnect manually
    socket.connect();
  }
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('❌ Reconnection error:', error.message);
});

export default socket;