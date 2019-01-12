/* #region Notes*/
/**
 * Error Codes and Unauthorized Access
 * If the access token does not allow access to the requested resource, or if there is no 
 * access token in the request, then the server must reply with an HTTP 401 response and 
 * include a WWW-Authenticate header in the response.
 * 
 * The minimum WWW-Authenticate header includes the string Bearer, indicating that a bearer
 * token is required. The header can also indicate additional information such as a “realm
 * and “scope”. 
 * The “realm” value is used in the traditional HTTP authentication sense. 
 * During HTTP basic authentication, the server requests authentication information (a user 
 * ID and password) from a client. The server makes this request by sending an HTTP 
 * response with a 401 status code, and a WWW-Authenticate header.
 * The format of a WWW-Authenticate header for HTTP basic authentication is:
 * WWW-Authenticate: Basic realm="Our Site"
 * The WWW-Authenticate header contains a realm attribute, which identifies the set of 
 * resources to which the authentication information requested (that is, the user ID and 
 * password) will apply. 
 * Web clients display this string to the end user when they request 
 * a user ID and password. 
 * Each realm may require different authentication information. 
 * Web clients may store the authentication information for each realm so that end users do
 * not need to retype the information for every request.
 * 
 * The “scope” value allows the resource server to indicate the list of scopes required to 
 * access the resource, so the application can request the appropriate scope from the user
 * when starting the authorization flow. 
 * The response should also include an appropriate “error” value depending on the type of
 * error that occurred.
 * 
 * invalid_request (HTTP 400) – The request is missing a parameter, or is otherwise 
 * malformed.
 * invalid_token (HTTP 401) – The access token is expired, revoked, malformed, or invalid
 * for other reasons. 
 * The client can obtain a new access token and try again.
 * insufficient_scope (HTTP 403) – The access token
 * 
 * For Example:
 * HTTP/1.1 401 Unauthorized
 * WWW-Authenticate: Bearer realm="example",
 *                   scope="delete",
 *                   error="insufficient_scope"
 * 
 * If the request does not have authentication, then no error code or other error information is necessary
 * HTTP/1.1 401 Unauthorized
 * WWW-Authenticate: Bearer realm="example"
 * 
 * The Resource Server
 * The resource server is the OAuth2.0 term for your API server.
 * The resource server handles authenticated requests after the application has obtained an access token
 * 
 * Large scale deployments may have more than one resource server.
 * Google's services, for example, have dozens of resource servers, such as Google Cloud, Google Maps, Youtube.
 * Each of these resource servers are distinctly separate, but they all share the same authorization server.
 * 
 * Smaller deployments typically have only one resource server, and is often built as part of the same code base or same deployment as the authorization server.
 * 
 * Verifying Access Tokens
 * The resource server will be getting requests from applications with an HTTP Authorization header containing an access token
 * The resource server needs to be able to verify the access token to determine whether to process the request, and find the associated user account, etc.
 * 
 * If you're using self-encoded access token, then verifying the tokens can be done entirely in the resource server without interacting with a database or external servers.
 * 
 * If your tokens are stored in a database, then verifying the token is simply a database lookup on the token table.
 * 
 * Another option is to use the Token Introspection spec to build an API to verify access tokens.
 * This is a good way to handle verifying access tokens across a large number of resource servers, since it means you can encapsulate all of the logic of an API to other parts of the system.
 * The token introspection endpoint is intended to be used only internally, so you will want to protect it with some internal authorization, or only enable it on a server within the firewall of the system
 * 
 * Verifying Scope
 * The resource server needs to know the list of scopes that are associated with the access token
 * The server is responsible for denying the request if the scopes in the access token do not include the required scope to perform the designated action
 * 
 * The OAuth 2.0 spec does not define any scopes itself, nor is there a central registry of scopes.
 * The list of scopes is up to the service to decide for itself
 * 
 * SCOPE
 * Scope is a way to limit an app's access to a user's data
 * Rather than granting complete access to a user's account,
 * it is often useful to give apps a way to request a more limited scope of what they are allowed to do on behalf of a user
 * 
 * Some apps only use OAuth in order to identify the user, so they need access to a user ID and basic profile information.
 * 
 * Users will be more willing to authorize an App if they know exactly what the App can and cannot do with their account.
 * Scope is a way to control access and help the user identify the permissions they are granting to the application.
 * 
 * Defining Scopes
 * A good place to start with defining scopes is to define read vs write separately.
 * This works well for Twitter, since not all apps actually want to be able to post content to your Twitter account, some just need to access your profile information
 * 
 * Read vs Write
 * Read vs write access is a good place to start when defining scopes for a service.
 * Typically read access to a user's private profile information is treated with separate access control from apps wanting to update the profile information.
 * 
 * Limiting Access to Billable Resources
 * If your service provides an API that may cause the user to incur charges, scope is a great way to protect against applications abusing this
 * 
 * For example, The service should define a special scope, say "demographics"
 * The demographics API should only respond to API requests from tokens that contain this scope.
 * 
 * In this example, the demographics API could use the token introspection endpoint to look up the list of scopes that are valid for this token
 * If the response does not include "demographics" in the list of scopes, the endpoint would reject the rquest with an HTTP 403 response.
 * 
 * =========================================
 * JWT AUTHENTICATION 
 * =========================================
 * The Authentication API allows user to pass in credentials in order to receive authentication token
 * E.g., client initiates authentication process by invoking Authentication API endpoint:
 * (/api/auth/login)
 * Raw HTTP request:
 * POST /api/auth/login HTTP/1.1
 * Host: localhost:9966
 * X-Requested-With: XMLHttpRequest
 * Content-Type: application/json
 * Cache-Control: no-cache
 * {
 *  "username": "chabbyjs@gmail.com",
 *  "password": "as_good_as_it_is_bruh"
 * }
 * 
 * Authentication Response Example
 * ==============================
 * If client supplied credentials are valid, Authentication API will respond with the HTTP response including the following details:
 * 1. HTTP status "200 OK"
 * 2. Signed JWT Access and Refresh tokens are included in the response body
 * 
 * JWT Access Token-used to authenticate against protected API resources
 * It must be set in X-Authorization header
 * JWT Refresh Token-used to acquire new Access Token
 * -Token refresh is handled by the following API endpoint: /api/auth/token
 * 
 * Example Raw HTTP Response for /api/auth/token:
 * ============================================
 * {
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzdmxhZGFAZ21haWwuY29tIiwic2NvcGVzIjpbIlJPTEVfQURNSU4iLCJST0xFX1BSRU1JVU1fTUVNQkVSIl0sImlzcyI6Imh0dHA6Ly9zdmxhZGEuY29tIiwiaWF0IjoxNDcyMDMzMzA4LCJleHAiOjE0NzIwMzQyMDh9.41rxtplFRw55ffqcw1Fhy2pnxggssdWUU8CDOherC0Kw4sgt3-rw_mPSWSgQgsR0NLndFcMPh7LSQt5mkYqROQ",

  "refreshToken": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzdmxhZGFAZ21haWwuY29tIiwic2NvcGVzIjpbIlJPTEVfUkVGUkVTSF9UT0tFTiJdLCJpc3MiOiJodHRwOi8vc3ZsYWRhLmNvbSIsImp0aSI6IjkwYWZlNzhjLTFkMmUtNDg2OS1hNzdlLTFkNzU0YjYwZTBjZSIsImlhdCI6MTQ3MjAzMzMwOCwiZXhwIjoxNDcyMDM2OTA4fQ.SEEG60YRznBB2O7Gn_5X6YbRmyB3ml4hnpSOxqkwQUFtqA6MZo7_n2Am2QhTJBJA1Ygv74F2IxiLv0urxGLQjg"
}
* JWT Access Token
* ======================================
* JWT Access Token can be used for authentication and authorization:
* 1. Authentication is performed by verifying JWT Access Token signature
* If signature proves to be valid, access to requested API resouce is granted
* 2. Authorization is done by looking up privileges in the scope attribute of JWT Access token
* Decode JWT Access token has three parts: Header, Claims and Signature as shown below:
* Header
* =========================================
* {
    "alg": "HS512"
}
* Claims
* =======================================
* {
  "sub": "svlada@gmail.com",
  "scopes": [
    "ROLE_ADMIN",
    "ROLE_PREMIUM_MEMBER"
  ],
  "iss": "http://svlada.com",
  "iat": 1472033308,
  "exp": 1472034208
}
* Signature
* ========================================
*41rxtplFRw55ffqcw1Fhy2pnxggssdWUU8CDOherC0Kw4sgt3-rw_mPSWSgQgsR0NLndFcMPh7LSQt5mkYqROQ
* JWT Refesh Token
* ==========================================
* Refresh token is long-lived token used to request new Access tokens.
* It's expiration time is greater than expiration time of Access token
* 
* You can use jti claim to maintain the list of blacklisted or revoked tokens.
* JWT ID(jti) claim is defined by RFC7519 with purpose to uniquely identify individual Refresh token
* Decoded Refresh token has three parts: Header, Claims and Signature as shown below:
* Header
* =============================================
{
  "alg": "HS512"
}
* Claims
* ============================================
{
  "sub": "svlada@gmail.com",
  "scopes": [
    "ROLE_REFRESH_TOKEN"
  ],
  "iss": "http://svlada.com",
  "jti": "90afe78c-1d2e-4869-a77e-1d754b60e0ce",
  "iat": 1472033308,
  "exp": 1472036908
}
* =============================================
* Signature(base64 encoded)
* SEEG60YRznBB2O7Gn_5X6YbRmyB3ml4hnpSOxqkwQUFtqA6MZo7_n2Am2QhTJBJA1Ygv74F2IxiLv0urxGLQjg  
* 
* Login Processing Logic
* =======================
*De-serialization and basic validation of the incoming JSON payload
*Upon successful validation of the JSON payload, authentication logic is delegated to AuthenticationProvider
* AuthenticationProvider
* =====================================
* Responsibility of the AuthenticationProvider is to:
* 1. Verify user credentials against database
* 2. if username and password do not match the record in the database, authentication exception is thrown
* 3. Create UserContext and populate it with user data you need(in our case just username and user privileges)
* 4. Upon successful authentication, delegate creation of JWT Token to AuthenticationSuccessHandler

* AuthenticationSuccessHandler
* =======================================
* The responsibility of this handler is to add JSON payload containing JWT Access and Refresh tokens into the HTTP response body

* AuthenticationFailureHandler
* ==========================================
* Invoked in case of authentication failures
* You can design specific error messages based on exception type that have occurred during the authentication process

* JWT Authentication
* ==========================================
* Token based authentication schema provide benefits when compared to sessions/cookies:
* 1. CORS
* 2. No need for CSRF protection
* 3. Better integration with mobile
* 4. Reduced load on authorization server
* 5. No need for distributed session store

* Some trade-offs have to be made with this approach:
* 1. More vulnerable to XSS attacks
* 2. Access token can contain outdated authorization claims(e.g when some of the user privileges are revoked)
* 3. Access tokens can grow in size in case of increased number of claims
* 4. File download API can be tricky to implement
* 5. True statelessness and revocation are mutually exclusive

* JWT Authentication flow is very simple:
* 1. User obtains Refresh and Access tokens by providing credentials to the Authorization server.
* 2. User sends Access token with each request to access protected API resource
* 3. Access token is signed and contains user identity(e.g. user id) and authorization claims

* It is important to note that authorization claims will be included with the Access token.
* Lets say authorization claims(e.g. user privileges in the database) are changed during the life time of Access token.
* Those changes will not become effective until new Access token is issued.
* In most cases this is not big issue, because Access tokens are short-lived
* Otherwise go with the opaque token pattern

* Example Signed Request to Protected API Resource
* =========================================
* The following pattern should be sued when sending access tokens: <header-name> Bearer <access_token>
* In this example, for the header name (<header-name>) we are using X-Authorization.
* Raw HTTP request:
* ================
GET /api/me HTTP/1.1  
Host: localhost:9966  
X-Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzdmxhZGFAZ21haWwuY29tIiwic2NvcGVzIjpbIlJPTEVfQURNSU4iLCJST0xFX1BSRU1JVU1fTUVNQkVSIl0sImlzcyI6Imh0dHA6Ly9zdmxhZGEuY29tIiwiaWF0IjoxNDcyMzkwMDY1LCJleHAiOjE0NzIzOTA5NjV9.Y9BR7q3f1npsSEYubz-u8tQ8dDOdBcVPFN7AIfWwO37KyhRugVzEbWVPO1obQlHNJWA0Nx1KrEqHqMEjuNWo5w  
Cache-Control: no-cache  

* The following are the components we need to implement JWT Authentication:
* 1. JwtTokenAuthenticationProcessingFilter
* 2. JwtAuthenticationProvider
* 3. SkipPathRequestMatcher
* 4. JwtHeaderTokenExtractor
* 5. BloomFilterTokenVerifier
* 6. WebSecurityConfig

* JwtTokenAuthenticationProcessingFilter
* ====================================
* This is applied to each API(/api/**) with exception of the refresh token endpoint(/api/auth/token) and login endpoint(/api/auth/login)

* This filter has the following responsibilities:
* 1. Check for access token in X-Authorization header
* If Access token is found in the header, delegate authentication to JwtAuthenticationProvider otherwise throw authentication exception
* 2. Invokes success or failure strategies based on the outcome of the authentication process performed by JwtAuthenticationProvider

* Please ensure that chain.doFilter(request, response) is invoked upon successful authentication.
* You want processing of the request to advance to the next filter(or middleware), because the very last one filter
FilterSecurityInterceptor#doFilter is responsible to actually invoke method in your controller that is handling requested API resource
public class JwtTokenAuthenticationProcessingFilter extends AbstractAuthenticationProcessingFilter {  
    private final AuthenticationFailureHandler failureHandler;
    private final TokenExtractor tokenExtractor;

    @Autowired
    public JwtTokenAuthenticationProcessingFilter(AuthenticationFailureHandler failureHandler, 
            TokenExtractor tokenExtractor, RequestMatcher matcher) {
        super(matcher);
        this.failureHandler = failureHandler;
        this.tokenExtractor = tokenExtractor;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException, IOException, ServletException {
        String tokenPayload = request.getHeader(WebSecurityConfig.JWT_TOKEN_HEADER_PARAM);
        RawAccessJwtToken token = new RawAccessJwtToken(tokenExtractor.extract(tokenPayload));
        return getAuthenticationManager().authenticate(new JwtAuthenticationToken(token));
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
            Authentication authResult) throws IOException, ServletException {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authResult);
        SecurityContextHolder.setContext(context);
        chain.doFilter(request, response);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException failed) throws IOException, ServletException {
        SecurityContextHolder.clearContext();
        failureHandler.onAuthenticationFailure(request, response, failed);
    }
}
* JwtHeaderTokenExtractor
*===========================
* Is used to extract Authorization token from header.
* You can extend TokenExtractor interface and provide your custom implementation that will extract token from URL
@Component
public class JwtHeaderTokenExtractor implements TokenExtractor {  
    public static String HEADER_PREFIX = "Bearer ";

    @Override
    public String extract(String header) {
        if (StringUtils.isBlank(header)) {
            throw new AuthenticationServiceException("Authorization header cannot be blank!");
        }

        if (header.length() < HEADER_PREFIX.length()) {
            throw new AuthenticationServiceException("Invalid authorization header size.");
        }

        return header.substring(HEADER_PREFIX.length(), header.length());
    }
}

* JwtAuthenticationProvider
* ====================================
* JwtAuthenticationProvider has the following responsibilities:
* 1. Verify the access token's signature
* 2. Extract identity and authorizatioon claims from the Access Token and use them to create UserContext
* 3. If Access token is malformed, expired or simply if token is not signed with the appropriate signing key, Authentication exception will be thrown.
@Component
public class JwtAuthenticationProvider implements AuthenticationProvider {  
    private final JwtSettings jwtSettings;

    @Autowired
    public JwtAuthenticationProvider(JwtSettings jwtSettings) {
        this.jwtSettings = jwtSettings;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        RawAccessJwtToken rawAccessToken = (RawAccessJwtToken) authentication.getCredentials();

        Jws<Claims> jwsClaims = rawAccessToken.parseClaims(jwtSettings.getTokenSigningKey());
        String subject = jwsClaims.getBody().getSubject();
        List<String> scopes = jwsClaims.getBody().get("scopes", List.class);
        List<GrantedAuthority> authorities = scopes.stream()
                .map(authority -> new SimpleGrantedAuthority(authority))
                .collect(Collectors.toList());

        UserContext context = UserContext.create(subject, authorities);

        return new JwtAuthenticationToken(context, context.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return (JwtAuthenticationToken.class.isAssignableFrom(authentication));
    }
}
* SkipPathRequestMatcher
* ======================================
* JwtTokenAuthenticationProcessingFilter is configured to skip the following endpoints:
* /api/auth/login and /api/auth/token
* This is achieved with SkipPathRequestMatcher implementation of RequestMatcher
public class SkipPathRequestMatcher implements RequestMatcher {  
    private OrRequestMatcher matchers;
    private RequestMatcher processingMatcher;

    public SkipPathRequestMatcher(List<String> pathsToSkip, String processingPath) {
        Assert.notNull(pathsToSkip);
        List<RequestMatcher> m = pathsToSkip.stream().map(path -> new AntPathRequestMatcher(path)).collect(Collectors.toList());
        matchers = new OrRequestMatcher(m);
        processingMatcher = new AntPathRequestMatcher(processingPath);
    }

    @Override
    public boolean matches(HttpServletRequest request) {
        if (matchers.matches(request)) {
            return false;
        }
        return processingMatcher.matches(request) ? true : false;
    }
}

* WebSecurityConfig
* =======================
* WebSecurityConfig extends WebSecurityConfigurerAdapter to provide custom security configuration
* The following beans are configured and instatiated in this class/module:
AjaxLoginProcessingFilter
JwtTokenAuthenticationProcessingFilter
AuthenticationManager
BCryptPasswordEncoder
Also, inside WebSecurityConfig#configure(HttpSecurity http) method we'll configure patterns to define protected/unprotected API endpoints. Please note that we have disabled CSRF protection because we are not using Cookies.

@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {  
    public static final String JWT_TOKEN_HEADER_PARAM = "X-Authorization";
    public static final String FORM_BASED_LOGIN_ENTRY_POINT = "/api/auth/login";
    public static final String TOKEN_BASED_AUTH_ENTRY_POINT = "/api/**";
    public static final String TOKEN_REFRESH_ENTRY_POINT = "/api/auth/token";

    @Autowired private RestAuthenticationEntryPoint authenticationEntryPoint;
    @Autowired private AuthenticationSuccessHandler successHandler;
    @Autowired private AuthenticationFailureHandler failureHandler;
    @Autowired private AjaxAuthenticationProvider ajaxAuthenticationProvider;
    @Autowired private JwtAuthenticationProvider jwtAuthenticationProvider;

    @Autowired private TokenExtractor tokenExtractor;

    @Autowired private AuthenticationManager authenticationManager;

    @Autowired private ObjectMapper objectMapper;

    protected AjaxLoginProcessingFilter buildAjaxLoginProcessingFilter() throws Exception {
        AjaxLoginProcessingFilter filter = new AjaxLoginProcessingFilter(FORM_BASED_LOGIN_ENTRY_POINT, successHandler, failureHandler, objectMapper);
        filter.setAuthenticationManager(this.authenticationManager);
        return filter;
    }

    protected JwtTokenAuthenticationProcessingFilter buildJwtTokenAuthenticationProcessingFilter() throws Exception {
        List<String> pathsToSkip = Arrays.asList(TOKEN_REFRESH_ENTRY_POINT, FORM_BASED_LOGIN_ENTRY_POINT);
        SkipPathRequestMatcher matcher = new SkipPathRequestMatcher(pathsToSkip, TOKEN_BASED_AUTH_ENTRY_POINT);
        JwtTokenAuthenticationProcessingFilter filter 
            = new JwtTokenAuthenticationProcessingFilter(failureHandler, tokenExtractor, matcher);
        filter.setAuthenticationManager(this.authenticationManager);
        return filter;
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) {
        auth.authenticationProvider(ajaxAuthenticationProvider);
        auth.authenticationProvider(jwtAuthenticationProvider);
    }

    @Bean
    protected BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
        .csrf().disable() // We don't need CSRF for JWT based authentication
        .exceptionHandling()
        .authenticationEntryPoint(this.authenticationEntryPoint)

        .and()
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)

        .and()
            .authorizeRequests()
                .antMatchers(FORM_BASED_LOGIN_ENTRY_POINT).permitAll() // Login end-point
                .antMatchers(TOKEN_REFRESH_ENTRY_POINT).permitAll() // Token refresh end-point
                .antMatchers("/console").permitAll() // H2 Console Dash-board - only for testing
        .and()
            .authorizeRequests()
                .antMatchers(TOKEN_BASED_AUTH_ENTRY_POINT).authenticated() // Protected API End-points
        .and()
            .addFilterBefore(buildAjaxLoginProcessingFilter(), UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(buildJwtTokenAuthenticationProcessingFilter(), UsernamePasswordAuthenticationFilter.class);
    }
}
PasswordEncoderConfig
BCrypt encoder that is in AjaxAuthenticationProvider.

@Configuration
public class PasswordEncoderConfig {  
    @Bean
    protected BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
BloomFilterTokenVerifier
This is dummy class. You should ideally implement your own TokenVerifier to check for revoked tokens.

@Component
public class BloomFilterTokenVerifier implements TokenVerifier {  
    @Override
    public boolean verify(String jti) {
        return true;
    }
}


 */
