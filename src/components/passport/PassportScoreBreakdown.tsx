import React from 'react';
import { PassportScoreBreakdown as BreakdownType } from '../../types';
import { Droplets, CalendarCheck, ShieldCheck, Target, Lightbulb, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PassportScoreBreakdown: React.FC<{ breakdown: BreakdownType }> = ({ breakdown }) => {
  const { t, language } = useLanguage();

  const categories = [
    {
      id: 'water',
      title: t.score.waterManagement,
      desc: t.score.waterDesc,
      score: breakdown.waterManagementScore,
      max: 40,
      icon: Droplets,
      color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
      barColor: 'bg-cyan-600',
    },
    {
      id: 'consistency',
      title: t.score.consistency,
      desc: t.score.consistencyDesc,
      score: breakdown.logConsistencyScore,
      max: 30,
      icon: CalendarCheck,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      barColor: 'bg-emerald-600',
    },
    {
      id: 'cropCare',
      title: t.score.cropCare,
      desc: t.score.cropCareDesc,
      score: breakdown.cropCareScore,
      max: 20,
      icon: ShieldCheck,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      barColor: 'bg-teal-600',
    },
    {
      id: 'plan',
      title: t.score.planAdherence,
      desc: t.score.planDesc,
      score: breakdown.planAdherenceScore,
      max: 10,
      icon: Target,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      barColor: 'bg-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Category Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const percent = Math.round((cat.score / cat.max) * 100);

          return (
            <div
              key={cat.id}
              className={`p-4 rounded-xl border bg-white shadow-xs hover:border-emerald-300 transition-colors`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg border ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {cat.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Weight: {cat.max} pts
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900">
                    {cat.score}
                  </span>
                  <span className="text-xs text-slate-400">/{cat.max}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                {cat.desc}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${cat.barColor} transition-all duration-700`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actionable Suggestions */}
      {breakdown.suggestions && breakdown.suggestions.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-700" />
            <h5 className="text-xs font-bold text-amber-950">
              {language === 'hi' ? 'स्कोर सुधारने के सुझाव' : 'Specific Suggestions for Score Improvement'}
            </h5>
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-xs text-amber-900">
            {breakdown.suggestions.map((sug, i) => (
              <li key={i}>{sug}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Methodology Stamp */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          Scoring Engine Version: {breakdown.scoringVersion}
        </span>
        <span>
          Calculated: {new Date(breakdown.calculatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
