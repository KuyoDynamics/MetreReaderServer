let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let UserTypeOptions = ['admin','read_only','group_admin'];
let SexTypeOptions = ['male','female','unknown'];

let UserSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
	sex: { 
		type: String, 
		enum: SexTypeOptions, 
		lowercase: true,
		trim: true,
		required: true
    },
    date_of_birth: {
        type: String,
        required: true
    },
    user_type: {
        type: String,
        enum: UserTypeOptions
    },
    user_role: {
        type: String,
        enum: UserRoleOptions
    } 
});

let User = mongoose.model('User', UserSchema);

module.exports = User;