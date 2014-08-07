var Transparencia = require('../src/transparencia');
var transparencia = new Transparencia('TOKEN');

transparencia.candidatos({estado: 'SP', cargo: 3}).get().then(function (results) {
  console.log(results);
}, function (err) {
  console.error(err);
});


