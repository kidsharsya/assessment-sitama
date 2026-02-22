'use client';

import { useState, useCallback } from 'react';
import { User, Mail, Save, CheckCircle, Info, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ParticipantAssessmentForm, SubmitScoreRequest, ScoreRange, FormCriteria } from '@/types/interview-process';

// ============================================
// Assessment Form Component (untuk Interviewer)
// ============================================

interface AssessmentFormProps {
  participantForm: ParticipantAssessmentForm;
  onSave: (data: SubmitScoreRequest) => void;
  isSaving?: boolean;
  error?: string | null;
}

// Get category label by score value
function getKategoriByNilai(score: number, ranges: ScoreRange[]): string | null {
  for (const range of ranges) {
    if (score >= range.min && score <= range.max) {
      return range.label;
    }
  }
  return null;
}

export function AssessmentForm({ participantForm, onSave, isSaving = false, error }: AssessmentFormProps) {
  const { applicant, rubric, existingAssessment } = participantForm;

  // Initialize form with existing values if already assessed
  const [selectedScores, setSelectedScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (existingAssessment?.details) {
      existingAssessment.details.forEach((detail) => {
        initial[detail.criteriaId] = detail.score;
      });
    }
    return initial;
  });
  const [criteriaNotes, setCriteriaNotes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (existingAssessment?.details) {
      existingAssessment.details.forEach((detail) => {
        if (detail.notes) {
          initial[detail.criteriaId] = detail.notes;
        }
      });
    }
    return initial;
  });
  const [notes, setNotes] = useState(existingAssessment?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedRangeInfo, setExpandedRangeInfo] = useState<Record<string, boolean>>({});

  const handleRangeScoreChange = (criteriaId: string, value: string) => {
    if (value === '') {
      setSelectedScores((prev) => {
        const newScores = { ...prev };
        delete newScores[criteriaId];
        return newScores;
      });
      return;
    }
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    const clampedValue = Math.max(0, Math.min(100, numValue));
    setSelectedScores((prev) => ({ ...prev, [criteriaId]: clampedValue }));
    if (errors[criteriaId]) {
      setErrors((prev) => ({ ...prev, [criteriaId]: '' }));
    }
  };

  const toggleRangeInfo = (criteriaId: string) => {
    setExpandedRangeInfo((prev) => ({
      ...prev,
      [criteriaId]: !prev[criteriaId],
    }));
  };

  const calculateTotalScore = useCallback(() => {
    let total = 0;
    let totalWeight = 0;

    rubric.criteria.forEach((criteria) => {
      const score = selectedScores[criteria.id];
      if (score !== undefined) {
        total += (score * criteria.weight) / 100;
        totalWeight += criteria.weight;
      }
    });

    return totalWeight > 0 ? Math.round(total) : 0;
  }, [selectedScores, rubric.criteria]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    rubric.criteria.forEach((criteria) => {
      if (selectedScores[criteria.id] === undefined) {
        newErrors[criteria.id] = 'Masukkan nilai untuk kriteria ini';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const details = rubric.criteria.map((criteria) => ({
      criteriaId: criteria.id,
      score: selectedScores[criteria.id],
      ...(criteriaNotes[criteria.id] ? { notes: criteriaNotes[criteria.id] } : {}),
    }));

    onSave({
      notes,
      details,
    });
  };

  const getRangeColor = (index: number, total: number) => {
    const percentage = total > 1 ? index / (total - 1) : 0;
    if (percentage <= 0.25) return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
    if (percentage <= 0.5) return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
    if (percentage <= 0.75) return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
    return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' };
  };

  const isAssessed = !!existingAssessment;

  const getKategoriColorClass = (kategori: string | null) => {
    if (!kategori) return 'bg-gray-100 text-gray-600';
    switch (kategori.toLowerCase()) {
      case 'sangat baik':
      case 'excellent':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'baik':
      case 'good':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'cukup':
      case 'average':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'kurang':
      case 'tidak memenuhi':
      case 'poor':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Peserta Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{applicant.name}</h2>
                  <div className="mt-2">
                    <InfoItem icon={Mail} label="Email" value={applicant.email} />
                  </div>
                </div>
              </div>
              {isAssessed && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  Sudah Dinilai
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assessment Form Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{rubric.name}</h3>
                <p className="text-sm text-gray-500">{rubric.description}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Nilai Total</p>
                <p className="text-2xl font-bold text-teal-600">{calculateTotalScore()}</p>
              </div>
            </div>

            {/* Criteria Items */}
            <div className="space-y-6">
              {rubric.criteria.map((criteria, index) => (
                <CriteriaItem
                  key={criteria.id}
                  criteria={criteria}
                  index={index}
                  score={selectedScores[criteria.id]}
                  onScoreChange={(value) => handleRangeScoreChange(criteria.id, value)}
                  notes={criteriaNotes[criteria.id] || ''}
                  onNotesChange={(value) => setCriteriaNotes((prev) => ({ ...prev, [criteria.id]: value }))}
                  isExpanded={expandedRangeInfo[criteria.id]}
                  onToggleExpand={() => toggleRangeInfo(criteria.id)}
                  error={errors[criteria.id]}
                  getKategoriColorClass={getKategoriColorClass}
                  getRangeColor={getRangeColor}
                />
              ))}
            </div>

            {/* Catatan Tambahan */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Tambahan</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Tulis catatan atau observasi tambahan mengenai kandidat..." className="resize-none" />
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {isAssessed && existingAssessment?.submittedAt && (
                  <span>
                    Terakhir dinilai:{' '}
                    {new Date(existingAssessment.submittedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
              <Button onClick={handleSubmit} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">
                {isSaving ? (
                  'Menyimpan...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isAssessed ? 'Update Penilaian' : 'Simpan Penilaian'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// Criteria Item Component
// ============================================

interface CriteriaItemProps {
  criteria: FormCriteria;
  index: number;
  score: number | undefined;
  onScoreChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  error?: string;
  getKategoriColorClass: (kategori: string | null) => string;
  getRangeColor: (index: number, total: number) => { bg: string; text: string; border: string };
}

function CriteriaItem({ criteria, index, score, onScoreChange, notes, onNotesChange, isExpanded, onToggleExpand, error, getKategoriColorClass, getRangeColor }: CriteriaItemProps) {
  const kategori = score !== undefined ? getKategoriByNilai(score, criteria.scoreRanges) : null;

  return (
    <div className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-7 h-7 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-semibold text-sm shrink-0">{index + 1}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">{criteria.name}</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Bobot: {criteria.weight}%</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{criteria.description}</p>
        </div>
      </div>

      {/* Range Input (0-100) */}
      <div className="ml-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={100}
              value={score ?? ''}
              onChange={(e) => onScoreChange(e.target.value)}
              placeholder="0-100"
              className={cn('w-28 h-12 text-center text-lg font-semibold', score !== undefined ? 'border-2 border-teal-500 bg-teal-50/50 focus:ring-teal-500' : 'border-gray-300')}
            />
            <span className="text-sm text-gray-500">/ 100</span>
          </div>
          {score !== undefined && kategori && <div className={cn('px-4 py-2 rounded-lg font-medium text-sm', getKategoriColorClass(kategori))}>{kategori}</div>}
        </div>

        {/* Range Info Toggle */}
        {criteria.scoreRanges && criteria.scoreRanges.length > 0 && (
          <div className="mt-3">
            <button type="button" onClick={onToggleExpand} className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 transition-colors">
              <Info className="w-4 h-4" />
              <span>Lihat Info Kriteria Range</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Expanded Detail */}
            {isExpanded && (
              <div className="mt-3 space-y-2">
                {criteria.scoreRanges.map((range, idx) => {
                  const colors = getRangeColor(idx, criteria.scoreRanges.length);
                  return (
                    <div key={idx} className={cn('p-3 rounded-lg border', colors.border, colors.bg)}>
                      <div className="flex items-center gap-3">
                        <span className={cn('px-3 py-1 rounded-full text-sm font-semibold bg-white', colors.text)}>
                          {range.min} - {range.max}
                        </span>
                        <span className={cn('font-medium', colors.text)}>{range.label}</span>
                      </div>
                      {range.description && <p className="mt-2 text-sm text-gray-600">{range.description}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Per-criteria Notes */}
      <div className="ml-10 mt-3">
        <label className="block text-sm font-medium text-gray-600 mb-1">Catatan Kriteria</label>
        <Textarea value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={2} placeholder={`Catatan untuk kriteria ${criteria.name}...`} className="resize-none text-sm" />
      </div>

      {error && <p className="ml-10 mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ============================================
// Helper Component
// ============================================

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
