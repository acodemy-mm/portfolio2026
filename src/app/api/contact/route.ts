import { NextResponse } from "next/server";

type Body = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, message: "Name, email, and message are required." },
      { status: 400 },
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (resendKey && to) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
          to: [to],
          reply_to: email,
          subject: `Portfolio contact from ${name}`,
          text: `${message}\n\n— ${name} <${email}>`,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json(
          { ok: false, message: `Email failed: ${errText}` },
          { status: 502 },
        );
      }
      return NextResponse.json({ ok: true, message: "Thanks — your message was sent." });
    } catch {
      return NextResponse.json(
        { ok: false, message: "Could not send email. Try again later." },
        { status: 502 },
      );
    }
  }

  // Fallback when Resend is not configured — acknowledge and suggest mailto
  return NextResponse.json({
    ok: true,
    message: `Thanks ${name}. Email delivery is not configured yet — please also reach out via the address on this page.`,
  });
}
