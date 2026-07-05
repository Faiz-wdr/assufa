import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MessageSquare, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/CoreUI';
import { useAuth } from '@/features/auth/AuthContext';

export const Support: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [copiedType, setCopiedType] = useState<'email' | 'phone' | null>(null);

  const contactDetails = {
    email: 'fayiz.kappil@gmail.com',
    phone: '7025199683'
  };

  const handleCopy = async (text: string, type: 'email' | 'phone', label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      toast(`${label} copied.`, 'success');
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedType(null);
      }, 2000);
    } catch (err) {
      toast('Failed to copy to clipboard.', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeInOut' }}
      className="space-y-6 text-left pb-8"
    >
      {/* Title Bar with Back Button */}
      <div className="flex items-center space-x-3.5">
        <button
          onClick={() => {
            if (user) {
              navigate(-1);
            } else {
              navigate('/login');
            }
          }}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white dark:bg-neutral-800 border border-neutral-border dark:border-neutral-700 text-neutral-textPrimary dark:text-white hover:bg-neutral-bg dark:hover:bg-neutral-700 active:scale-95 transition-all focus:outline-none"
          title="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-textPrimary dark:text-white leading-tight">
            Support
          </h1>
        </div>
      </div>

      {/* Info Message Box */}
      <Card className="p-4 bg-white dark:bg-neutral-800 border border-neutral-border dark:border-neutral-700 shadow-soft">
        <p className="text-small text-neutral-textSecondary dark:text-neutral-300 leading-relaxed font-medium">
          {user ? (
            <>
              If you need assistance using the application, please read the{' '}
              <Link
                to="/settings/help"
                className="text-primary dark:text-primary-hover font-semibold hover:underline"
              >
                Help section
              </Link>{' '}
              first. If your issue is not resolved, feel free to contact support using the details below. We will respond within 24 hours.
            </>
          ) : (
            <>
              If you need assistance using the application, please contact support using the details below. We will respond within 24 hours.
            </>
          )}
        </p>
      </Card>

      {/* Contact Details List */}
      <div className="space-y-3.5">
        {/* Email Contact Card */}
        <div
          onClick={() => handleCopy(contactDetails.email, 'email', 'Email')}
          className="group rounded-card border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-soft hover:border-primary dark:hover:border-primary/50 transition-all flex items-center justify-between cursor-pointer select-none active:scale-[0.99]"
        >
          <div className="flex items-center space-x-3.5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary-soft dark:bg-primary/20 text-primary">
              <Mail className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-textSecondary dark:text-neutral-400 block leading-none">
                Email
              </span>
              <span className="font-bold text-body-lg text-neutral-textPrimary dark:text-white mt-1.5 block leading-none break-all">
                {contactDetails.email}
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(contactDetails.email, 'email', 'Email');
            }}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-btn bg-neutral-bg dark:bg-neutral-700 text-neutral-textSecondary dark:text-neutral-300 hover:bg-neutral-border/40 dark:hover:bg-neutral-600 transition-colors active:scale-95"
            title="Copy email address"
          >
            {copiedType === 'email' ? (
              <Check className="h-4.5 w-4.5 text-success" />
            ) : (
              <Copy className="h-4.5 w-4.5 group-hover:text-primary transition-colors" />
            )}
          </button>
        </div>

        {/* WhatsApp Contact Card */}
        <div
          onClick={() => handleCopy(contactDetails.phone, 'phone', 'Phone number')}
          className="group rounded-card border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-soft hover:border-info dark:hover:border-info/50 transition-all flex items-center justify-between cursor-pointer select-none active:scale-[0.99]"
        >
          <div className="flex items-center space-x-3.5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-cyan-50 dark:bg-cyan-900/20 text-info">
              <MessageSquare className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-textSecondary dark:text-neutral-400 block leading-none">
                WhatsApp
              </span>
              <span className="font-bold text-body-lg text-neutral-textPrimary dark:text-white mt-1.5 block leading-none">
                {contactDetails.phone}
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(contactDetails.phone, 'phone', 'Phone number');
            }}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-btn bg-neutral-bg dark:bg-neutral-700 text-neutral-textSecondary dark:text-neutral-300 hover:bg-neutral-border/40 dark:hover:bg-neutral-600 transition-colors active:scale-95"
            title="Copy phone number"
          >
            {copiedType === 'phone' ? (
              <Check className="h-4.5 w-4.5 text-success" />
            ) : (
              <Copy className="h-4.5 w-4.5 group-hover:text-info transition-colors" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
