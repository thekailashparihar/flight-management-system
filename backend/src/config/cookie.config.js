// prettier-ignore
// Cookie options for storing JWT in browser cookies
const cookieOptions = {
      maxAge: 1000 * 60 * 60,         // Cookie valid for 1 hour
      httpOnly: true,                 // Cookie not accessible via JavaScript
      secure: true,                   // Cookie sent only over HTTPS
      domain: process.env.DOMAIN,     // Domain for which cookie is valid
      path: "/",                      // Cookie valid for all routes
      sameSite: "Strict",             // Allow cross-site cookie
    };
export default cookieOptions;
