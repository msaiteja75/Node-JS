const express= require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const {open} = sqlite;
const path  = require('path');
const app = express();
app.use(express.json());

const db_path = path.join(__dirname, 'cricketMatchDetails.db');

const  ServerAndDB= async () =>{
   try{
    db = await open({
        filename:db_path,
        driver:sqlite3.Database,
    })

    app.listen(5001, ()=>{
        console.log('Server is running on port 5001 http://localhost:5001/');

    })
   }catch(error){
    console.log(error.message);
   }

}

ServerAndDB();

// API -1
app.get('/players/',async (request, response)=>{
    const query = `SELECT * FROM player_details`;
    const result = await db.all(query);
    response.send(result);
})

// API-2

app.get('/players/:playerId/', async (request, response)=>{
    const {playerId} = request.params;
    const query = `SELECT * FROM player_details WHERE player_id  = ?`;
    const result  = await db.get(query, [playerId]);
    response.send(result);

})

// API-3
app.put('/players/:playerId/', async  (request, response)=>{
    const {playerId} = request.params;
    const {playerName} = request.body;

    const query = 'UPDATE player_details SET player_name = ? WHERE player_id =?';
    const result = await db.run(query, [playerName, playerId]);
    response.send('Player Details Updated');
})

// API-4

app.get('/matches/:matchId/', async (request, response)=>{
    const {matchId} = request.params;
    const query = `SELECT * FROM match_details WHERE match_id =?`;
    const result = await db.get(query,[matchId]);
    response.send(result);
})

// API-5
app.get('/players/:playerId/matches/', async (request, response)=>{
    const {playerId} = request.params;
    const query = `SELECT match_details.match_id, match_details.match, match_details.year FROM match_details left join  player_match_score
    ON match_details.match_id = player_match_score.match_id WHERE player_match_score.player_id = ?`;
    const result = await db.all(query, [playerId]);
    response.send(result);
})

// API-6

app.get('/matches/:matchId/players/', async (request, response)=>{
    const {matchId}= request.params;
    const query = `SELECT player_details.player_id as PlayerId, player_details.player_name as PlayerName from player_details left join player_match_score on player_details.player_id = player_match_score.player_id  WHERE match_id = ?`;
    const result = await db.all(query, [matchId]);
    response.send(result)
})

// API-7
app.get('/players/:playerId/playerScores/', async (request, response)=>{
    const {playerId} = request.params;
    const query = `SELECT player_details.player_id as playerId , player_details.player_name as playerName, sum(player_match_score.score) as totalScore,
    sum(player_match_score.fours ) as totalFours, sum(player_match_score.sixes) as totalSixes  from player_details left
    join player_match_score on player_details.player_id = player_match_score.player_id WHERE player_match_score.player_id =?;
    `
    const result = await db.get(query, [playerId]);
    response.send(result);
})