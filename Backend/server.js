require('dotenv').config()
const app=require('./src/app')
const dns = require("dns");
const connectDb = require('./src/db/db');


dns.setServers(["8.8.8.8", "8.8.4.4"]);
connectDb();
const port = process.env.PORT || 3000;


app.listen(port,()=>{
    console.log('Server is running on port 3000')

})