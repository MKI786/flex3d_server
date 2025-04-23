const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const server = express();
dotenv.config();
const connectdb = require('./Config/Db')

server.use(express.json());
server.use(cors());

connectdb();

//Routes
server.use('/client', require('./Routes/ClientRoutes.js'));




server.use(async(req, res)=>{
    res.send("server is running on port 3000");
})
server.listen(3000, () => {
    console.log("server is start listening ")
})