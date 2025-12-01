// Non-blocking socket emission
const emitResult = (io, socketId, data, result) => {
    setImmediate(() => {
        if (socketId) {
            io.to(socketId).emit(result, data);
        } else {
            io.emit(result, data);
        }
    });
};

module.exports = emitResult;