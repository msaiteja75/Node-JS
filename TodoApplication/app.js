const express = require('express');
const app = express();
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const {open} = require('sqlite');
const cors = require('cors');
const date_fns = require('date-fns');
app.use(express.json());

// app.use(cors());
const db_path = path.join(__dirname, 'todoApplication.db');

let db = null;
const ServerStartAndDb = async () =>{
  try{
    db =await open({
        filename:db_path,
        driver:sqlite3.Database
    })
    app.listen(5001, ()=>{
        console.log('Server is running on port 5001 http://localhost:5001/');
        
    })
  }catch(error){
    console.log(error.message);
    process.exit(1);
  }
}

ServerStartAndDb();




// API-1
app.get('/todos/', async (request, response)=>{
    const {status, priority, search_q, category} = request.query;

// SCENARIO-1 FOR STATUS
    if(status!=undefined && priority==undefined){
        const dbStatus  = `SELECT * FROM todo where status =?`;
    const existornot = await db.get(dbStatus,[status]);
    if(existornot){
        const query = 'SELECT * FROM todo where status =?';
        const result = await db.all(query, [existornot.status]);
        response.send(result);
    }else{
        response.status(400);
        response.send('Invalid Todos Status');
    }
//  SCENARIO-2 FOR PRIORITY
    }else if(priority!=undefined && status==undefined){
        const dbPriority  = `SELECT * FROM todo where priority =?`;
    const existornot = await db.get(dbPriority,[priority]);
    if(existornot){
        const query = 'SELECT * FROM todo where priority =?';
        const result = await db.all(query, [existornot.priority]);
        response.send(result);
    }else{
        response.status(400);
        response.send('Invalid Todos Priority');
    }


    }
    //SCENARIO-3 PRIORITY AND STATUS
    else if(priority!==undefined && status!==undefined){

        const dbPriorityStatus  = `SELECT * FROM todo where priority =? and status =?`;
    const existornot = await db.get(dbPriorityStatus,[priority, status]);
    // console.log(existornot)
    if(existornot){
        const query = 'SELECT * FROM todo where priority =? and status=?';
        const result = await db.all(query, [existornot.priority, existornot.status]);
        response.send(result);
    }else{
        response.status(400);
        response.send('Invalid  Priority and Status');
    }


    }
    // SCENARIO-4 SEARCH
    else if (search_q !==undefined){
        const dbSearchStatus  = `SELECT * FROM todo where todo LIKE '%${search_q}%'`;
    const existornot = await db.get(dbSearchStatus);
    console.log(existornot)
    if(existornot){
        const query = `SELECT * FROM todo where todo LIKE  '%${existornot.todo}%'`;
        const result = await db.all(query);
        response.send(result);
    }else{
        response.status(400);
        response.send('Invalid  Search ');
    }

    }
    // SCENARIO-5
    else if(category!=undefined && status!=undefined){
        const dbStatus  = `SELECT * FROM todo where category =? and status=?`;
    const existornot = await db.get(dbStatus,[category, status]);
    
    console.log(existornot)
    if(existornot){
        const query = `SELECT * FROM todo where category =? and status=?`;
        const result = await db.all(query, [existornot.category, existornot.status]);
        response.send(result);
    }else{
        response.status(400);
        response.send('Invalid  Category and Status ');
    }

    }
    // SCENARIO-6
    else if(category!=undefined){
        const dbStatus  = `SELECT * FROM todo where category =?`;
    const existornot = await db.get(dbStatus,[category]);
    
    console.log(existornot)
    if(existornot){
        const query = `SELECT * FROM todo where category =?`;
        const result = await db.all(query, [existornot.category]);
        response.send(result);
    }else{
        response.status(400);
        response.send('Invalid  Category ');
    }

    }
    // SCENARIO-7
    else if(category!=undefined && priority!=undefined){

        const dbStatus  = `SELECT * FROM todo where category =? and priority =?`;
    const existornot = await db.get(dbStatus,[category, priority]);
    
    console.log(existornot)
    if(existornot){
        const query = `SELECT * FROM todo where category =? and priority =?`;
        const result = await db.all(query, [existornot.category, existornot.priority]);
        response.send(result);
    }else{
        response.status(400);
        response.send('Invalid  Category and priority ');
    }

    } 
     
});

   ///////////////////////////////////
    // API--2
    app.get('/todos/:todoId/', async (request, response)=>{
        const {todoId} = request.params;
        const query = `SELECT * FROM todo WHERE id = ?`
        const result = await db.get(query, [todoId]);
        response.send(result)
    })
    //////
    // API-3
    app.get('/agenda/', async (request, response)=>{
       try{
        const {date} = request.query;
        
        let formatted_date = date_fns.format(date, 'yyyy-MM-dd');
        // console.log(formatted_date);
        // console.log(typeof(formatted_date));
        const query = `SELECT * FROM todo where due_date =?`;
        const result = await db.get(query, [formatted_date]);
       
        response.send(result);
       }catch(error){
        console.log(error.message);
       }


    })

    // API-4
    app.post('/todos/', async (request, response)=>{
        const {id, todo, priority, status, category, dueDate} = request.body;
        const query = `INSERT INTO todo (id, todo, priority, status, category, due_date) values (?,?,?,?,?,?)`;
        const result = await db.run(query, [id, todo, priority, status, category, dueDate]);
        response.send("Todo Successfully Added");
    })

    // API-5
    app.put('/todos/:todoId/', async (request, response)=>{
        const {todoId} = request.params;
        const {status, priority, todo, category, dueDate} = request.body;
        // SCENARIO-1
        if(status !=undefined){
            const query = `UPDATE todo SET status = ? where id = ?`
            const result = await db.run(query,[status, todoId])
            response.send('Status Updated ')
        }
        // SCENARIO-2
        else if(priority!=undefined){
            const query = `UPDATE todo SET priority = ? where id = ?`
            const result = await db.run(query,[priority, todoId]);
            response.send('Priority Updated');
        // SCENARIO-3
        }else if(todo!=undefined){
            const query = `UPDATE todo SET todo = ? where id = ?`
            const result = await db.run(query,[todo, todoId])
            response.send('Todo Updated');
            // SCENARIO-4
        }else if(category!=undefined){
            const query = `UPDATE todo SET category = ? where id = ?`
            const result = await db.run(query,[category, todoId])
            response.send('Category Updated');
            // SCENARIO-5
        }else if(dueDate != undefined){
            const formatted_date = date_fns.format(dueDate, ('yyyy-MM-dd'));
            const query = `UPDATE todo SET due_date =? where id =?`
            const result = await db.run(query, [formatted_date, todoId]);
            response.send("Due Date Updated ")
        }
    })


    // API-6
    app.delete('/todos/:todoId/', async (request, response)=>{
        const {todoId} = request.params;
        const query = `DELETE FROM todo where id = ?`;
        const result = await db.run(query,[todoId]);
        response.send('Todo Deleted');
    })