/* #endregion */
let User = require('../models/user.model');

//POST /api/login?username="username"&password="password"
async function login(req, res, next) {

    try {
        
        let {username, password} = (Object.keys(req.query).length === 0) ? req.body : req.query; 
        let reasons =  User.failedLoginReasons;

        //fetch user and test for password equality
        let user = await User.findOne({'username': username});
        
        if(user){
            //check if the account is currently locked
            if(user.isLocked){
                //just increment login attempts if account is already locked
                user.incLoginAttempts(function(err) {
                    if(err){
                        console.log('Error incrementing login attempts: ', err);
                    }
                });
                throw new Error(reasons.MAX_ATTEMPTS);
            }
            //test for a matching password
            let isMatch = await user.comparePassword(password, user.password);
            console.log('isMatch: ', isMatch);
            if(!isMatch){
                //password is incorrect, so throw new error and increment login
                user.incLoginAttempts(function(err) {
                    if(err){
                        console.log('Error incrementing login attempts: ', err);
                    }
                });
                throw new Error(reasons.PASSWORD_INCORRECT);
            }
            if(isMatch){
                //if there is no lock or failed attempts, just return the user
                if(!user.login_attempts && !user.lock_until){
                    res.status(200);
                    res.send(user);
                    return;
                    // return next(null, user);
                }
                //reset attempts and lock info
                let updates = {
                    $set: { login_attempts: 0},
                    $unset: { lock_until: 1}
                };

                let updated_user = await User.findOneAndUpdate({'_id': user._id}, updates,{"new": true});
                res.status(200);
                res.send(updated_user);
                // return next(null, updated_user);
                return;
            }
        }
        else {
            //get clever and deny that IP further requests for 24hrs, i.e, rate limit
            throw new Error(reasons.NOT_FOUND);
        }
    } catch (error) {
        res.status(401);
        return next(error);
    }
}

module.exports = {
    login
}