import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PersonalInfo } from '../types';

interface FooterProps {
  personalInfo: PersonalInfo;
}

const Footer: React.FC<FooterProps> = ({ personalInfo }) => {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: '-50px' });

  return (
    <motion.footer
      ref={footerRef}
      className="bg-gradient-to-r from-secondary-800 to-secondary-900 text-white rounded-t-[3rem] mt-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
      transition={{ duration: 0.8 }}
      role="contentinfo"
    >
      <div className="container-responsive py-12">
        {/* Main Footer Content */}
        <div className="text-center">
          {/* Logo/Name */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.h3
              className="text-responsive-2xl font-bold text-white mb-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {personalInfo.name}
            </motion.h3>
            <motion.p
              className="text-secondary-300 text-responsive-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: isInView ? 1 : 0 }}
              transition={{ delay: 0.4 }}
            >
              {personalInfo.title}
            </motion.p>
          </motion.div>

          {/* Divider */}
          <motion.div
            className="w-24 h-1 bg-primary mx-auto mb-6 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: isInView ? 96 : 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />

          {/* Footer Message */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-secondary-200 text-responsive-lg leading-relaxed max-w-2xl mx-auto">
              ご覧いただきありがとうございます。
              <br />
              何かご質問やご相談がございましたら、お気軽にお声がけください。
            </p>
          </motion.div>

          {/* Copyright */}
          <motion.div
            className="border-t border-secondary-700 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-secondary-400 text-responsive-sm flex items-center justify-center gap-2">
              © {currentYear} {personalInfo.name}. All rights reserved.
              <motion.span
                className="text-red-400"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                aria-label="ハート"
              >
                ♥
              </motion.span>
              Made with passion
            </p>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
