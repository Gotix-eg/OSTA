import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: parseInt(process.env.SMTP_PORT || "587") === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendWelcomeEmail(to: string, name: string) {
  if (!to) return;
  
  console.log(`[EmailService] Attempting to send welcome email to: ${to}`);

  const mailOptions = {
    from: process.env.SMTP_FROM || '"OSTA" <noreply@osta.eg>',
    replyTo: process.env.SMTP_USER || '"OSTA" <noreply@osta.eg>',
    to,
    subject: "Welcome to OSTA! | أهلاً بك في أُسطى",
    text: `أهلاً بك يا ${name}!\n\nسعداء جداً بانضمامك إلى منصة أُسطى. نحن هنا لنوفر لك أفضل الخدمات المنزلية بكل سهولة وأمان.\nنعدك بتجربة مميزة مع أفضل الفنيين المعتمدين في مصر.\n\nهذه الرسالة مرسلة تلقائياً، برجاء عدم الرد عليها.`,
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
    return info;
  } catch (error) {
    console.error("[EmailService] Error sending welcome email:", error);
  }
}

export async function sendPasswordResetEmail(to: string, code: string) {
  if (!to) return;

  console.log(`[EmailService] Attempting to send reset code to: ${to}`);
  
  const mailOptions = {
    from: process.env.SMTP_FROM || '"OSTA" <noreply@osta.eg>',
    replyTo: process.env.SMTP_USER || '"OSTA" <noreply@osta.eg>',
    to,
    subject: "Reset Your Password | إعادة تعيين كلمة المرور",
    text: `طلب إعادة تعيين كلمة المرور\n\nلقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في أُسطى.\n\nرمز التحقق الخاص بك هو:\n${code}\n\nهذا الرمز صالح لمدة ساعة واحدة فقط.\nإذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة بأمان.\n\nمنصة أُسطى - الجودة والضمان.`,
    html: `
      <div style="font-family: sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #d4af37;">طلب إعادة تعيين كلمة المرور</h2>
        <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في أُسطى.</p>
        <p>رمز التحقق الخاص بك هو:</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
          ${code}
        </div>
        <p>هذا الرمز صالح لمدة ساعة واحدة فقط.</p>
        <p>إذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة بأمان.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">منصة أُسطى - الجودة والضمان.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Reset code sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("[EmailService] Error sending password reset email:", error);
  }
}
