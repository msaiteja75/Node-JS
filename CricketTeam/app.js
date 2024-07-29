const express=  require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3')
const path = require('path');
const {open} = require('sqlite')
const app = express();
app.use(express.json());

// Initalizing Server and SQLITE 

const db_path = path.join(__dirname, 'cricketTeam.db');

const ServerAndDB= async ()=>{
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

// API-1
app.get('/players/', async (request, response)=>{
    const query = `SELECT * FROM cricket_team `;

    const result =  await db.all(query);
    response.send(result);
})

// API-2
app.post('/players/', async (request, response)=>{
    const {playerName, jerseyNumber, role} = request.body;
    const query = `INSERT INTO cricket_team (player_name, jersey_number, role) values(?,?,?)`;
    const result = await db.run(query,[playerName, jerseyNumber, role]);
    response.send('Player Added to Team');
})

// API-3
app.get('/players/:playerId', async (request, response)=>{
    const {playerId} = request.params;
    const query = 'SELECT * FROM cricket_team WHERE player_id = ?';
    const result = await db.get(query,[playerId]);
    response.send(result);
})

// API-4
app.put('/players/:playerId/', async  (request, response)=>{
    const {playerId} = request.params;
    const {playerName, jerseyNumber, role} = request.body;

    const query = `UPDATE cricket_team SET player_name =?, jersey_number = ?, role =? WHERE player_id = ?`;
    const result = await db.run(query, [playerName, jerseyNumber, role, playerId]);
    response.send('Player Details Updated');
})

// API-5
app.delete('/players/:playerId/', async (request, response)=>{
    const {playerId} = request.params;
    const query = `DELETE FROM cricket_team WHERE player_id = ?`;
    const result = await db.run(query, [playerId]);

    response.send('Player Removed');
})