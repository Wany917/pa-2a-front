import { NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session
      // Handle successful checkout
      // Here you would typically update your database, send confirmation emails, etc.
      console.log(`Payment successful for session: ${checkoutSession.id}`)
      break
    case "invoice.paid":
      const invoice = event.data.object as Stripe.Invoice
      // Handle successful payment
      console.log(`Invoice paid: ${invoice.id}`)
      break
    case "customer.subscription.created":
      const subscription = event.data.object as Stripe.Subscription
      // Handle subscription creation
      console.log(`Subscription created: ${subscription.id}`)
      break
    case "customer.subscription.updated":
      const updatedSubscription = event.data.object as Stripe.Subscription
      // Handle subscription update
      console.log(`Subscription updated: ${updatedSubscription.id}`)
      break
    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object as Stripe.Subscription
      // Handle subscription deletion
      console.log(`Subscription deleted: ${deletedSubscription.id}`)
      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

