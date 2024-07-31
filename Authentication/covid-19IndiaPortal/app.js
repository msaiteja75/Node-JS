const express = require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const {open} = require('sqlite');
const app = express();
app.use(express.json());
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const db_path = path.join(__dirname, 'covid19IndiaPortal.db');

let db;
const ServerStartAndInitalization = async () =>{
  try{
   db=  await open({
        filename:db_path,
        driver:sqlite3.Database,
    })
    app.listen(5001, ()=>{
        console.log('Server is running on port 5001 http://localhost:5001/')
    })
  }catch(error){
    console.log(error.message);
  }
}

ServerStartAndInitalization();
// Middleware to check accesstoken
const AuthenticateToken = (request, response, next) => {
    const authHeaders = request.headers['authorization'];
let token;
    if(authHeaders ==undefined){
        response.status(401);
        response.send('INVALID ACCESS TOKEN')
    }else{
        token  = authHeaders.split(" ")[1]
        if(token==undefined){
            response.status(401)
            response.send('INVALID ACCESS TOKEN');
        }else(
            jwt.verify(token,"abcdefghi", (error, payload)=>{
                if(error){
                    response.status(error);
                    response.send('INVALID ACCESS TOKEN')
                }else{
                    request.username = payload.username;
                    next();
                }
            })
        )
    }

}

// Registering Users 
// FIRST REGISTER AND LOGIN YOU WILL GET ACCESS TOKEN AFTER YOU CAN ACCESS API's

app.post('/register/', async (request, response)=>{
    try{
        const {username, name, password, gender, location} = request.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO user (username, name, password, gender, location) values(?,?,?,?,?)`;
    const result = await db.run(query,[username, name, hashPassword, gender, location]);
    response.send('User created Successfully');
    }catch(error){
        console.log(error.message);
    }


})


// API-1 
app.post('/login/',  async (request, response)=>{
    const {username, password} = request.body;
    
    const UserGetquery =`SELECT * FROM user where username = ?`;
    const dbUser = await db.get(UserGetquery, [username]);
    console.log(dbUser.username);

    if(dbUser==undefined){
        response.status(401);
        response.send('Invalid user');

    }else{
        if(dbUser){
            const isPassMatch = await bcrypt.compare(password, dbUser.password)
            if(dbUser.username===username,isPassMatch===true){
                payload = {
                    username:username
                }
                const jwtToken = jwt.sign(payload, "abcdefghi");
                response.send({jwtToken});
            }
        }else{
            response.status(401)
            response.send('invalid Password');
        }
    }
    

})

// API-2
app.get('/states/',AuthenticateToken, async (request, response)=>{
    const {username} = request;
    const query = `SELECT * FROM state`;
    const result = await db.all(query);
    // console.log(`requested by user ${username}`);
    response.send(result);

})

// API-3

app.get('/states/:stateId', AuthenticateToken, async (request, response)=>{
    const {stateId} = request.params;
    const query = `SELECT * FROM state where state_id =?`;
    const result = await db.get(query, [stateId]);
    response.send(result);
 })

//  API-4

app.post('/districts/', AuthenticateToken, async (request, response)=>{
    const {districtName, stateId, cases, cured, active, deaths} = request.body;
    const query = `INSERT INTO district (district_name, state_id, cases, cured, active, deaths) values (?,?,?,?,?,?)`;
    const result = await db.run(query, [districtName, stateId, cases, cured, active, deaths]);
    response.send("District Successfully Added" );

})
// API-5
app.get('/districts/:districtId/',AuthenticateToken, async (request, response)=>{
    const {districtId} = request.params;
    const query = `SELECT * FROM district where district_id =?`;
    const result = await db.get(query,[districtId]);
    response.send(result);

})
// API-6
app.delete('/districts/:districtId/', AuthenticateToken, async (request, response)=>{
    const {districtId} = request.params;
    const query = `DELETE FROM district where district_id = ?`;
    const result = await db.run(query, [districtId]);
    response.send('District Removed');

})

// API-7
app.put('/districts/:districtId/', AuthenticateToken, async  (request, response)=>{
    const {districtId} = request.params;
    const {districtName, stateId, cases, cured, active, deaths} = request.body;
    const query = `UPDATE district SET district_name =?, state_id = ?, cases = ?, cured = ?, active=?, deaths =? WHERE district_id =?`;
    const result = await db.run (query,[districtName, stateId, cases, cured, active, deaths, districtId])
    response.send('District Details Updated');
})

app.get('/states/:stateId/stats/',  AuthenticateToken,async (request, response)=>{
    const {stateId} =  request.params;

    const Cases = `SELECT sum(cases) as cases from district  where state_id =?`;
    const Cured = `SELECT sum(cured) as cured from district where state_id =?`;
    const Active = `SELECT sum(active) as active from district where state_id =?`;
    const Deaths = `SELECT sum(deaths) as deaths from district where state_id =?`;

    const totalCases = await db.get(Cases, [stateId]);
    const totalCured = await db.get(Cured, [stateId]);
    const totalActive = await db.get(Active, [stateId]);
    const totalDeaths = await db.get(Deaths, [stateId]);
    
    stats = {
        totalCases:totalCases.cases,
        totalCured:totalCured.cured,
        totalActive:totalActive.active,
        totalDeaths:totalDeaths.deaths
    }
    response.send(stats);
})