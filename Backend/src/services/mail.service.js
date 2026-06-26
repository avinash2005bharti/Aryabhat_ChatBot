const { BrevoClient } = require("@getbrevo/brevo");


// console.log("BREVO KEY:", process.env.BREVO_API_KEY); // 👈 add this



const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

module.exports = {
    sendMail: async ({ to, subject, text }) => {
        try {
            const response = await brevo.transactionalEmails.sendTransacEmail({
                sender: {
                    name: "Aryabhat",
                    email: process.env.EMAIL
                },
                to: [{ email: to }],
                subject: subject,
                textContent: text
            });

            console.log("Email sent successfully");
            return response;

        } catch (err) {
            console.error("BREVO ERROR:", err);
            throw err;
        }
    }
};