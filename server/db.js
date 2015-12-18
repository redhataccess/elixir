var mongoose = require('mongoose');
var mongoUrl;

if (process.env.OPENSHIFT_MONGODB_DB_URL) {
    mongoUrl = process.env.OPENSHIFT_MONGODB_DB_URL + 'elixir';
} else {
    mongoUrl = 'mongodb://localhost:27017/elixir';
}

mongoose.connect(mongoUrl);

mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + mongoUrl);
});

mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});
