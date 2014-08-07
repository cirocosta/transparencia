var Transparencia = require('../src/transparencia');
var transparencia = new Transparencia('BbWsKvvRTw4k');

transparencia.candidatos({estado: 'SP', cargo: 3}).get().then(function (results) {
  console.log(results);
}, function (err) {
  console.error(err);
});


