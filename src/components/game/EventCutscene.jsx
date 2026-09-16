import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WeddingScene from './scenes/WeddingScene';
import HospitalScene from './scenes/HospitalScene';
import PromotionScene from './scenes/PromotionScene';
import JobLossScene from './scenes/JobLossScene';
import MarketCrashScene from './scenes/MarketCrashScene';
import DefaultEventScene from './scenes/DefaultEventScene';

export default function EventCutscene({ event, onChoice }) {
  if (!event) return null;

  const getSceneComponent = () => {
    switch (event.id) {
      case 'wedding':
      case 'marriage':
      case 'marriage_event':
      case 'family_wedding':
        return WeddingScene;
      case 'hospital':
      case 'health_issue':
      case 'medical_emergency':
      case 'uninsured_illness':
        return HospitalScene;
      case 'promotion':
      case 'salary_hike':
      case 'senior_job_offer':
      case 'work_bonus':
        return PromotionScene;
      case 'job_loss':
        return JobLossScene;
      case 'market_crash':
      case 'mf_correction':
      case 'scam_fraud':
      case 'theft':
        return MarketCrashScene;
      default:
        return DefaultEventScene;
    }
  };

  const SceneComponent = getSceneComponent();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <SceneComponent event={event} onChoice={onChoice} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
