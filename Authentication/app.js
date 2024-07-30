const express = require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const {open} = require('sqlite');
const bcrypt = require('bcrypt');
const app =express();
app.use(express.json());


const db_path = path.join(__dirname, "userData.db");

const ServerAndDb = async () =>{
   try{
   db = await  open({
        filename:db_path,
        driver:sqlite3.Database,
    })
    app.listen(5001, ()=>{
        console.log('Server is running on port 5001, http://localhost:5001/');
    })
   }catch(error){
    console.log(error.message);


   }
}
ServerAndDb();
// API-1
// REGISTERING USER
// SCENARIO-01
app.post('/register', async (request, response)=>{
    try{
        const {username, name, password, gender, location} = request.body;

    const searchUserINDb = `SELECT username from user where username = ?`;
    const dbUser = await db.get(searchUserINDb, [username]);

    if(dbUser===undefined){
        // SCENARIO-2
           if(password.length>=5){
            const hashPassword = await bcrypt.hash(password,10);
      
            const registerUser = `INSERT INTO user (username, name,password, gender, location)
            values (?,?,?,?,?)`;
            const result =  await db.run(registerUser, [username,name,hashPassword,gender,location]);
            // SCENARIO -3
            response.send('User created  Successfully')
           }else{
            response.status(400);
            response.send('PASSWORD IS TOO SHORT');
           }
    }else{
        response.status(400);
        response.send('USER ALREADY EXIST... USE DIFFERENT NAME');
    }
    }catch(error){
        console.log(error.message);
    }
})

// API-2
app.post('/login', async (request, response)=>{
   try{
    const {username, password}=request.body;
    const findUser = `SELECT username from user  where username ='${username}'`;
    const findPass = `SELECT password from user where username= '${username}'`
    const dbPass = await db.get(findPass);
    const dbUser = await db.get(findUser);
    console.log(username);
    console.log(password);
    
    console.log(`db password ${dbPass.password}`);
    
    
    if(dbUser==undefined){
        // SCENARIO-1
        response.status(400);
    response.send("INVALID USER");  
    }
    else{
    const ispassMatch = await bcrypt.compare(password, dbPass.password);
  
    if(dbUser.username!==undefined && ispassMatch===true){
        // SCENARIO-3
        response.send('LOGIN SUCCESSFULL');
        
    }else{
        response.status(400);
        // SCENARIO-2
        
        response.send('INVALID PASSWORD');
    }

}
   }catch(error){
    console.log(error.message);
   }

})

// API-3
app.put('/change-password', async (request, response)=>{
    try{
        const {username, oldPassword, newPassword} = request.body;
    // SCENARIO-1
    // if user provides incorrect password it will show as Invalid Current Password
    const dbUserquery = `SELECT * FROM user where username = '${username}'`;
    const dbUser=await db.get(dbUserquery);
    // console.log(dbUser.username);
    // console.log(dbUser.password);

    if(dbUser==undefined){
        response.status(404);
        response.send('INVALID User');

    }else{
        const ispassMatch = await bcrypt.compare(oldPassword, dbUser.password);
        if(ispassMatch===true && newPassword.length>=5){
            const newHashPassword = await bcrypt.hash(newPassword, 10);
            const updateQuery = `UPDATE user SET password = ? WHERE username = ?`;
            const result = await db.run(updateQuery,[newHashPassword,dbUser.username]);
            response.send('Password Updated Successfully');
        }else if(ispassMatch===true && newPassword.length<5){
            response.status(400);
            // SCENARIO-2
            response.send('Password is too short');
        }else {
            response.status(400);
            // SCENARIO-1
            response.send('Invalid Current Password');
        }
    }
    }catch(error){
        console.log(error.message);
    }
    
})