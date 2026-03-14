import { cn } from "@/lib/utils";

interface TutorialTooltipProps {
  title: string;
  description: string;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
  isLastStep: boolean;
  isActionStep?: boolean;
  isActionCompleted?: boolean;
}

export const TutorialTooltip = ({
  title,
  description,
  stepIndex,
  totalSteps,
  onNext,
  onBack,
  isLastStep,
  isActionStep = false,
  isActionCompleted = false,
}: TutorialTooltipProps) => {
  const canGoBack = onBack && stepIndex > 0;
  const showNextArrow = !isActionStep || isActionCompleted;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg p-6 bg-black-300 backdrop-blur-[16px] border-2 border-black-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
        "animate-in fade-in slide-in-from-bottom-2 duration-200",
        "w-full max-w-[320px]",
      )}
    >
      {/* Title */}
      <h3 className="font-primary text-[36px]/6 tracking-wider text-white-100 uppercase">
        {title}
      </h3>

      {/* Description */}
      <p className="text-2xl/[18px] font-secondary tracking-wider text-white-100">
        {description}
      </p>

      {/* Navigation: arrows + dots */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Left arrow */}
        {canGoBack ? (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 flex items-center justify-center w-6 h-6 text-mauve-100 hover:text-white-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <div className="shrink-0 w-6" />
        )}

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 flex-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                "shrink-0 rounded-full transition-all",
                i === stepIndex
                  ? "w-2.5 h-2.5 bg-[#8581ff]"
                  : i < stepIndex
                    ? "w-2 h-2 bg-[#5550aa]"
                    : "w-2 h-2 bg-[#3d3970]",
              )}
            />
          ))}
        </div>

        {/* Right arrow */}
        {showNextArrow ? (
          <button
            type="button"
            onClick={onNext}
            className="shrink-0 flex items-center justify-center w-6 h-6 text-mauve-100 hover:text-white-100 transition-colors"
          >
            {isLastStep ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8L6.5 11.5L13 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 4L10 8L6 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        ) : (
          <div className="shrink-0 w-6" />
        )}
      </div>
    </div>
  );
};
