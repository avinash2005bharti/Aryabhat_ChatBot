const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = {
    sendMail: async ({ from, to, subject, text }) => {
        const { error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // ✅ Verify se pehle yahi use karo
            to,
            subject,
            text
        });

        if (error) {
            console.error("Resend error:", error);
            throw error;
        }
    }
};