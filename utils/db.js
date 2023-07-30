const mongoose = require('mongoose');

class Database{
    constructor(){}
    
    async connectDB( URI ){
        try{
            await mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
            console.log('Database connected')
        }
        catch(error){
            console.log('An error occurred', error)
        }
    }

    closeDB(){
        mongoose.connection.close()
        console.log('Database disconected')
    }
}

module.exports = Database