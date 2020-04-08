const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pickPugPoopSchema = new Schema({
        username: { 
            type : String, 
            required: true
        },
        difficulty: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        time: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

var PickPugPoopResults = mongoose.model('PickPugPoopResult', pickPugPoopSchema);
module.exports = PickPugPoopResults;
