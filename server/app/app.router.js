module.exports = function(app){
    //Water Metre Reader API
    app.use('/water/api/users', require('./water_metre_reader_api/routes/user.router'));
    //get new token
    app.use('/water/api/auth/login', require('./water_metre_reader_api/routes/login.router')); 
    //Used to renew token: verify token, check scope, return new token
    app.use('/water/api/auth/token', require('./water_metre_reader_api/routes/auth.router'));
    // app.use('water/api/customers', require('./water_metre_reader_api/routes/customer.router'));
    // app.use('water/api/metre_accounts', require('./water_metre_reader_api/routes/metre_account.router'));
    // app.use('water/api/metre_readings', require('./water_metre_reader_api/routes/metre_reading.router'));
}