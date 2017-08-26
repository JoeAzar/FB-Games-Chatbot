var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('Standings');

db.serialize(function(){
                        db.run('DELETE FROM Score WHERE actor_ID = 1028062326');
});
