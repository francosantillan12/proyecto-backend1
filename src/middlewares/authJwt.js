import passport from "passport";

export const authJwt = passport.authenticate("current", { session: false });
