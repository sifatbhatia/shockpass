import { router } from '../init'
import { eventRouter } from './event'
import { ticketRouter } from './ticket'
import { orderRouter } from './order'
import { walletRouter } from './wallet'
import { organizerRouter } from './organizer'
import { scanRouter } from './scan'
import { referralRouter } from './referral'
import { waitlistRouter } from './waitlist'
import { promoRouter } from './promo'
import { userRouter } from './user'

export const appRouter = router({
  event: eventRouter,
  ticket: ticketRouter,
  order: orderRouter,
  wallet: walletRouter,
  organizer: organizerRouter,
  scan: scanRouter,
  referral: referralRouter,
  waitlist: waitlistRouter,
  promo: promoRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter