// const mongoose = require('mongoose')

// const connectDatabase = () => {
//     mongoose.connect("mongodb://localhost:27017/Ecommerce", {useNewUrlParser:true}).then(()=>{
//         console.log(`Mongodb connected with server:`)
//     }).catch((err)=>{
//         console.log(err)
//     })
// }

// module.exports = connectDatabase


const mongoose = require('mongoose')

const connectDatabase = () => {
  mongoose
    .connect(process.env.DB||3000, { useNewUrlParser: true })
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`)
    })
   
}

module.exports = connectDatabase
