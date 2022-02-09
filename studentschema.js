var mongoose=require('mongoose');
  
var StudentSchema = new mongoose.Schema({
    displayName:String,
    id:String
});
  
module.exports = mongoose.model(
    'student', StudentSchema, 'Students');