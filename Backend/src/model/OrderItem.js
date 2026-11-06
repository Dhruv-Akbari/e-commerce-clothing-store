const mongoose = require('mongoose')

const OrderItemSchema = new mongoose.Schema({
    product:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Product'
    },
    quantity:{
        type : Number,
        required : true
    },
    price:{
        type : Number,
        required : true
    },
    total:{
        type : Number,
        required : true
    },
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    size:{
        type : String,
        required : true
    },
    status:{
        type : String,
        default : 'Ordered'
    },
    delivery_Date:{
        type : Date
    },
    paymentStatus:{
        type : String,
        default : 'Pending'
    }
})

const OrderItemModel = mongoose.model('OrderItem', OrderItemSchema)

module.exports = OrderItemModel;
