import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const botToken = formData.get('botToken') as string;
    const channelId = formData.get('channelId') as string;
    const applicantName = formData.get('applicantName') as string;
    const applicantEmail = formData.get('applicantEmail') as string;
    const companyName = formData.get('companyName') as string;
    const companyWebsite = formData.get('companyWebsite') as string;
    const pdfBlob = formData.get('file') as File;

    if (!botToken || !channelId) {
      return NextResponse.json({ error: "Missing configuration params" }, { status: 400 });
    }

    // Discord message content formatting
    const content = `**New Candidate Application Research Delivery**\n` +
                    `**Applicant:** ${applicantName} (${applicantEmail})\n` +
                    `**Researched Company:** ${companyName}\n` +
                    `**Website:** ${companyWebsite}`;

    const discordPayload = new FormData();
    discordPayload.append('content', content);
    discordPayload.append('file', pdfBlob, `${companyName.replace(/\s+/g, '_')}_Report.pdf`);

    // Direct Discord bot-to-channel message creation request execution
    const discordResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
      },
      body: discordPayload,
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      throw new Error(`Discord API error: ${errorText}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}