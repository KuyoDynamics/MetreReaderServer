module.exports = function(app){
    //Water Metre Reader API
    app.use('/water/api/users', require('./water_metre_reader_api/routes/user.router'));
    app.use('/water/api/login', require('./water_metre_reader_api/routes/login.router'));
    // app.use('water/api/customers', require('./water_metre_reader_api/routes/customer.router'));
    // app.use('water/api/metre_accounts', require('./water_metre_reader_api/routes/metre_account.router'));
    // app.use('water/api/metre_readings', require('./water_metre_reader_api/routes/metre_reading.router'));
}