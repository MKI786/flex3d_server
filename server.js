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


const PORT = process.env.PORT || 8080;

server.use(async(req, res)=>{
    res.send("server is running on port ${PORT} );
})

server.listen(PORT, () => {
    console.log("server is Listening on Port: ", PORT)
})
