import {Schema, model, models} from 'mongoose'

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        require: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please enter a valid email'
        ],
    },
    password: {
        type: String,
        require: [true, "Password is required"],
        select: false
    },
    fullname: {
        type: String,
        require: [true, "Fullname is required"],
        minLength: [3, "Fullname mus be at least 3 characters"],
        maxLength: [50, "Fullname mus be at most 50 characters"],
    }

});

const User = models.User || model('User', userSchema)
export default User;