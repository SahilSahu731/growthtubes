import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'GrowthTubes <onboarding@resend.dev>';

/**
 * Send OTP verification email
 */
export const sendOTPEmail = async (to, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Verify your email — GrowthTubes',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background-color: #0f0f10; color: #fafafa; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0; color: #ffffff;">
              Growth<span style="color: #10b981;">Tubes</span>
            </h1>
          </div>
          
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #ffffff; text-align: center;">
            Verify your email
          </h2>
          <p style="font-size: 14px; color: #a1a1aa; text-align: center; margin: 0 0 32px 0;">
            Enter this code to complete your verification
          </p>
          
          <div style="background: linear-gradient(135deg, #10b98120, #0d612d30); border: 1px solid #10b98140; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #10b981; margin: 0; font-family: 'Courier New', monospace;">
              ${otp}
            </p>
          </div>
          
          <p style="font-size: 13px; color: #71717a; text-align: center; margin: 0 0 8px 0;">
            This code expires in <strong style="color: #a1a1aa;">10 minutes</strong>.
          </p>
          <p style="font-size: 13px; color: #71717a; text-align: center; margin: 0;">
            If you didn't request this code, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />
          
          <p style="font-size: 11px; color: #52525b; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} GrowthTubes. All rights reserved.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send verification email');
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw new Error('Failed to send verification email');
  }
};
