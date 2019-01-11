/**
 *  This is applied to each API(/api/**) with exception of the refresh token endpoint
 * (/api/auth/token) and login endpoint(/api/auth/login)
 * This filter has the following responsibilities:
 * 1. Check for access token in X-Authorization header
 * If Access token is found in the header, delegate authentication to 
 * jwt_auth_provider otherwise throw authentication exception
 * Invokes success or failure strategies based on the outcome of the authentication process 
 * performed by jwt_auth_provider
 */