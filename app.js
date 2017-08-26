var config = require('./config.json');
var login = require('facebook-chat-api');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('Standings');

var authcode = newauthcode();

login({email: config.user , password: config.pass}, function callback (err, api) {
   if(err) return console.error(err);
   api.setOptions({listenEvents: true});
   api.listen((err, message) => {
	   if(err)
		   console.error(err);
	   if(message && message.body){
		var b = message.body;
		var argi = b.indexOf(' ');
		//protected functions
		if(argi != -1){
			var sarr = b.split(" ");
			var param = (parseInt(sarr[1])); 
			if(param === authcode){
				if(sarr[0] === '/shutdown'){
					api.sendMessage('Commencing shutdown.', message.threadID);
					db.close();
					api.logout(0);
				}
				else if(sarr[0] === '/bobby')
				{
					var z = parseInt(sarr[2]);
					var zz = '';
					for(var i = 0; i< z; i++)
						zz += '💩';
					api.sendMessage(zz, message.threadID);
				}
				/*
				else if(cmd === '/clear-all'){
					db.serialize(function () {
						db.run('DELETE FROM Score');
						db.run('DELETE FROM Person');
					});
					api.sendMessage('Records cleared.', message.threadID);
				}*/
				newauthcode();
			}
		}
		if(b === '/genauthcode'){
			newauthcode();
			console.error('AUTHCODE: ' + authcode);
			api.sendMessage('Authcode generated.', message.threadID);
		}
		else if(b === '/detail' || b === '/detall'){
			db.all('SELECT nickname, rank, count(*) AS n FROM Person, Score WHERE rank <4 AND Person.actor_id = Score.actor_id AND Score.actor_id = ? AND thread_id = ? GROUP BY rank ORDER BY rank ASC',message.senderID,message.threadID,
			function (err, rows) {
				if(err)
					console.error(err);
				if(rows.length == 0){
					api.sendMessage("You have no medals.", message.threadID);
					return;
				}
				var str = rows[0].nickname + '\'s Medals:\n';
				for(var i = 0; i< rows.length; i++){
					str += ('Rank '+ rows[i].rank +': ' + rows[i].n + '\n');
				}
				api.sendMessage(str, message.threadID); 
			});
		}
		else if(b === '/moredetail'){
			db.all('SELECT nickname, rank, game FROM Person, Score WHERE rank <4 AND Person.actor_id = Score.actor_id AND Score.actor_id = ? AND thread_id = ? ORDER BY rank ASC', message.senderID, message.threadID,
			function (err, rows) {
				if(err)
					console.error(err);
				if(rows.length == 0){
					api.sendMessage("You have no medals.", message.threadID);
					return;
				}
				var str = rows[0].nickname + '\'s Medals:\n';
				for(var i = 0; i< rows.length; i++){
					str += (rows[i].game +': ' + rows[i].rank + '\n');
				}
				api.sendMessage(str, message.threadID);
			});
		}
		else if(b === '/standings'){
			db.all('SELECT nickname, s.cuml AS cuml FROM Person AS p,\
			(SELECT actor_id, SUM(4-rank) AS cuml FROM Score WHERE rank <4 AND thread_id = ? GROUP BY actor_id) AS s\
			WHERE p.actor_id = s.actor_id ORDER BY cuml DESC', message.threadID,
			function (err, rows) {
				if(err)
					console.error(err);
				if(rows.length == 0) {
					api.sendMessage("Play games to update your standings!", message.threadID);
					return;
				}
				var str = '';
				var mlen = 0;
				for(var i = 0; i< rows.length; i++){
					if(mlen<rows[i].nickname.length)
						mlen = rows[i].nickname.length;
				}
				var lcum = -1;
				var li = 0;
				for(var i=0; i< rows.length; i++){
					if(lcum == rows[i].cuml)
						str += (li+1) + ': ' + rows[i].nickname;
					else
						str += (i+1) + ': ' + rows[i].nickname;
					
					for(var j = rows[i].nickname.length; j< mlen; j++)
						str+="  ";
					
					str += '\t- ' + rows[i].cuml + '\n';
					if(!(lcum == rows[i].cuml))
						li=i;
					lcum = rows[i].cuml;
				}
				api.sendMessage(str, message.threadID); 
			});
		}
		else if(b === '/help'){
			api.sendMessage('/standings - print list of overall scores\n/detail - get your numbers of medals\n/moredetail - get list of all games you have a medal in',message.threadID);
		}
	}
	else if(message && message.type === 'game'){
		if(message.leaderboard_moment === 'leaderboard_1st'){
			api.sendMessage({emoji: '🏆', emojiSize: 'large'},message.threadID);
		}
		db.serialize(function () {
			var ml = message.leaderboard;
			var lscore = "";
			var lrank = 0;
			for (var i in ml) {
				if (ml.hasOwnProperty(i)) 
				{
					if(lscore === ml[i].score_str)
						db.run('REPLACE INTO Score VALUES (?,?,?,?)',message.threadID,ml[i].id,lrank,message.game);
					else
						db.run('REPLACE INTO Score VALUES (?,?,?,?)',message.threadID,ml[i].id,ml[i].rank,message.game);
					db.run('REPLACE INTO Person VALUES (?,?)',ml[i].name,ml[i].id);
					if(!(lscore === ml[i].score_str))
						lrank = ml[i].rank;
					lscore = ml[i].score_str;
				}
			}
		
			if(message.leaderboard_moment === 'personal_best' || message.leaderboard_moment === 'leaderboard_moveup'){
				if(message.game === "Smiley Cubes")
					api.sendMessage('It is a game\nPlayed by an idiot, full of sound and fury\nSignifying nothing.',message.threadID);
				db.get("SELECT * FROM Score WHERE game = '" + message.game + "' AND actor_id = ? AND rank < 4",message.actor_id,function(err,row){
					if(err)
						console.error(err);
					if(row){
						api.sendMessage({emoji: '🏆', emojiSize: 'small'},message.threadID);
						console.error(row);
					}
				});
			}
		});
	}
    });
});

function newauthcode()
{
	authcode = Math.floor(Math.random() * 10000);
}
