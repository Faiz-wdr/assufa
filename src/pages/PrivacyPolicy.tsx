import React from 'react';

// ==========================================
// PRIVACY POLICY CONTENT
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

export const PrivacyPolicy: React.FC = () => {
  const lastUpdated = 'July 4, 2026';

  return (
    <article className="text-left">
      {/* Intro */}
      <div className="mb-7">
        <h1 className="text-h2 font-bold text-neutral-textPrimary dark:text-white mb-1.5">
          Privacy Policy
        </h1>
        <p className="text-caption text-neutral-textSecondary dark:text-neutral-500">
          Last updated: {lastUpdated}
        </p>
      </div>

      <p className="text-small text-neutral-textSecondary dark:text-neutral-400 leading-relaxed mb-7">
        Welcome to <strong className="text-neutral-textPrimary dark:text-white">Assufa Dars</strong> — an attendance management application designed for educational organisations. We are committed to protecting your privacy and ensuring your information is handled responsibly. This Privacy Policy explains what information we collect, how we use it, and what rights you have.
      </p>

      <Section title="1. Purpose of This Application">
        <p>
          Assufa Dars is built to help organisation administrators record and manage student attendance in a simple, efficient, and secure manner. The application is intended for internal use by authorised administrators only.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p>We collect only the information necessary to operate the application:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li>
            <strong className="text-neutral-textPrimary dark:text-white">Student information</strong> — Student names, place of residence, and phone numbers provided by the administrator when registering students.
          </li>
          <li>
            <strong className="text-neutral-textPrimary dark:text-white">Attendance records</strong> — Daily present/absent status for each registered student.
          </li>
          <li>
            <strong className="text-neutral-textPrimary dark:text-white">Authentication information</strong> — Email address and password used to log in to the application. Passwords are never stored in plain text; they are securely managed by Supabase Auth.
          </li>
          <li>
            <strong className="text-neutral-textPrimary dark:text-white">Organisation details</strong> — Organisation name, class place, and administrator contact information.
          </li>
          <li>
            <strong className="text-neutral-textPrimary dark:text-white">Application preferences</strong> — Theme preference (light or dark mode) saved locally on your device.
          </li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>All information collected is used exclusively to provide the core features of this application:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li>To display and manage student attendance records.</li>
          <li>To generate attendance reports and summaries.</li>
          <li>To identify and authenticate administrators securely.</li>
          <li>To associate attendance data with the correct organisation.</li>
        </ul>
        <p>
          We do <strong className="text-neutral-textPrimary dark:text-white">not</strong> use your data for advertising, profiling, or any commercial purpose beyond the core application function.
        </p>
      </Section>

      <Section title="4. Data Storage Using Supabase">
        <p>
          This application uses <strong className="text-neutral-textPrimary dark:text-white">Supabase</strong> as its backend database and authentication provider. Supabase stores data on secure cloud infrastructure. All data transmitted between the application and Supabase is encrypted using industry-standard TLS (Transport Layer Security).
        </p>
        <p>
          Supabase enforces Row Level Security (RLS) policies, which means each organisation administrator can only access data belonging to their own organisation. No administrator can view or modify another organisation's data.
        </p>
      </Section>

      <Section title="5. Security">
        <p>
          We take reasonable steps to protect your data, including:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li>Encrypted communication between the app and database.</li>
          <li>Role-based access control — only authorised users can access the application.</li>
          <li>Row-level security policies that prevent cross-organisation data access.</li>
          <li>Authentication managed by Supabase Auth with secure session handling.</li>
        </ul>
        <p>
          While we implement strong security measures, no system is completely immune to risks. We encourage administrators to use strong passwords and log out when not using a shared device.
        </p>
      </Section>

      <Section title="6. Data Ownership">
        <p>
          All student and attendance data entered into this application belongs to the organisation that created it. Assufa Dars does not claim any ownership over your data. You retain full control and may request deletion of your organisation's data at any time by contacting us.
        </p>
      </Section>

      <Section title="7. User Responsibilities">
        <p>
          As an administrator, you are responsible for:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li>Entering accurate student and attendance information.</li>
          <li>Keeping your login credentials confidential.</li>
          <li>Ensuring that only authorised persons have access to the application account.</li>
          <li>Obtaining appropriate consent from students or guardians where required by local law before recording personal details.</li>
        </ul>
      </Section>

      <Section title="8. No Third-Party Selling of Data">
        <p>
          We do <strong className="text-neutral-textPrimary dark:text-white">not</strong> sell, rent, trade, or share your data with any third parties for commercial purposes. Your student and attendance data is never disclosed to advertisers, analytics platforms, or external services beyond the infrastructure required to operate this application (Supabase).
        </p>
      </Section>

      <Section title="9. Data Retention">
        <p>
          Data is retained for as long as your organisation's account is active. If you wish to delete your organisation's data, please contact us using the details below, and we will process your request promptly.
        </p>
      </Section>

      <Section title="10. Children's Privacy">
        <p>
          This application may store the names and attendance records of minor students. This information is entered by authorised administrators only and is used solely for attendance tracking. We do not collect any personal information directly from students.
        </p>
      </Section>

      <Section title="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. Any significant changes will be communicated within the application. Continued use of the application after updates constitutes acceptance of the revised policy.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please contact us:
        </p>
        <div className="mt-2 rounded-input border border-neutral-border dark:border-neutral-700 bg-neutral-bg dark:bg-neutral-800/60 p-4 space-y-1">
          <p><strong className="text-neutral-textPrimary dark:text-white">Application:</strong> Assufa Dars</p>
          <p><strong className="text-neutral-textPrimary dark:text-white">Email:</strong> support@assufadars.com</p>
          <p><strong className="text-neutral-textPrimary dark:text-white">Organisation:</strong> Assufa Dars Management</p>
        </div>
      </Section>
    </article>
  );
};
