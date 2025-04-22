import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: Request) {
    const { to, subject, html } = await request.json()

    try {
        const data = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "noreplyecodeli@gmail.com",
            to,
            subject,
            html,
        })
        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error("✉️ send-email error:", error)
        return NextResponse.json({ success: false, error }, { status: 500 })
    }
}