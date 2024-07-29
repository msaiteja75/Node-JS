const express = require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const {open} = require('sqlite');
const app = express();
app.use(express.json());


const db_path = path.join(__dirname, 'moviesData.db');

const ServerAndDb = async  () => {
   try{
    db = await open({
        filename:db_path,
        driver:sqlite3.Database,
    })

    app.listen(5001, ()=>{
        console.log('Server is running on port 5001 , http://localhost:5001/');
        
    })
   }catch(error){
    console.log(error.message);
   }

}
ServerAndDb()

// API -1

app.get('/movies/', async (request, response)=>{
    const query = `SELECT movie_name FROM movie`;

    const result =  await db.all(query);
    response.send(result);
})

// API-2


app.post('/movies/',  async (request, response)=>{
    const {directorId, movieName, leadActor} = request.body;

    const query = `INSERT into movie (director_id, movie_name, lead_actor) values (?, ?, ?)`;

    const result = await db.run(query,[directorId, movieName, leadActor]);
    response.send('Movie Successfully Added');

    
})

// API-3
app.get('/movies/:movieId/', async (request, response)=>{
    const {movieId} = request.params;
    const query = `SELECT * FROM movie WHERE movie_id = ?`;
    const result = await  db.get(query, [movieId]);
    response.send(result);
})

// API-4
app.put('/movies/:movieId/', async (request, response)=>{
    const {movieId} = request.params;
    const {directorId, movieName, leadActor, } = request.body;
    const query = `UPDATE movie set director_id = ?, movie_name =?, lead_actor = ? WHERE movie_id = ?`;
    const result = await db.run(query , [directorId, movieName, leadActor, movieId]);
    response.send('Movie Details Updated');
}) 

// API-5

app.delete('/movies/:movieId', async (request, response)=>{
    const {movieId} = request.params;
    const query = `DELETE FROM movie WHERE movie_id = ?`;
    const result = await db.run(query,[movieId]);
    response.send('Movie Removed');
})

// API-6
app.get('/directors/', async (request,response)=>{
    const query = `SELECT * FROM director`;
    const result = await db.all(query);
    response.send(result);
})

// API-7

app.get('/directors/:directorId/movies/', async (request, response)=>{
    const {directorId} = request.params;
    const query = `SELECT movie_name FROM movie WHERE director_id = ? `;
    const result = await db.all(query, [directorId]);
    response.send(result);
})



