const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// //make a shopping item schema
// const userSchema = new Schema({
//     userName:{
//         type: String,
       
//     },
//     password:{
//         type: String,
      
//     },
//     email :{
//         type: String,
        
//     },
//     loginHistory : {
//         dateTime : {
//         type: Date,
//        }
//     ,
//     userAgent : {
//         type : String ,
       
//     }
// }

// })

const {User} = require('./utils/model')
// const User = mongoose.model('User', userSchema);

// module.exports  = {User}

//let User; // to be defined on new connection (see initialize)
module.exports.initialize = function (URI) {
    return new Promise(function (resolve, reject) {
        console.log(URI)
        let db = mongoose.createConnection(URI)
        console.log('Database connected')
        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
        //    User = db.model("users", userSchema);
        //    console.log(User);
           resolve();
        });
    });
};

//let userData = {userName : "divya", userAgent :'eee', email: 'karkidivya5@gmail.com', password : 'test123', password2: 'test123'}
module.exports.register = function (userData) {
    return new Promise(function (resolve, reject) {
        console.log(userData)
        let data = userData;
         if (data.password != 'test123') {
            reject("Passwords do not match");
         } else {
            let newUser = new User(data); 
            // let result = newUser.save()
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
