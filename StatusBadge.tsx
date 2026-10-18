import React from 'react';
import { EvidenceStatus, BookingStatus } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const EvidenceStatusBadge: React.FC<{ status: EvidenceStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const { t } = useLanguage();

  const config = {
    'Approved as Supporting Evidence': {
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
      label: t.evidenceStatus.Approved,
    },
    'Pending Review': {
      bg: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: Clock,
      label: t.evidenceStatus.PendingReview,
    },
    'Uploaded': {
      bg: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Clock,
      label: t.evidenceStatus.Uploaded,
    },
    'Rejected': {
      bg: 'bg-red-100 text-red-800 border-red-300',
      icon: XCircle,
      label: t.evidenceStatus.Rejected,
    },
    'Resubmission Requested': {
      bg: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: RotateCcw,
      label: t.evidenceStatus.ResubmissionRequested,
    },
  }[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Clock,
    label: status,
  };

  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border shadow-xs ${config.bg} ${padding}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};

export const BookingStatusBadge: React.FC<{ status: BookingStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const config = {
    'Submitted': {
      bg: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Clock,
      label: 'Submitted (Awaiting Farmer)',
    },
    'Under Discussion': {
      bg: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: AlertTriangle,
      label: 'Under Discussion',
    },
    'Accepted': {
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
      label: 'Accepted by Farmer',
    },
    'Rejected': {
      bg: 'bg-red-100 text-red-800 border-red-300',
      icon: XCircle,
      label: 'Rejected',
    },
    'Cancelled': {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: XCircle,
      label: 'Cancelled',
    },
    'Fulfilled': {
      bg: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: CheckCircle2,
      label: 'Fulfilled / Delivered',
    },
  }[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Clock,
    label: status,
  };

  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bg} ${padding}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
