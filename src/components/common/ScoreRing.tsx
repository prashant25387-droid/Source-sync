import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGrade?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 'md',
  showGrade = true,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  let colorClasses = {
    ring: 'stroke-emerald-600',
    bgText: 'text-emerald-900',
    gradeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    gradeText: 'Comprehensive',
  };

  if (clampedScore < 40) {
    colorClasses = {
      ring: 'stroke-red-500',
      bgText: 'text-red-900',
      gradeBg: 'bg-red-100 text-red-800 border-red-300',
      gradeText: 'Limited Records',
    };
  } else if (clampedScore < 60) {
    colorClasses = {
      ring: 'stroke-amber-500',
      bgText: 'text-amber-900',
      gradeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      gradeText: 'Developing',
    };
  } else if (clampedScore < 80) {
    colorClasses = {
      ring: 'stroke-teal-600',
      bgText: 'text-teal-900',
      gradeBg: 'bg-teal-100 text-teal-800 border-teal-300',
      gradeText: 'Well-Documented',
    };
  }

  // Dimensions
  const dim = {
    sm: { width: 52, stroke: 5, fontSize: 'text-sm font-bold' },
    md: { width: 80, stroke: 7, fontSize: 'text-xl font-bold' },
    lg: { width: 110, stroke: 9, fontSize: 'text-3xl font-extrabold' },
    xl: { width: 140, stroke: 10, fontSize: 'text-4xl font-black' },
  }[size];

  const radius = (dim.width - dim.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dim.width}
          height={dim.width}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={dim.width / 2}
            cy={dim.width / 2}
            r={radius}
            className="stroke-slate-200"
            strokeWidth={dim.stroke}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={dim.width / 2}
            cy={dim.width / 2}
            r={radius}
            className={`${colorClasses.ring} transition-all duration-1000 ease-out`}
            strokeWidth={dim.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`${dim.fontSize} ${colorClasses.bgText} leading-none`}>
            {clampedScore}
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5">/100</span>
          )}
        </div>
      </div>

      {showGrade && size !== 'sm' && (
        <span
          className={`mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colorClasses.gradeBg}`}
        >
          {colorClasses.gradeText}
        </span>
      )}
    </div>
  );
};
