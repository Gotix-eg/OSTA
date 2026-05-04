import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(to: string, name: string) {
  if (!to) return;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || '"OSTA" <noreply@osta.eg>',
    to,
    subject: "Welcome to OSTA! | أهلاً بك في أُسطى",
    html: `
      <div style="font-family: sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #d4af37;">أهلاً بك يا ${name}!</h2>
        <p>سعداء جداً بانضمامك إلى منصة أُسطى. نحن هنا لنوفر لك أفضل الخدمات المنزلية بكل سهولة وأمان.</p>
        <p>يمكنك الآن البدء في طلب الفنيين أو تصفح الخدمات المتاحة عبر تطبيقنا.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">هذه الرسالة مرسلة تلقائياً، برجاء عدم الرد عليها.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

export async function sendPasswordResetEmail(to: string, token: string) {
  if (!to) return;

  const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}&email=${to}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || '"OSTA" <noreply@osta.eg>',
    to,
    subject: "Reset Your Password | إعادة تعيين كلمة المرور",
    html: `
      <div style="font-family: sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #d4af37;">طلب إعادة تعيين كلمة المرور</h2>
        <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في أُسطى.</p>
        <p>يرجى الضغط على الزر أدناه للمتابعة:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">إعادة تعيين كلمة المرور</a>
        </div>
        <p>إذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة بأمان.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
}
