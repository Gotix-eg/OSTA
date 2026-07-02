import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
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

export async function sendNewRequestNotificationEmail(
  to: string,
  name: string,
  requestTitle: string,
  categoryName: string,
  area: string
) {
  if (!to) return;

  console.log(`[EmailService] Attempting to send new request notification email to: ${to}`);

  const mailOptions = {
    from: process.env.SMTP_FROM || '"OSTA" <noreply@osta.eg>',
    replyTo: process.env.SMTP_USER || '"OSTA" <noreply@osta.eg>',
    to,
    subject: "New Job Opportunity Available! | فرصة عمل جديدة متاحة",
    text: `أهلاً بك يا ${name}!\n\nهناك فرصة عمل جديدة متاحة في منطقتك تطابق تخصصك:\n\nالخدمة: ${categoryName}\nالعنوان: ${requestTitle}\nالمنطقة: ${area}\n\nسجل الدخول إلى حسابك في أُسطى لعرض التفاصيل وقبول الطلب.\n\nمنصة أُسطى - الجودة والضمان.`,
    html: `
      <div style="font-family: sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #d4af37;">فرصة عمل جديدة متاحة! 🎉</h2>
        <p>أهلاً بك يا ${name}،</p>
        <p>تم إضافة طلب صيانة جديد في منطقتك يطابق تخصصك المهني:</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #d4af37;">
          <p style="margin: 5px 0;"><strong>نوع الخدمة:</strong> ${categoryName}</p>
          <p style="margin: 5px 0;"><strong>تفاصيل الطلب:</strong> ${requestTitle}</p>
          <p style="margin: 5px 0;"><strong>المنطقة/المدينة:</strong> ${area}</p>
        </div>
        <p>يرجى تسجيل الدخول إلى تطبيق أو موقع أُسطى فوراً لعرض التفاصيل الكاملة وقبول الفرصة.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">منصة أُسطى - الجودة والضمان.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] New request notification email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("[EmailService] Error sending new request notification email:", error);
  }
}

export async function sendVerificationEmail(to: string, name: string, code: string) {
  if (!to) return;

  console.log(`[EmailService] Attempting to send verification email to: ${to}`);

  const mailOptions = {
    from: process.env.SMTP_FROM || '"OSTA" <noreply@osta.eg>',
    replyTo: process.env.SMTP_USER || '"OSTA" <noreply@osta.eg>',
    to,
    subject: "Verify Your Email | تأكيد البريد الإلكتروني",
    text: `رمز التحقق الخاص بك لتفعيل الحساب في أُسطى هو:\n${code}\n\nهذا الرمز صالح لمدة ساعة واحدة فقط.\n\nمنصة أُسطى - الجودة والضمان.`,
    html: `
      <div style="font-family: sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #d4af37;">تأكيد البريد الإلكتروني - منصة أُسطى</h2>
        <p>مرحباً يا ${name}،</p>
        <p>شكراً لتسجيلك في منصة أُسطى. لتفعيل حسابك والبدء في استخدام المنصة، يرجى استخدام رمز التحقق التالي:</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
          ${code}
        </div>
        <p>هذا الرمز صالح لمدة ساعة واحدة فقط.</p>
        <p>إذا لم تقم بالتسجيل في منصتنا، يرجى تجاهل هذه الرسالة.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">منصة أُسطى - الجودة والضمان.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Verification email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("[EmailService] Error sending verification email:", error);
  }
}


