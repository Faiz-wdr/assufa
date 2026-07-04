import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2">
    <h2 className="text-body-lg font-bold text-foreground">{title}</h2>
    <div className="text-small text-muted-foreground leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute inset-0 z-10 flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--legal-bg)' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border px-4 theme-transition"
        style={{ backgroundColor: 'var(--header-bg)' }}>
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-btn text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-body-lg font-bold text-foreground tracking-tight">Privacy Policy</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-7">
        {/* Header Badge */}
        <div className="flex items-center gap-3 p-4 rounded-card border border-border"
          style={{ backgroundColor: 'var(--surface-raised)' }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-caption font-bold text-foreground">Assufa Dars App</p>
            <p className="text-caption text-muted-foreground">Last updated: July 2026</p>
          </div>
        </div>

        <Section title="1. Purpose of This App">
          <p>
            Assufa Dars is a private attendance management application built exclusively for Islamic class administrators. It allows organization administrators to register students, record daily attendance, and generate reports for internal use.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, and protect information entered into this application.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following types of information to operate the application:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Student Information:</strong> Names, place of residence, and phone numbers of registered students.</li>
            <li><strong className="text-foreground">Attendance Records:</strong> Daily attendance statuses (Present, Absent, or Excused) linked to each student.</li>
            <li><strong className="text-foreground">Authentication Information:</strong> Your email address and password, managed securely through Supabase Auth.</li>
            <li><strong className="text-foreground">Organization Data:</strong> Your class or organization name, location, and contact details.</li>
            <li><strong className="text-foreground">Preferences:</strong> Your selected application theme (Light or Dark), stored alongside your profile.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>Information collected within the application is used solely for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Registering and managing student rosters for your organization.</li>
            <li>Recording, displaying, and exporting attendance data.</li>
            <li>Authenticating administrators and maintaining secure sessions.</li>
            <li>Generating reports to assist administrators in tracking class performance.</li>
            <li>Remembering your application appearance preferences.</li>
          </ul>
        </Section>

        <Section title="4. Data Storage">
          <p>
            All application data is stored securely using <strong className="text-foreground">Supabase</strong>, a trusted cloud database platform. Supabase employs industry-standard encryption for data at rest and in transit (HTTPS/TLS). Row-Level Security (RLS) policies ensure that each organization can only access its own data.
          </p>
          <p>
            No data is stored locally on your device beyond your authentication session token and theme preference.
          </p>
        </Section>

        <Section title="5. Security">
          <p>
            We take data security seriously. The following measures are in place to protect your data:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>All communications are encrypted via HTTPS.</li>
            <li>Passwords are managed by Supabase Auth and are never stored in plain text.</li>
            <li>Database Row-Level Security (RLS) prevents cross-organization data access.</li>
            <li>Only authenticated administrators can view or modify data.</li>
          </ul>
        </Section>

        <Section title="6. Data Ownership">
          <p>
            All data entered into the application — including student information, attendance records, and organization details — belongs exclusively to your organization. We do not claim any ownership over your data.
          </p>
          <p>
            You are responsible for maintaining the accuracy of data entered into the system and for managing access to your administrator account.
          </p>
        </Section>

        <Section title="7. Third-Party Services">
          <p>
            This application uses the following third-party service:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Supabase:</strong> Used for database storage, authentication, and Row-Level Security. Supabase's privacy policy applies to the storage infrastructure.</li>
          </ul>
          <p>
            <strong className="text-foreground">We do not sell, share, or disclose your data to any other third parties</strong> for marketing, advertising, or any commercial purpose.
          </p>
        </Section>

        <Section title="8. User Responsibilities">
          <p>As an administrator using this application, you are responsible for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Keeping your account credentials secure and confidential.</li>
            <li>Ensuring that student data entered is accurate and obtained with appropriate consent.</li>
            <li>Securely handling any exported attendance reports.</li>
            <li>Promptly informing us if you suspect unauthorized access to your account.</li>
          </ul>
        </Section>

        <Section title="9. Data Retention">
          <p>
            Your organization's data is retained for as long as your account remains active. If you wish to have your data deleted, please contact the application administrator.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact the application administrator of your organization.
          </p>
          <p>
            This Privacy Policy may be updated periodically. Continued use of the application constitutes acceptance of any updated policy.
          </p>
        </Section>

        <div className="pt-4 pb-2 border-t border-border">
          <p className="text-caption text-muted-foreground text-center">
            © 2026 Assufa Dars · All rights reserved
          </p>
        </div>
      </div>
    </motion.div>
  );
};
