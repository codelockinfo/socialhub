// Mock mailer utility
export const sendMail = async ({ to, subject, text, html }) => {
  console.log(`✉️ Mock email sent to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content (Text): ${text || 'N/A'}`);
  if (html) {
    console.log(`Content (HTML): ${html}`);
  }
  return {
    messageId: `mock-id-${Date.now()}`,
    accepted: [to]
  };
};

export default { sendMail };
