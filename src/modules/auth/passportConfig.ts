import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { addUser, getUserByEmail } from "./controller";
import { SignUpInput } from "./types"; // Adjust the import based on your project structure

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.OAUTH_CALLBACK,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find the user by email
    let user = await getUserByEmail(profile.emails?.[0].value || "");

    if (!user) {
      // If user doesn't exist, create a new user
      const userInput: SignUpInput = {
        email: profile.emails?.[0].value || "",
        name: profile.displayName || "",
        oauth: true,
      };
      user = await addUser(userInput);
    }

    return done(null, user);
  } catch (err) {
    return done(err, undefined);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await getUserByEmail(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
