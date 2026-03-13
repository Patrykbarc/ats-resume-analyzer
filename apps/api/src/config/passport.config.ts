import passport from 'passport'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import { getEnvs } from '../lib/getEnv'
import { prisma } from '../server'

const { JWT_SECRET } = getEnvs()

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
}

const jwtStrategy = new JwtStrategy(options, async (jwt_payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: jwt_payload.userId },
      select: {
        id: true,
        email: true,
        isPremium: true,
        subscriptionCurrentPeriodEnd: true
      }
    })

    if (user) {
      return done(null, user)
    } else {
      return done(null, false)
    }
  } catch (error) {
    return done(error, false)
  }
})

passport.use(jwtStrategy)

export default passport
