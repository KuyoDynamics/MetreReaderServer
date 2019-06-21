const fcm_admin = require('firebase-admin');
let fcm_service_account;

if(process.env.NODE_ENV === 'TEST'){
		fcm_service_account = require('../../config/water-meter-reader-a9db4-firebase-adminsdk-2mcki-e8a1ad48cb.json');
}

function fcmInit(){
    return new Promise( async (resolve, reject)=>{
        try {
                let app = await fcm_admin.initializeApp({
                credential: fcm_admin.credential.cert(
                    process.env.NODE_ENV === 'TEST' ? fcm_service_account : JSON.parse(process.env.FCM_SERVICE_ACCOUNT)
                    ),
                databaseURL: process.env.FCM_DATABASE_URL
            });
            resolve(app);
        } catch (error) {
            reject(error);
        }
    });
}

function subscribeToTopic(registrationTokens, topic){
    return new Promise(async (resolve, reject)=>{
        try {
            let response = await fcm_admin.messaging().subscribeToTopic(registrationTokens, topic);
            resolve(response);
        } catch (error) {
            reject(error);            
        }
    });
}

//send test message
// let fcm_device_registration_token = 'e_PjGlz6lxY:APA91bFSl5NmhEZG2ZgHD4rCiZzo4yQqgDk3-b_CL4Elf-2N3kqwU-LJC9qOmcCQmc_1_eHl9ymMvjAWvUbd7-f3mqFk9yaO0WHdl7eMILRDQTte9-WvF4zKPsQbpyBDGXlrr6olqE-E';

// let fcm_message = {
// 	data: {
// 		user_id: 'test_id-12345',
// 		dirty_endpoints:'user,account,readings'
// 	},
// 	token: fcm_device_registration_token
// }
module.exports = {
    fcmInit,
    subscribeToTopic
}


