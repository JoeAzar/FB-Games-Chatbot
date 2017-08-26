var config = require('./config.json');
var login = require('facebook-chat-api');


var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('Standings');

login({email: config.user , password: config.pass}, function callback (err, api) {
   if(err) return console.error(err);
   api.setOptions({listenEvents: true});
db.serialize(function(){
                        db.all('SELECT nickname, rank, game FROM Person, Score WHERE rank <4 AND Person.actor_id = Score.actor_id AND Score.actor_id = ? AND thread_id = ? ORDER BY rank ASC',10000211612287,1657265677623062,
                        function (err, rows) {
                                if(err)
                                        console.error(err);
                                if(rows.length == 0){
                                        api.sendMessage("You have no medals.", 1657265677623062);
                                        return;
                                }
                                var str = rows[0].nickname + '\'s Medals:\n';
                                for(var i = 0; i< rows.length; i++){
                                        str += (rows[i].game +': ' + rows[i].rank + '\n');
                                }
                                api.sendMessage(str, 1657265677623062);
                        });
});
});
