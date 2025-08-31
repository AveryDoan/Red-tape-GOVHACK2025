import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import DashboardRegBot from './DashboardRegBot';

export default function FloatingDashboardBot({ businessProfile }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 50 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <Button
                size="lg"
                className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 shadow-lg"
                onClick={() => setIsOpen(true)}
              >
                <Bot className="w-8 h-8" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 w-[calc(100%-3rem)] sm:w-96 h-[70vh] max-h-[500px]"
          >
            <DashboardRegBot 
              businessProfile={businessProfile} 
              onClose={() => setIsOpen(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}