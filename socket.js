const SocketIO = require('socket.io');

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: '/socket.io' });

  app.set('io', io);
  const user = io.of('/user');
  const chat = io.of('/chat');
  // [socket.io 3.0.4] No more implicit connection to the default namespace
  user.use((socket, next) => sessionMiddleware(socket.request, socket.request.res, next));

  user.on('connection', (socket) => {
    // console.log('user 네임스페이스에 연결');
    const { passport } = socket.request.session;
    if (passport && passport.user) socket.join(passport.user);
    socket.on('disconnect', () => {
      // console.log('user 네임스페이스 접속 해제');
      if (passport && passport.user) socket.leave(passport.user);
    });
  });

  chat.on('connection', (socket) => {
    // console.log('chat 네임스페이스에 연결');
    const {
      headers: { referer },
    } = socket.request;
    const roomId = +referer.split('/')[referer.split('/').length - 1].replace(/\?.+/, '');
    socket.join(roomId);
    socket.on('disconnect', () => {
      // console.log('chat 네임스페이스 접속 해제');
      socket.leave(roomId);
    });
  });
};
