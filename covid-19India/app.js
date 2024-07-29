const express = require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const {open} = require('sqlite');
const path = require('path');
const app = express();
app.use(express.json())

const db_path = path.join(__dirname, 'covid19India.db');

const ServerStartAndDB = async () =>{
    try{
       db  = await  open({
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

ServerStartAndDB();

//API-1
app.get('/states/', async (request, response)=>{
    const query = `SELECT * FROM state `;
    const result = await db.all(query);
    response.send(result);
})

// API-2
app.get('/states/:stateId/', async (request, response)=>{
    const {stateId} = request.params;
    const query = `SELECT * FROM state WHERE state_id = ?`;
    const result = await db.get(query, [stateId]);
    response.send(result);
})

// API-3
app.post('/districts/', async (request, response)=>{
      const {districtName, stateId, cases, cured, active, deaths}= request.body;

      const query = `INSERT INTO district (district_name, state_id, cases, cured, active, deaths) values (?,?,?,?,?,?)`;
      const result = await db.run(query, [districtName, stateId,cases, cured,active,deaths]);
      response.send('District Successfully Added');
})

// API-4
app.get('/districts/:districtId/', async  (request, response)=>{
    const {districtId} = request.params;
    const query =  `SELECT * FROM district WHERE district_id = ?`;
    const result = await db.get(query, [districtId]);
    response.send(result);
})

// API-5

app.delete('/districts/:districtId/',  async (request, response)=>{
    const {districtId} = request.params;
    const query =`DELETE FROM district WHERE district_id = ?`;
    const result = await db.run(query, [districtId]);
    response.send('District Removed');
})

// API-6
app.put('/districts/:districtId/', async (request, response)=>{
    const {districtId} = request.params;
    const {districtName, stateId, cases,cured, active, deaths} = request.body;
    const query  = `UPDATE district SET district_name = ?, state_id = ?, cases = ?, cured =?, active=? ,
    deaths=? WHERE district_id =?`;
    const result = await db.run(query,[districtName,stateId,cases,cured,active,deaths, districtId])
    response.send('District Details Updated');
})
// API-7
app.get('/states/:stateId/stats/', async (request,response)=>{
    const {stateId} = request.params;
    const Cases  = `SELECT sum(cases) as totalCases FROM district where state_id = ?`;
    const Cured = `SELECT  sum(cured) as totalCured FROM district WHERE state_id =?`;
    const Active  = `SELECT sum(active) as totalActive FROM district WHERE state_id =?`;
    const Deaths = `SELECT sum(deaths) as totalDeaths FROM district WHERE state_id =?`;

    const totalCases = await db.all(Cases, [stateId]);
    const totalCured = await db.all(Cured, [stateId]);
    const totalActive = await db.all(Active, [stateId]);
    const totalDeaths  =await db.all(Deaths, [stateId]);

   const stats = {
    "totalCases":totalCases[0].totalCases,
    "totalCured":totalCured[0].totalCured,
    "totalActive":totalActive[0].totalActive,
    "totalDeaths":totalDeaths[0].totalDeaths
   }
   response.send(stats);

})
// API-8
app.get('/districts/:districtId/details', async (request,response)=>{
    const {districtId} = request.params;
    const query  = `SELECT state_name as StateName from state left join district on state.state_id = district.state_id where district_id = ?`;
    const result = await db.get(query, [districtId]);
    response.send(result);

})