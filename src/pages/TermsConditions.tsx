import React from 'react';

// ==========================================
// TERMS & CONDITIONS CONTENT
// ==========================================

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-7">
    <h2 className="text-body-lg font-bold text-neutral-textPrimary dark:text-white mb-2 leading-snug">
      {title}
    </h2>
    <div className="text-small text-neutral-textSecondary dark:text-neutral-400 leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

export const TermsConditions: React.FC = () => {
  const lastUpdated = 'July 4, 2026';

  return (
    <article className="text-left">
      {/* Intro */}
      <div className="mb-7">
        <p className="text-caption text-neutral-textSecondary dark:text-neutral-500">
          Last updated: {lastUpdated}
        </p>
      </div>

      <p className="text-small text-neutral-textSecondary dark:text-neutral-400 leading-relaxed mb-7">
        These Terms &amp; Conditions govern your access to and use of <strong className="text-neutral-textPrimary dark:text-white">Assufa Dars</strong>, an attendance management application. By logging in and using this application, you agree to be bound by these terms. If you do not agree, please discontinue use immediately.
      </p>

      <Section title="1. Purpose of the Application">
        <p>
          Assufa Dars is a digital attendance management tool designed for educational organisations. It enables authorised organisation administrators to record, manage, and analyse student attendance data in a secure and organised manner.
        </p>
        <p>
          The application is provided exclusively for legitimate internal use by registered organisations and their authorised administrators.
        </p>
      </Section>

      <Section title="2. Organisation Responsibilities">
        <p>
          Each registered organisation is responsible for:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li>Maintaining accurate organisation details including name and class place.</li>
          <li>Ensuring only authorised individuals are granted administrator access.</li>
          <li>Complying with applicable local laws regarding collection and storage of student data.</li>
          <li>Promptly notifying us of any suspected unauthorised access to their account.</li>
        </ul>
      </Section>

      <Section title="3. Administrator Responsibilities">
        <p>
          As an organisation administrator, you agree to:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li>Use the application only for its intended purpose — recording and managing attendance.</li>
          <li>Keep your login credentials secure and not share them with unauthorised persons.</li>
          <li>Log out of the application when using shared or public devices.</li>
          <li>Report any security concerns or suspicious activity to us immediately.</li>
          <li>Use the export feature responsibly and handle exported files with appropriate care.</li>
        </ul>
      </Section>

      <Section title="4. Accuracy of Attendance Records">
        <p>
          You are solely responsible for the accuracy of attendance information entered into the application. Assufa Dars provides tools to record and view data, but does not verify the correctness of attendance entries. Errors in recorded attendance are the responsibility of the administrator who entered the data.
        </p>
        <p>
          We strongly recommend reviewing attendance records regularly and correcting any mistakes promptly using the Edit functionality available in the Reports section.
        </p>
      </Section>

      <Section title="5. Data Ownership">
        <p>
          All data entered by your organisation — including student names, attendance records, and organisation details — remains the property of your organisation. We do not claim ownership of your data.
        </p>
        <p>
          You grant us a limited, non-exclusive licence to store and process this data solely for the purpose of providing the application's services to you.
        </p>
      </Section>

      <Section title="6. Prohibited Usage">
        <p>
          You must not use Assufa Dars for any of the following:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li>Recording attendance data for purposes other than legitimate educational management.</li>
          <li>Entering false, misleading, or fabricated student information.</li>
          <li>Attempting to access data belonging to other organisations.</li>
          <li>Reverse engineering, decompiling, or attempting to extract source code from the application.</li>
          <li>Using the application for any unlawful, harmful, or fraudulent purpose.</li>
          <li>Sharing access credentials with persons outside your authorised team.</li>
        </ul>
        <p>
          Violation of these terms may result in immediate suspension of your account and deletion of your organisation's data.
        </p>
      </Section>

      <Section title="7. Account Security">
        <p>
          You are responsible for maintaining the security of your account. This includes:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li>Choosing a strong, unique password for your account.</li>
          <li>Not sharing your password with others.</li>
          <li>Logging out after each session on shared devices.</li>
        </ul>
        <p>
          We are not liable for any loss or damage arising from unauthorised access to your account due to your failure to maintain account security.
        </p>
      </Section>

      <Section title="8. Export Responsibility">
        <p>
          The Export Attendance Report feature generates downloadable Excel files containing student and attendance data. You are solely responsible for how these exported files are stored, shared, or used. Please ensure that exported reports are handled in compliance with applicable data protection laws and are not shared with unauthorised parties.
        </p>
      </Section>

      <Section title="9. Service Availability">
        <p>
          We strive to keep the application available and functional at all times. However, we do not guarantee uninterrupted availability. The service may be temporarily unavailable due to:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li>Scheduled or emergency maintenance.</li>
          <li>Technical issues with our hosting infrastructure (Supabase).</li>
          <li>Network connectivity issues on your end.</li>
        </ul>
        <p>
          We will make reasonable efforts to notify users of planned downtime in advance.
        </p>
      </Section>

      <Section title="10. Future Updates">
        <p>
          Assufa Dars may be updated from time to time to add new features, fix bugs, or improve performance. Continued use of the application following any update constitutes acceptance of the updated version. We will not remove core features without reasonable notice.
        </p>
      </Section>

      <Section title="11. Limitation of Liability">
        <p>
          To the fullest extent permitted by law, Assufa Dars and its developers shall not be liable for any indirect, incidental, or consequential damages arising from:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li>Loss of data due to accidental deletion or system failure.</li>
          <li>Errors or inaccuracies in attendance records entered by administrators.</li>
          <li>Decisions made based on reports or data exported from the application.</li>
          <li>Temporary unavailability of the service.</li>
        </ul>
        <p>
          Our total liability in any situation is limited to the value of the subscription or fee paid for the service in the preceding month (if applicable).
        </p>
      </Section>

      <Section title="12. Termination">
        <p>
          We reserve the right to suspend or terminate your access to the application at any time if you are found to be in violation of these Terms &amp; Conditions or if your account is suspected of fraudulent activity.
        </p>
        <p>
          You may request termination of your account at any time by contacting us. Upon termination, your organisation's data will be permanently deleted within a reasonable time period.
        </p>
      </Section>

      <Section title="13. Governing Law">
        <p>
          These Terms &amp; Conditions shall be governed by and construed in accordance with the laws applicable in the jurisdiction where the organisation operates. Any disputes shall be resolved through mutual agreement or, if necessary, through appropriate legal channels.
        </p>
      </Section>

      <Section title="14. Contact Information">
        <p>
          For questions, concerns, or requests related to these Terms &amp; Conditions, please reach out to us:
        </p>
        <div className="mt-2 rounded-input border border-neutral-border dark:border-neutral-700 bg-neutral-bg dark:bg-neutral-800/60 p-4 space-y-1">
          <p><strong className="text-neutral-textPrimary dark:text-white">Application:</strong> Assufa Dars</p>
          <p><strong className="text-neutral-textPrimary dark:text-white">Email:</strong> support@assufadars.com</p>
          <p><strong className="text-neutral-textPrimary dark:text-white">Organisation:</strong> Assufa Dars Management</p>
        </div>
        <p className="mt-3">
          By using this application, you confirm that you have read, understood, and agreed to these Terms &amp; Conditions.
        </p>
      </Section>
    </article>
  );
};
