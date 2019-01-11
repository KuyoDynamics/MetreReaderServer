/**
 * jwt_auth_provider has the following responsibilities:
 * 1. Verify the access token's signature
 * 2. Extract identity and authorizatioon claims from the Access Token and use them to
 * create UserContext
 * 3. If Access token is malformed, expired or simply if token is not signed with the
 * appropriate signing key, Authentication exception will be thrown.
 */
