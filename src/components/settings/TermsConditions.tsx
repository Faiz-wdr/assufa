import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ScrollText } from 'lucide-react';

interface TermsConditionsProps {
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

export const TermsConditions: React.FC<TermsConditionsProps> = ({ onBack }) => {
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
        <h1 className="text-body-lg font-bold text-foreground tracking-tight">Terms & Conditions</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-7">
        {/* Header Badge */}
        <div className="flex items-center gap-3 p-4 rounded-card border border-border"
          style={{ backgroundColor: 'var(--surface-raised)' }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
            <ScrollText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-caption font-bold text-foreground">Assufa Dars App</p>
            <p className="text-caption text-muted-foreground">Last updated: July 2026</p>
          </div>
        </div>

        <p className="text-small text-muted-foreground leading-relaxed">
          Please read these Terms and Conditions carefully before using the Assufa Dars application. By accessing or using the application, you agree to be bound by these terms.
        </p>

        <Section title="1. Purpose of the Application">
          <p>
            Assufa Dars is a private attendance management application designed for use by Islamic class organizations. It provides tools for registering students, recording attendance, and generating reports. The application is intended solely for internal, non-commercial use by authorized administrators.
          </p>
        </Section>

        <Section title="2. Organization Responsibilities">
          <p>
            Each organization using this application is responsible for:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Maintaining accurate and up-to-date records within the system.</li>
            <li>Ensuring that student data is collected and stored with appropriate consent.</li>
            <li>Managing access to the application and ensuring only authorized personnel have administrator accounts.</li>
            <li>Complying with applicable local data protection and privacy laws.</li>
          </ul>
        </Section>

        <Section title="3. Administrator Responsibilities">
          <p>As an authorized administrator, you agree to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the application honestly and only for its intended purpose of attendance management.</li>
            <li>Keep your login credentials secure and not share them with unauthorized individuals.</li>
            <li>Ensure that attendance records are entered accurately and in a timely manner.</li>
            <li>Handle exported reports responsibly and limit distribution to authorized parties only.</li>
            <li>Notify the application administrator immediately upon discovering any unauthorized use of your account.</li>
          </ul>
        </Section>

        <Section title="4. Accuracy of Attendance Records">
          <p>
            The accuracy of attendance records is the sole responsibility of the organization administrator recording the data. The application serves as a tool to assist in tracking attendance and does not independently verify the accuracy of data entered.
          </p>
          <p>
            We are not liable for errors, omissions, or disputes arising from inaccurate attendance records.
          </p>
        </Section>

        <Section title="5. Data Ownership">
          <p>
            All data entered into the application — including student profiles, attendance records, and organization details — remains the exclusive property of the respective organization. We do not claim ownership over any data you enter.
          </p>
          <p>
            You grant us a limited, non-exclusive licence to store and process this data solely for the purpose of providing the application's services to you.
          </p>
        </Section>

        <Section title="6. Prohibited Usage">
          <p>You agree not to use the application for any of the following:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Entering false, misleading, or fraudulent information.</li>
            <li>Accessing data belonging to other organizations.</li>
            <li>Attempting to reverse-engineer, hack, or disrupt the application or its underlying infrastructure.</li>
            <li>Using the application for any commercial purpose or reselling access to third parties.</li>
            <li>Sharing exported attendance reports publicly or with unauthorized individuals.</li>
          </ul>
        </Section>

        <Section title="7. Account Security">
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. If you suspect that your account has been compromised, you must change your password immediately and inform the super administrator.
          </p>
          <p>
            We are not liable for any loss or damage resulting from unauthorized access to your account caused by your failure to maintain account security.
          </p>
        </Section>

        <Section title="8. Export Responsibility">
          <p>
            The Excel reports generated by this application are provided as-is for your internal administrative use. You are solely responsible for the accuracy, distribution, and security of exported files.
          </p>
          <p>
            Do not share exported attendance reports containing personally identifiable student information with unauthorized parties.
          </p>
        </Section>

        <Section title="9. Service Availability">
          <p>
            We aim to keep the application available at all times; however, we do not guarantee uninterrupted access. The application may be temporarily unavailable due to scheduled maintenance, infrastructure updates, or circumstances beyond our control.
          </p>
          <p>
            We are not liable for any losses arising from service downtime or temporary unavailability.
          </p>
        </Section>

        <Section title="10. Future Updates">
          <p>
            We reserve the right to update or modify the application and these Terms and Conditions at any time. Updates may include new features, changes to existing functionality, or bug fixes.
          </p>
          <p>
            Continued use of the application after any changes to these Terms constitutes your acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>
            To the fullest extent permitted by applicable law, we are not liable for any direct, indirect, incidental, special, or consequential damages arising from your use of this application, including but not limited to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Loss of data due to user error or network failure.</li>
            <li>Inaccurate attendance records entered by administrators.</li>
            <li>Misuse or unauthorized distribution of exported reports.</li>
            <li>Service interruptions caused by third-party infrastructure providers.</li>
          </ul>
        </Section>

        <Section title="12. Termination">
          <p>
            Access to the application may be terminated or suspended if you violate any of these Terms and Conditions. Upon termination, your right to use the application immediately ceases.
          </p>
          <p>
            If you wish to delete your organization's account and data, please contact the super administrator.
          </p>
        </Section>

        <Section title="13. Contact Information">
          <p>
            If you have any questions about these Terms and Conditions or the operation of the application, please contact the super administrator of your organization.
          </p>
          <p>
            These Terms and Conditions were last updated in July 2026 and supersede all previous versions.
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
