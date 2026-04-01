'use client';

import { motion } from 'framer-motion';

export type Step = 1 | 2 | 3 | 4;

interface StepIndicatorProps {
  currentStep: Step;
  onStepClick: (step: Step) => void;
  completedSteps: Set<number>;
}

const steps = [
  { number: 1 as Step, label: 'Upload', icon: '📸' },
  { number: 2 as Step, label: 'Settings', icon: '⚙️' },
  { number: 3 as Step, label: 'Edit', icon: '✏️' },
  { number: 4 as Step, label: 'Export', icon: '📤' },
];

export default function StepIndicator({
  currentStep,
  onStepClick,
  completedSteps,
}: StepIndicatorProps) {
  const canNavigateTo = (step: Step): boolean => {
    if (step === 1) return true;
    // Can go to step N if step N-1 is completed
    return completedSteps.has(step - 1);
  };

  return (
    <div className="bg-linen/80 border-b border-rose-light/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Step circle + label */}
              <button
                onClick={() => canNavigateTo(step.number) && onStepClick(step.number)}
                disabled={!canNavigateTo(step.number)}
                className={`
                  flex flex-col items-center gap-1.5 group cursor-pointer
                  disabled:cursor-not-allowed disabled:opacity-40
                  transition-all duration-200
                `}
              >
                <div className="relative">
                  <motion.div
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                      text-lg sm:text-xl
                      transition-all duration-300
                      ${
                        currentStep === step.number
                          ? 'bg-rose text-white shadow-md shadow-rose/30'
                          : completedSteps.has(step.number)
                          ? 'bg-sage text-white'
                          : 'bg-rose-light/50 text-warm-gray'
                      }
                      ${
                        canNavigateTo(step.number) && currentStep !== step.number
                          ? 'group-hover:bg-rose-light group-hover:text-charcoal'
                          : ''
                      }
                    `}
                    animate={
                      currentStep === step.number
                        ? { scale: [1, 1.05, 1] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    {completedSteps.has(step.number) && currentStep !== step.number ? (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{step.icon}</span>
                    )}
                  </motion.div>
                </div>
                <span
                  className={`
                    text-xs sm:text-sm font-medium transition-colors duration-200
                    ${
                      currentStep === step.number
                        ? 'text-charcoal'
                        : completedSteps.has(step.number)
                        ? 'text-sage-dark'
                        : 'text-warm-gray-light'
                    }
                  `}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="w-12 sm:w-20 lg:w-28 mx-2 sm:mx-3 mb-5">
                  <div className="relative h-0.5 bg-rose-light/50 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-sage rounded-full"
                      initial={{ width: '0%' }}
                      animate={{
                        width: completedSteps.has(step.number) ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
