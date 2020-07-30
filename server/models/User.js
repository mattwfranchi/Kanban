var validator = require('validator');
var dynamoose = require("dynamoose");
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var { v1: uuidv1 } = require('uuid');

var schema = new dynamoose.Schema({

    email: {
        type: String,
        required: true,
        hashKey: true,
        validate: validator.isEmail
    },

    password: {
        type: String,
        required: true
    },

    id: {
        type: String,
        require: true
    },

    admin: {
        type: Boolean,
        required: true,
        default: false
    },

    // basic user info from registration/application
    info: {
        type: Object,
        schema: {
            name: {
                type: String,
                required: true,
                default: ""
            },
        
            gender: {
                type: String,
                required: true,
                default: ""
            },

            phone: {
                type: String,
                required: true,
                default: ""
            },

            school: {
                type: String,
                required: true,
                default: ""
            },

            gradyr: {
                type: String,
                required: true,
                default: ""
            },

            frq1: {
                type: String,
                required: true,
                default: ""
            },

            frq2: {
                type: String,
                required: true,
                default: ""
            },
        }

    },

    status: {
        type: Object,
        schema: {
            // email verify status
            verify: {
                type: Boolean,
                required: true,
                default: false
            },

            // completed application or not
            application: {
                type: Boolean,
                required: true,
                default: false
            }
        
        }

    }
    
}, 
{
    'timestamps': true
});

var User = dynamoose.model('UserTable', schema);

// static methods

/**
 * find user based on email
 * @param {String} email user email
 */
User.methods.set("findEmail", async function (email) {
    var u = await this.get(email);
    return u;
});

/**
 * hash user password 
 * @param {String} password user password
 */
User.methods.set("hashPassword", async function (password) {
    return hash = bcrypt.hash(password, await bcrypt.genSalt(10));
});

/**
 * generate unique id for user based on timestamp
 */
User.methods.set("generateID", async function () {
    return uuidv1();
});

/**
 * verify auth token and returns user if token valid
 * @param {String} token auth token
 */
User.methods.set("verifyToken", function (token, callback) {
    jwt.verify(token, process.env.JWT_SECRET, function(err, id){
        if (err) {
            return callback(err);
        }
        this.scan('id').eq(id).exec(callback);
    }.bind(this));
});

/**
 * verify email token and return email string 
 *  @param {String} token email auth token
 */
User.methods.set("verifyEmailToken", function (token, callback) {
    jwt.verify(token, process.env.JWT_SECRET, function(err, email) {
        return callback(err, email);
    });
});



// instance methods

/**
 * check password 
 * @param {String} password user password
 */
User.methods.document.set("checkPassword", async function (password) {
    return bcrypt.compare(password, this.password);
});


/**
 * generate auth token based on user uid
 */
User.methods.document.set("generateToken", async function () {
    return jwt.sign(this.id, process.env.JWT_SECRET);
});

User.methods.document.set("generateEmailVerificationToken", async function() {
    return jwt.sign(this.email, process.env.JWT_SECRET);
})


module.exports = User