import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors';
import pg from 'pg';

const app=express()
const port=3000;
app.use(express.json())
app.use(cors())

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Authentication",
  password: "22L31A0568",
  port: 5432,
});

(async()=>{
    try{
        db.connect()
        console.log(`Connected postgresql`)
    }
    catch(err){
        console.log(`database not connected:`,err)
    }
})
app.use(express.json())
app.use(cors())

app.post('/signup',async (req,res)=>{
    const [name,email,password]=req.body();
    try{
        const user=await db.query('select * from users_auth where email=$1',[email]);
        if(user.rows.length.length>0){
            console.log(`user already exists`);
            return res.status(400).json({message:'email already exists'})
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const newuser =await db.query('insert into users_auth (name,email,password)values($1,$2,$3)',[name,email,hashedPassword])
        return res.status(500).json({message:'signup succesfull'});

    }
    catch(err){
        console.log(err)
        return res.status(500).json({message:'error in registering'});
    }

})

app.post('/login',(req,res)=>{
    try{
        
    }
})