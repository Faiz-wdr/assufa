import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Avatar, 
  Badge, 
  Tabs, 
  SearchBar, 
  SectionHeader, 
  StatCard, 
  Skeleton, 
  EmptyState, 
  ErrorState 
} from '@/components/ui/CoreUI';
import { 
  Input, 
  Switch, 
  Checkbox, 
  RadioGroup, 
  Dropdown, 
  DatePicker 
} from '@/components/ui/FormComponents';
import { useToast, ToastProvider } from '@/components/ui/Toast';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Dialog } from '@/components/ui/Dialog';
import { Plus, Settings, ClipboardCheck } from 'lucide-react';

const ShowroomContent: React.FC = () => {
  const { toast } = useToast();
  
  // Interactive Component States
  const [activeTab, setActiveTab] = useState('core');
  const [searchValue, setSearchValue] = useState('');
  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState('');
  
  // Controls
  const [switchVal, setSwitchVal] = useState(true);
  const [checkVal, setCheckVal] = useState(false);
  const [radioVal, setRadioVal] = useState('admin');
  const [selectVal, setSelectVal] = useState('valanchery');
  const [dateVal, setDateVal] = useState('2026-07-02');
  
  // Modal Overlays
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const tabOptions = [
    { id: 'core', label: 'Core UI' },
    { id: 'forms', label: 'Forms' },
    { id: 'overlays', label: 'Overlays' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-neutral-textPrimary tracking-tight">Showroom</h1>
        <p className="text-small text-neutral-textSecondary">
          Interactive catalog of Assufa Dars UI Components and design tokens.
        </p>
      </div>

      {/* Tabs Switcher */}
      <Tabs 
        options={tabOptions} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* 1. CORE UI TAB */}
      {activeTab === 'core' && (
        <div className="space-y-5">
          {/* Buttons Section */}
          <Card className="space-y-4">
            <SectionHeader title="Buttons" subtitle="Small (40px), Medium (48px), Large (56px) heights" />
            
            <div className="flex flex-col space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm">Primary Sm</Button>
                <Button variant="primary" size="md">Primary Md</Button>
                <Button variant="primary" size="lg">Primary Lg</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="md">Secondary</Button>
                <Button variant="ghost" size="md">Ghost Button</Button>
                <Button variant="danger" size="md">Danger Button</Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="icon" icon={Settings} title="Settings" />
                <Button variant="fab" icon={Plus} title="Add" />
                <span className="text-caption text-neutral-textSecondary">FAB & Icon styles</span>
              </div>
            </div>
          </Card>

          {/* Search Bar Section */}
          <Card className="space-y-4">
            <SectionHeader title="Search Bar" subtitle="Clean lookup input with inline search icon" />
            <SearchBar 
              value={searchValue} 
              onChange={setSearchValue} 
              placeholder="Search class students..." 
            />
          </Card>

          {/* Cards & Badges Section */}
          <Card className="space-y-4">
            <SectionHeader title="Badges & Avatars" />
            
            <div className="flex items-center space-x-4">
              <Avatar name="Ahmad Khan" size="sm" />
              <Avatar name="Muhammad Bilal" size="md" />
              <Avatar name="Zainab Naji" size="lg" />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="neutral">Neutral</Badge>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              label="Present Today" 
              value="42" 
              trend={{ value: "+12%", type: "positive" }} 
            />
            <StatCard 
              label="Total Students" 
              value="128" 
              trend={{ value: "Stable", type: "neutral" }} 
            />
          </div>

          {/* Skeletons & States */}
          <Card className="space-y-3">
            <SectionHeader title="Skeleton Loading" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </div>
          </Card>

          <EmptyState 
            title="No Attendance Logs" 
            description="You haven't recorded attendance for this class session yet." 
            icon={ClipboardCheck}
            actionLabel="Start Seeding"
            onAction={() => toast("Starting database setup...")}
          />
        </div>
      )}

      {/* 2. FORMS TAB */}
      {activeTab === 'forms' && (
        <div className="space-y-5">
          <Card className="space-y-4">
            <SectionHeader title="Text Inputs" subtitle="Standard 52px high inputs" />
            
            <Input 
              label="Full Name" 
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (e.target.value.length < 3) {
                  setInputError("Name is too short");
                } else {
                  setInputError("");
                }
              }}
              placeholder="e.g. Ahmad Khan"
              error={inputError}
              helperText="Enter the student's legal name."
            />

            <Input 
              label="Disabled input" 
              value="Uneditable text"
              disabled
              placeholder="Disabled"
            />
          </Card>

          <Card className="space-y-4">
            <SectionHeader title="Controls" subtitle="Friendly touch checkboxes and toggles" />
            
            <div className="flex flex-col space-y-4">
              <Switch 
                checked={switchVal} 
                onChange={setSwitchVal} 
                label={`Status toggle is: ${switchVal ? 'ON' : 'OFF'}`}
              />

              <Checkbox 
                checked={checkVal} 
                onChange={setCheckVal} 
                label="Check to verify students list"
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <SectionHeader title="Group Selectors" />
            
            <RadioGroup 
              options={[
                { value: 'admin', label: 'Organization Admin' },
                { value: 'super', label: 'Super Admin' },
              ]}
              selectedValue={radioVal}
              onChange={radioVal => setRadioVal(radioVal)}
            />

            <hr className="border-neutral-border" />

            <Dropdown 
              label="Location"
              options={[
                { value: 'valanchery', label: 'Valanchery' },
                { value: 'kottakkal', label: 'Kottakkal' },
                { value: 'tirur', label: 'Tirur' },
              ]}
              value={selectVal}
              onChange={e => setSelectVal(e.target.value)}
            />

            <DatePicker 
              label="Class Date" 
              value={dateVal}
              onChange={setDateVal}
            />
          </Card>
        </div>
      )}

      {/* 3. OVERLAYS TAB */}
      {activeTab === 'overlays' && (
        <div className="space-y-5">
          <Card className="space-y-4">
            <SectionHeader title="Toast Alerts" subtitle="Slide-up notifications" />
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => toast("Success message triggered!", "success")}>
                Toast Success
              </Button>
              <Button variant="secondary" onClick={() => toast("Network error occurred!", "error")}>
                Toast Error
              </Button>
              <Button variant="secondary" onClick={() => toast("Class begins in 10m", "info")}>
                Toast Info
              </Button>
              <Button variant="secondary" onClick={() => toast("Offline storage is low", "warning")}>
                Toast Warning
              </Button>
            </div>
          </Card>

          <Card className="space-y-4">
            <SectionHeader title="Sheets & Modals" subtitle="Bottom Sheets and Confirmation Alerts" />
            
            <div className="flex flex-col space-y-2">
              <Button variant="primary" onClick={() => setIsSheetOpen(true)}>
                Open Bottom Sheet
              </Button>
              <Button variant="secondary" onClick={() => setIsDialogOpen(true)}>
                Open Confirmation Dialog
              </Button>
            </div>
          </Card>

          <ErrorState 
            title="Database Connection Lost" 
            description="The internet connection was interrupted. Please review network settings." 
            onRetry={() => toast("Retrying query...")}
          />
        </div>
      )}

      {/* 4. MODALS & OVERLAYS INJECTION POINT */}
      <BottomSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)}
        title="Add New Student"
      >
        <div className="space-y-4 pt-2">
          <p className="text-small text-neutral-textSecondary">
            Fill in the details to enroll a student in this class.
          </p>
          <Input label="Name" placeholder="e.g. Bilal" />
          <Input label="Place" placeholder="e.g. Valanchery" />
          <div className="flex space-x-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={() => {
              setIsSheetOpen(false);
              toast("Student Ahmad added successfully!");
            }}>Save Student</Button>
          </div>
        </div>
      </BottomSheet>

      <Dialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={() => toast("Settings wiped out!", "error")}
        title="Reset Class Settings?"
        description="This action cannot be undone. All active attendance logs for today will be cleared."
        confirmLabel="Reset Logs"
        variant="danger"
      />
    </div>
  );
};

export const Showroom: React.FC = () => {
  return (
    <ToastProvider>
      <ShowroomContent />
    </ToastProvider>
  );
};
