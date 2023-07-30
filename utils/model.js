const mongoose = require('mongoose');
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
    loginHistory : {
        dateTime : {
        type: Date,
       }
    ,
    userAgent : {
        type : String ,
       
    }
}

})


const User = mongoose.model('user', userSchema);

module.exports  = {User}