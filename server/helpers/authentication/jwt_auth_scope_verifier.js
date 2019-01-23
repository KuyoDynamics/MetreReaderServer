const error = res => res.status(403).send('Insufficient scope');

module.exports = expectedScopes => {
    console.log('Called Auth Scope Verifier');
    if(!Array.isArray(expectedScopes)){
        throw new Error(
            'Parameter expectedScopes must be an array of strings representing the scopes for the endpoints'
        );
    }

    return (req, res, next) => {
        if(expectedScopes.length === 0){
            return next();
        }
        console.log('is req.user.scope: array', Array.isArray(req.user.scope));
        if(!req.user || !Array.isArray(req.user.scope)){
            return error(res);
        }

        const scopes = req.user.scope;
        const allowed = expectedScopes.some(scope => scopes.includes(scope));

        return allowed ? next() : error(res);
    };
}