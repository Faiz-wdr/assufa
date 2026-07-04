import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  Info,
  PlayCircle,
  UserPlus,
  FileDown,
  CalendarDays,
  FileText,
  Download,
  SunMoon,
  MapPin,
  Share2,
  ListChecks,
  HelpCircle
} from 'lucide-react';
import { Card } from '@/components/ui/CoreUI';

// Accordion Component for FAQs
interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQAccordionItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-[12px] border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden shadow-soft">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 font-bold text-small text-neutral-textPrimary dark:text-white select-none text-left focus:outline-none hover:bg-neutral-bg/20 dark:hover:bg-neutral-700/20 transition-colors"
      >
        <span>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
          className="text-neutral-textSecondary dark:text-neutral-400 flex-shrink-0 ml-4"
        >
          <ChevronDown className="h-4.5 w-4.5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="px-4 pb-4 text-xs font-semibold text-neutral-textSecondary dark:text-neutral-300 leading-relaxed border-t border-neutral-border/50 dark:border-neutral-700/50 pt-3">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Help Page Component
export const Help: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Introduction',
      icon: <Info className="h-5 w-5 text-primary" />,
      iconBg: 'bg-primary-soft dark:bg-primary/20',
      content: (
        <div className="space-y-2">
          <p>
            Nattu Dars Attendance is a simple attendance management application designed for weekly Nattu Dars classes.
          </p>
          <p className="font-bold">It helps administrators:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Manage students roster</li>
            <li>Take weekly class attendance</li>
            <li>View detailed attendance history</li>
            <li>Calculate active attendance percentage</li>
            <li>Export reports for backup or record-keeping</li>
          </ul>
        </div>
      )
    },
    {
      title: 'Getting Started',
      icon: <PlayCircle className="h-5 w-5 text-indigo-500" />,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/20',
      content: (
        <ul className="list-decimal pl-4 space-y-1">
          <li>Login using your registered email and password.</li>
          <li>After logging in, you will be redirected to the Home screen.</li>
          <li>Make sure to add students to your list before recording attendance.</li>
        </ul>
      )
    },
    {
      title: 'Adding Students',
      icon: <UserPlus className="h-5 w-5 text-emerald-500" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/20',
      content: (
        <div className="space-y-2">
          <p>
            Go to the <span className="font-bold text-neutral-textPrimary dark:text-white">Students</span> tab, tap the <span className="font-bold text-primary">+ Add Student</span> button, then enter the student's Name, Place, and Phone Number.
          </p>
          <p>
            After tapping <span className="font-bold text-primary">Save Student</span>, they will automatically appear in alphabetical order. You can also import multiple students at once.
          </p>
        </div>
      )
    },
    {
      title: 'Importing Students',
      icon: <FileDown className="h-5 w-5 text-amber-500" />,
      iconBg: 'bg-amber-50 dark:bg-amber-950/20',
      content: (
        <div className="space-y-2">
          <p>
            Go to the <span className="font-bold text-neutral-textPrimary dark:text-white">Students</span> tab and tap <span className="font-bold text-neutral-textPrimary dark:text-white">Import</span>.
          </p>
          <p>
            Download the sample CSV file, prepare your student list using the exact same columns, and upload it. All valid student profiles will be imported automatically.
          </p>
        </div>
      )
    },
    {
      title: 'Taking Attendance',
      icon: <CalendarDays className="h-5 w-5 text-pink-500" />,
      iconBg: 'bg-pink-50 dark:bg-pink-950/20',
      content: (
        <div className="space-y-2">
          <p>
            Go to the <span className="font-bold text-neutral-textPrimary dark:text-white">Attendance</span> tab and select the correct date. All students are marked Present by default.
          </p>
          <p>
            Tap on any student who is absent to toggle their status. The attendance summary updates instantly. Tap <span className="font-bold text-primary">Save Attendance</span> when finished. Roster sheets can be edited later.
          </p>
        </div>
      )
    },
    {
      title: 'Viewing Reports',
      icon: <FileText className="h-5 w-5 text-violet-500" />,
      iconBg: 'bg-violet-50 dark:bg-violet-950/20',
      content: (
        <div className="space-y-2">
          <p>
            Open the <span className="font-bold text-neutral-textPrimary dark:text-white">Reports</span> tab to view all recorded attendance listings grouped by date.
          </p>
          <p>
            Tap any date card to view the list of present and absent students alongside the attendance percentage. You can choose to Edit or Delete records from here.
          </p>
        </div>
      )
    },
    {
      title: 'Exporting Reports',
      icon: <Download className="h-5 w-5 text-sky-500" />,
      iconBg: 'bg-sky-50 dark:bg-sky-950/20',
      content: (
        <div className="space-y-2">
          <p>
            Go to the <span className="font-bold text-neutral-textPrimary dark:text-white">Settings</span> page and tap <span className="font-bold text-neutral-textPrimary dark:text-white">Export Attendance Report</span>.
          </p>
          <p>
            Choose the desired start and end dates and tap <span className="font-bold text-primary">Export Excel</span> to save the generated spreadsheet to your device.
          </p>
        </div>
      )
    },
    {
      title: 'Changing Theme',
      icon: <SunMoon className="h-5 w-5 text-orange-500" />,
      iconBg: 'bg-orange-50 dark:bg-orange-950/20',
      content: (
        <p>
          Go to <span className="font-bold text-neutral-textPrimary dark:text-white">Settings</span>, find the <span className="font-bold text-neutral-textPrimary dark:text-white">Theme</span> card, and choose either <span className="font-bold text-neutral-textPrimary dark:text-white">Light</span> or <span className="font-bold text-neutral-textPrimary dark:text-white">Dark</span>. The interface theme will update instantly.
        </p>
      )
    },
    {
      title: 'Updating Class Information',
      icon: <MapPin className="h-5 w-5 text-red-500" />,
      iconBg: 'bg-red-50 dark:bg-red-950/20',
      content: (
        <p>
          Open <span className="font-bold text-neutral-textPrimary dark:text-white">Settings</span> and tap <span className="font-bold text-neutral-textPrimary dark:text-white">Class Place</span>. Update the class name or location details, and the top header of the application will refresh automatically.
        </p>
      )
    },
    {
      title: 'Sharing Attendance Reports',
      icon: <Share2 className="h-5 w-5 text-teal-500" />,
      iconBg: 'bg-teal-50 dark:bg-teal-950/20',
      content: (
        <p>
          After exporting the Excel report or generating a daily report, you can share the file directly using any sharing utility on your device, such as WhatsApp, Email, or Google Drive.
        </p>
      )
    },
    {
      title: 'Best Practices',
      icon: <ListChecks className="h-5 w-5 text-rose-500" />,
      iconBg: 'bg-rose-50 dark:bg-rose-950/20',
      content: (
        <ul className="list-disc pl-4 space-y-1.5 font-semibold text-neutral-textPrimary dark:text-white">
          <li>Record attendance immediately when the class starts.</li>
          <li>Double-check absent student lists before saving the sheet.</li>
          <li>Keep student phone numbers up to date to ease contact.</li>
          <li>Export reports regularly as a backup measure.</li>
          <li>Never share your credentials with others.</li>
        </ul>
      )
    }
  ];

  const faqs = [
    {
      question: 'How do I take attendance?',
      answer: 'Open the Attendance page, select the date, tap absent students to change their status to absent, then tap Save.'
    },
    {
      question: 'Can I edit attendance after saving?',
      answer: 'Yes. Open the Reports tab, find and tap the attendance date, then choose the Edit option.'
    },
    {
      question: 'How do I add many students at once?',
      answer: 'Use the Import option in the Students page and upload a properly formatted CSV or Excel file.'
    },
    {
      question: 'How do I export attendance reports?',
      answer: 'Open Settings, choose Export Attendance Report, select your preferred date range, and tap Export Excel.'
    },
    {
      question: 'I forgot my password. What should I do?',
      answer: 'Please contact your Organization Administrator or the application support administrator to reset your password.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeInOut' }}
      className="space-y-6 text-left pb-10"
    >
      {/* Title Bar with Back Button */}
      <div className="flex items-center space-x-3.5">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white dark:bg-neutral-800 border border-neutral-border dark:border-neutral-700 text-neutral-textPrimary dark:text-white hover:bg-neutral-bg dark:hover:bg-neutral-700 active:scale-95 transition-all focus:outline-none"
          title="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-textPrimary dark:text-white leading-tight">
            Help
          </h1>
        </div>
      </div>

      {/* Guide Sections */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <Card
            key={idx}
            className="p-5 bg-white dark:bg-neutral-800 border border-neutral-border dark:border-neutral-700 shadow-soft space-y-3.5"
          >
            <div className="flex items-center space-x-3.5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${section.iconBg}`}>
                {section.icon}
              </div>
              <h2 className="text-body-lg font-bold text-neutral-textPrimary dark:text-white">
                {section.title}
              </h2>
            </div>
            <div className="text-xs font-semibold text-neutral-textSecondary dark:text-neutral-300 leading-relaxed pl-1">
              {section.content}
            </div>
          </Card>
        ))}
      </div>

      {/* FAQ Accordion Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-3.5 px-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-amber-50 dark:bg-amber-950/20 text-amber-500">
            <HelpCircle className="h-5.5 w-5.5" />
          </div>
          <h2 className="text-h2 font-extrabold text-neutral-textPrimary dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <FAQAccordionItem
              key={idx}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
