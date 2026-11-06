const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    OrderItems:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'OrderItem'
    }],
    orderdate:{
        type:'date',
        required:true,
        default:Date.now()

    },
    ShippingAddress:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'Address'
    },
    paymentDetail:{
       paymentmethod:{
        type : String
       },
       transactionId:{
        type : String
       },
       paymenId:{
        type : String
       },
       PaymentStatus:{
        type : String,
        default : 'Pending'
        }
    },
    totalPrice:{
        type : Number
    },
    orderStatus:{
        type : String,
        Default : 'Pending'

    },
    CreatedAt:{
        type : Date,
        default : Date.now
    }
}) 

const ordermodel = mongoose.model('Order', orderSchema);

module.exports = ordermodel