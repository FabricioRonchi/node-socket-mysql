var mysql = require('mysql'),
    db  = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password : 'root',
      database: 'arduino'
    })

var io = require('socket.io').listen(3000)

db.connect(function(err){
  if (err) console.log(err)
})

var notes = [];
var isInitNotes = false;
var socketCount = 0;

io.sockets.on('connection', function(socket){
  socketCount++
  io.sockets.emit('users connected', socketCount)

  socket.on('disconnect', function() {
    socketCount--
    io.sockets.emit('users connected', socketCount)
  })

  socket.on('new note', function(data){
    notes.push(data)
    io.sockets.emit('new note', data)
    db.query('INSERT INTO notes (note) VALUES (?)', data.note)
  })

  if (!isInitNotes) {
    db.query('SELECT * FROM notes').on('result', function(data){
      notes.push(data)
    }).on('end', function(){
      socket.emit('initial notes', notes)
    })
    isInitNotes = true
  } else {
    socket.emit('initial notes', notes)
  }

});