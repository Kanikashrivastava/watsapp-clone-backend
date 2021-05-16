let mongoose = require('mongoose');

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean
})
//collection
module.exports = mongoose.model('messagecontents', whatsappSchema);