const mongoose = require('mongoose');
const dotenv = require( 'dotenv')
dotenv.config();
const Schema = mongoose.Schema;
//make a shopping item schema
const userSchema = new Schema({
    userName:{
        type: String,
       
    },
    password:{
        type: String,
      
    },
    email :{
        type: String,
        
    },
    loginHistory : [
        {
            dateTime: Date,
            userAgent: String
        }
    ]
    ,
    userAgent : {
        type : String ,
       
    }
}

)
let User // to be defined on new connection (see initialize)

const URI = process.env.MONGODB_URI
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        console.log(URI)
        let db = mongoose.createConnection(URI)
        console.log('Database connected')
        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           console.log(User);
           resolve();
        });
    });
};

//let userData = {userName : "divya", userAgent :'eee', email: 'karkidivya5@gmail.com', password : 'test123', password2: 'test123'}
module.exports.register = function (userData) {
    return new Promise(function (resolve, reject) {
        console.log(userData)
        let data = userData;
         if (data.password != data.password2) {
            reject("Passwords do not match");
         } else {
            let newUser = new User(data); 
            let result = newUser.save()
           // console.log(result)
            resolve()
            // .then(() => {
            //     resolve();
            //   })
            //   .catch((err) => {
            //     if(err.code  == 11000)
            //         reject("no results returned");
            //     else(err.code != 11000 )
            //         reject('There was an error creating the user: err')
               
        // });
 
        }
    })
        
}
