const mongoose=require('mongoose')

const UserSchema = mongoose.Schema({
    Name:{
        type:'string',
        required:true
    },
    Email:{
        type:'string',
        required:true,
        unique:true
    },
    password:{
        type:'string',
        required:true
    },
    role:{
        type:'string',
        enum:['admin','user'],
        default:'user'
    }
     
})

const Usermodel=mongoose.model('User',UserSchema)

module.exports=Usermodel;
