const app = require('./app')
const dotenv = require('dotenv')
const connectDatabase = require("./config/dtabase")

//Handling uncaught exception

process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server due to Unhandle uncaughtException`)

    process.exit(1)
})

//config

dotenv.config({path: "backend/config/config.env"})

//Connecting to database
connectDatabase()


const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
})
// console.log(first)

//Unhandled Promise Rejection

process.on("unhandledRejection", err => {
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server due to Unhandle Promise Rejection`)

    server.close(()=> {
        process.exit(1)
    })

})