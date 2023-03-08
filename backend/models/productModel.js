const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:[true,"Please Enter Product Description"],
    },
    price:{
        type:Number,
        required:[true,"Please Enter Product Price"],
        maxLength:[8,"Price can't exceed 8 charaters"]
    },
    ratings:{
        type:Number,
        default:0
    },
    image:[
      {
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
      }
    ],
    category:{
        type:String,
        required:[true,"Please Enter Product Category"],
    },
    Stock:{
        type:Number,
        required:[true,"Please Enter Product Stock"],
        maxLength:[4, "Stock cannot exceed 4 charecters"],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },

    reviews:[
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],

    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },

    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Product",productSchema);

// In data base all data will be saved with Product name but MongoDB will add one s in it so collection name will be Products