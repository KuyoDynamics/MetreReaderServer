const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const chalk = require('chalk');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
let {require_authentication} = require('../helpers/authentication/authentication_manager');
const fcm_admin = require('firebase-admin');
let fcm_service_account;
const strings = require('../helpers/strings');
const app_name = require('../../package.json').name;

let app = express();

mongoose.set('useCreateIndex', true);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '../../public')));
app.use(morgan('common'));

//Set req.user to null for each server request
app.use('*', function(req, res, next){
	req.user = null;
	next();
});
app.all('*/api*', require_authentication);

//Laod routes
require('../app/app.router')(app);

const options = {
	autoReconnect: true,
	useNewUrlParser: true,
	bufferMaxEntries: 0 ,
	bufferCommands: false 
};

try{
	if (process.env.NODE_ENV === 'TEST') {
		fcm_service_account = require('../config/water-meter-reader-a9db4-firebase-adminsdk-2mcki-e8a1ad48cb.json');
		var configFile = path.join(__dirname, '../config/.env');
		dotenv.load({ path: configFile });
	}
} catch(error){
	console.log(strings.error_messages.connection_error, error.message);
}
console.log('FCM SERVICE ACCOUNT: ', process.env.FCM_SERVICE_ACCOUNT);

let fcm_app = fcm_admin.initializeApp({
	credential: fcm_admin.credential.cert(
		process.env.NODE_ENV === 'TEST' ? fcm_service_account : JSON.parse(process.env.FCM_SERVICE_ACCOUNT)
		),
	databaseURL: process.env.FCM_DATABASE_URL
});

console.log('FCM App Name: ', fcm_app.name);

//send test message
let fcm_device_registration_token = 'e_PjGlz6lxY:APA91bFSl5NmhEZG2ZgHD4rCiZzo4yQqgDk3-b_CL4Elf-2N3kqwU-LJC9qOmcCQmc_1_eHl9ymMvjAWvUbd7-f3mqFk9yaO0WHdl7eMILRDQTte9-WvF4zKPsQbpyBDGXlrr6olqE-E';

let fcm_message = {
	data: {
		user_id: 'test_id-12345',
		dirty_endpoints:'user,account,readings'
	},
	token: fcm_device_registration_token
}
// Send a message to the device corresponding to the provided registration token.
fcm_admin.messaging().send(fcm_message)
	.then((response)=>{
		//Response is message ID string
		console.log('Successfully sent fcm message: ', response);
	})
	.catch((error)=>{
		console.log('Error sending fcm message: ', error);
	});


var db_connection = mongoose.connection;

db_connection.setMaxListeners(0);

process.on('SIGINT', function(){
	db_connection.close(function(){
		console.log(strings.error_messages.connection_closed_sigint, chalk.red('X'));
		db_connection.removeAllListeners();
		process.exit(0);
	});
});

db_connection.on('error', (error) =>{
	console.error('[' + app_name + ']', strings.error_messages.connection_error + error.message, chalk.red('X'));
	mongoose.disconnect();
});

db_connection.on('disconnected', function(){
	console.log('[' + app_name + ']', strings.error_messages.connection_closed_db_server,
		chalk.red('X'));
	// mongoose.connect(process.env.MONGODB_URL, options);
});

db_connection.on('connected', function(){
	console.log('[' + app_name + ']', strings.info_messages.connected_to_db_server,
		chalk.green('✓'));
});

db_connection.on('reconnectFailed', function(){
	console.log('[' + app_name + ']', strings.error_messages.connection_failed_max_retries, chalk.red('X'));
});

db_connection.on('connecting', function(){
	console.log('[' + app_name + ']', strings.info_messages.connecting_to_db_server,
		chalk.green('✓'));
});

db_connection.on('disconnecting', function(){
	console.log('[' + app_name + ']', strings.info_messages.disconnecting_from_db_server,
		chalk.red('X'));
});

db_connection.on('close', function(){
	console.log('[' + app_name + ']', strings.error_messages.connection_closed);
	// db_connection.removeAllListeners();
});

db_connection.on('timeout', function(){
	console.log('Timeout...');
});

mongoose.connect(process.env.MONGODB_URL, options);

app.use(function(err,req,res,next){
	console.log('[metrereaderserver] Error:', err.message + '\n Stack Trace: ' + err.stack);

	res.json({
		status: err.status === null ? 404 : err.status,
		message: err.message === null ? 'Not found' : err.message
	}).send().end();
	console.log('Called global error handler');
});

let PORT = process.env.PORT || 3000;

let server = app.listen(PORT, function(){
	console.log('[' + app_name + ']', strings.info_messages.connected_to_silc_server + strings.info_messages.listening_to_silc_server + PORT + '!', chalk.green('✓'));
});

module.exports = server;