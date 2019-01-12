
async function getNewToken(req, res, next) {
    res.send().json({
        message: 'token_renew under construction'
    })
    return;
    
}

module.exports = {
    getNewToken
}