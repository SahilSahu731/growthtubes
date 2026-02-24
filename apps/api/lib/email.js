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

/**
 * Send welcome email after successful email verification
 */
export const sendWelcomeEmail = async (to, name) => {
  try {
    const displayName = name || to.split('@')[0];
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Welcome to GrowthTubes, ${displayName}! 🎉`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background-color: #0f0f10; color: #fafafa; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0; color: #ffffff;">
              Growth<span style="color: #10b981;">Tubes</span>
            </h1>
          </div>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
            <h2 style="font-size: 22px; font-weight: 700; margin: 0 0 8px 0; color: #ffffff;">
              Welcome, ${displayName}!
            </h2>
            <p style="font-size: 14px; color: #a1a1aa; margin: 0;">
              Your account has been created successfully.
            </p>
          </div>
          
          <div style="background: linear-gradient(135deg, #10b98110, #0d612d15); border: 1px solid #10b98125; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #d4d4d8; margin: 0 0 16px 0; line-height: 1.6;">
              You're all set to start your learning journey. Here's what you can do next:
            </p>
            <ul style="font-size: 14px; color: #a1a1aa; margin: 0; padding-left: 20px; line-height: 2;">
              <li><strong style="color: #10b981;">Explore</strong> — Browse courses across various categories</li>
              <li><strong style="color: #10b981;">Learn</strong> — Enroll in courses and build new skills</li>
              <li><strong style="color: #10b981;">Track</strong> — Maintain your learning streak</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${frontendUrl}/explore" style="display: inline-block; padding: 12px 32px; background-color: #10b981; color: #000000; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 12px;">
              Start Exploring →
            </a>
          </div>
          
          <p style="font-size: 13px; color: #71717a; text-align: center; margin: 0;">
            Have questions? Just reply to this email — we're happy to help.
          </p>
          
          <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />
          
          <p style="font-size: 11px; color: #52525b; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} GrowthTubes. All rights reserved.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Welcome email error:', error);
      // Don't throw — welcome email failure shouldn't break auth flow
      return null;
    }

    return data;
  } catch (error) {
    console.error('Welcome email error:', error);
    return null; // Non-critical, don't throw
  }
};

/**
 * Send password reset OTP email
 */
export const sendPasswordResetEmail = async (to, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Reset your password — GrowthTubes',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background-color: #0f0f10; color: #fafafa; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0; color: #ffffff;">
              Growth<span style="color: #10b981;">Tubes</span>
            </h1>
          </div>
          
          <div style="text-align: center; margin-bottom: 8px;">
            <div style="font-size: 48px; margin-bottom: 12px;">🔐</div>
          </div>

          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #ffffff; text-align: center;">
            Reset your password
          </h2>
          <p style="font-size: 14px; color: #a1a1aa; text-align: center; margin: 0 0 32px 0;">
            Use the code below to reset your password
          </p>
          
          <div style="background: linear-gradient(135deg, #ef444420, #dc262630); border: 1px solid #ef444440; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #f87171; margin: 0; font-family: 'Courier New', monospace;">
              ${otp}
            </p>
          </div>
          
          <p style="font-size: 13px; color: #71717a; text-align: center; margin: 0 0 8px 0;">
            This code expires in <strong style="color: #a1a1aa;">10 minutes</strong>.
          </p>
          <p style="font-size: 13px; color: #71717a; text-align: center; margin: 0;">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
          
          <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />
          
          <p style="font-size: 11px; color: #52525b; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} GrowthTubes. All rights reserved.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Password reset email error:', error);
      throw new Error('Failed to send password reset email');
    }

    return data;
  } catch (error) {
    console.error('Password reset email error:', error);
    throw new Error('Failed to send password reset email');
  }
};
