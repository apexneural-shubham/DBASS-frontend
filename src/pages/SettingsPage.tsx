import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Bell, 
  CreditCard, 
  Settings as SettingsIcon, 
  Shield, 
  BarChart3,
  Key,
  Download,
  Trash2
} from 'lucide-react';
import AccountSettings from '@/components/settings/AccountSettings';
import PreferencesSettings from '@/components/settings/PreferencesSettings';
import BillingSettings from '@/components/settings/BillingSettings';
import AdvancedSettings from '@/components/settings/AdvancedSettings';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('account');

  const settingsTabs = [
    {
      id: 'account',
      label: 'Account',
      icon: User,
      description: 'Profile, security, and notifications'
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: SettingsIcon,
      description: 'General settings and API configuration'
    },
    {
      id: 'billing',
      label: 'Billing & Plans',
      icon: CreditCard,
      description: 'Plans, usage, and billing history'
    },
    {
      id: 'advanced',
      label: 'Advanced',
      icon: Shield,
      description: 'API keys, data export, and account actions'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-slate-400 text-lg">
                Manage your account, preferences, and billing
              </p>
            </div>
          </div>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 p-2 rounded-2xl">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Content */}
            <div className="space-y-6">
              {settingsTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-slate-800/50 rounded-lg">
                        <tab.icon className="h-5 w-5 text-orange-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{tab.label}</h2>
                        <p className="text-slate-400">{tab.description}</p>
                      </div>
                    </div>

                    {/* Render appropriate component based on tab */}
                    {tab.id === 'account' && <AccountSettings />}
                    {tab.id === 'preferences' && <PreferencesSettings />}
                    {tab.id === 'billing' && <BillingSettings />}
                    {tab.id === 'advanced' && <AdvancedSettings />}
                  </motion.div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </motion.div>
      </div>
  );
};

export default SettingsPage;
