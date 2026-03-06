import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeal } from '../../context/DealContext';
import type { InvestmentGoal, SyndicationExperience, TargetRange, LeadSource, IntakeAnswers } from '../../types/investor';

interface IntakeQuestion {
  key: keyof IntakeAnswers;
  text: string;
  options: { label: string; value: string }[];
}

const QUESTIONS: IntakeQuestion[] = [
  {
    key: 'investment_goal',
    text: "What's your primary investment goal?",
    options: [
      { label: 'Cash Flow', value: 'cash_flow' },
      { label: 'Appreciation', value: 'appreciation' },
      { label: 'Tax Benefits', value: 'tax_benefits' },
      { label: 'Diversification', value: 'diversification' },
    ],
  },
  {
    key: 'syndication_experience',
    text: 'Have you invested in real estate syndications before?',
    options: [
      { label: 'First time', value: 'first_time' },
      { label: '1-3 deals', value: '1_to_3' },
      { label: '4+ deals', value: '4_plus' },
    ],
  },
  {
    key: 'target_range',
    text: 'What investment range are you considering?',
    options: [
      { label: '$100K-$250K', value: '100k_250k' },
      { label: '$250K-$500K', value: '250k_500k' },
      { label: '$500K-$1M', value: '500k_1m' },
      { label: '$1M+', value: '1m_plus' },
    ],
  },
  {
    key: 'lead_source',
    text: 'How did you hear about Gray Capital?',
    options: [
      { label: 'Podcast', value: 'podcast' },
      { label: 'Referral', value: 'referral' },
      { label: 'Social Media', value: 'social_media' },
      { label: 'Web Search', value: 'web_search' },
    ],
  },
];

export default function Intake({ dealName }: { dealName: string }) {
  const { investor, completeIntake } = useDeal();
  const [step, setStep] = useState(-1); // -1 = welcome, 0-3 = questions
  const [answers, setAnswers] = useState<IntakeAnswers>({});

  const handleAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      completeIntake({ ...answers, [key]: value } as IntakeAnswers);
    }
  };

  const handleSkip = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      completeIntake(answers);
    }
  };

  const handleSkipAll = () => {
    completeIntake(answers);
  };

  return (
    <div className="min-h-screen bg-gc-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {step === -1 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="bg-gc-surface border border-gc-border rounded-2xl p-8 mb-4">
                <div className="w-10 h-10 bg-gc-accent/10 border border-gc-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gc-accent text-lg">G</span>
                </div>
                <p className="text-gc-text leading-relaxed">
                  Welcome to Gray Capital's <span className="font-semibold">{dealName}</span> deal
                  room{investor?.first_name ? `, ${investor.first_name}` : ''}. A few quick questions
                  to personalize your experience — feel free to skip any of these.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStep(0)}
                  className="bg-gc-accent hover:bg-gc-accent-hover text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors"
                >
                  Let's Go
                </button>
                <button
                  onClick={handleSkipAll}
                  className="text-gc-text-secondary hover:text-gc-text text-sm transition-colors"
                >
                  Skip to Deal Room
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`q-${step}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress */}
              <div className="flex gap-1.5 mb-6 justify-center">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-colors ${
                      i <= step ? 'bg-gc-accent w-8' : 'bg-gc-border w-6'
                    }`}
                  />
                ))}
              </div>

              <div className="bg-gc-surface border border-gc-border rounded-2xl p-8">
                <p className="text-gc-text text-lg font-medium mb-6">
                  {QUESTIONS[step].text}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {QUESTIONS[step].options.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(QUESTIONS[step].key, opt.value)}
                      className="bg-gc-bg border border-gc-border hover:border-gc-accent hover:bg-gc-accent/5 rounded-lg py-3 px-4 text-sm text-gc-text transition-all text-center"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={handleSkip}
                  className="text-gc-text-muted hover:text-gc-text-secondary text-xs transition-colors"
                >
                  Skip this question
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
