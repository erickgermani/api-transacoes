import passport from 'passport';
import passportJwt from 'passport-jwt';
import userService from '../services/user';

const { JWT_SECRET } = process.env;

const { Strategy, ExtractJwt } = passportJwt;

const params = {
	secretOrKey: JWT_SECRET,
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const strategy = new Strategy(params, async (payload, done) => {
	const user = await userService.findOne({ id: payload.id });

	try {
		if (user !== undefined) done(null, { ...payload });
		else done(null, false);
	} catch (err) {
		done(err, false);
	}
});

passport.use(strategy);

const authenticate = () => passport.authenticate('jwt', { session: false });

export default authenticate;
