import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ipage.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "info@gotix-eg.com",
    pass: "AAA@123456789aaa",
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendTestEmail() {
  const to = "hgomaa_86@yahoo.com";
  const name = "حسين جمعة";
  
  console.log(`[EmailService] Attempting to send welcome email to: ${to}`);

  const mailOptions = {
    from: '"OSTA" <info@gotix-eg.com>',
    to,
    subject: "Welcome to OSTA! | أهلاً بك في أُسطى",
    html: `
      <div style="font-family: sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h1 style="color: #d4af37;">أهلاً بك يا ${name}!</h1>
        <p>سعداء جداً بانضمامك إلى منصة أُسطى. نحن هنا لنوفر لك أفضل الخدمات المنزلية بكل سهولة وأمان.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
           <p>نعدك بتجربة مميزة مع أفضل الفنيين المعتمدين في مصر.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">هذه الرسالة مرسلة تلقائياً، برجاء عدم الرد عليها.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Welcome email sent: ${info.messageId}`);
  } catch (error) {
    console.error("[EmailService] Error sending welcome email:", error);
  }
}

sendTestEmail();
