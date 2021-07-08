const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ImageSchema = new Schema({
    filename: String, 
    url: String
})
ImageSchema.virtual('show_thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_3000,h_2000');
})
ImageSchema.virtual('home_thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_1000,h_1000');
})
ImageSchema.virtual('edit_thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_150,h_150');
})
const addSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    contact:{
        type: Number,
        required: true
    },
    location:{
        type: String, 
        required: true
    },
    Image:[ImageSchema],
    owner:{
        type: String
    }
});
module.exports = mongoose.model('Add',addSchema);