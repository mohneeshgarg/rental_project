const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    contact:{
        type: Number, 
        required: true
    },
    adds:[]
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);