'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, FileQuestion, ArrowLeft, MoreVertical, Copy, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CategoryWithPackets, PacketWithQuestions, Question, OptionLabel, QuestionOption } from '@/types/bank-soal';

// ============================================
// Question List Component
// ============================================

interface QuestionListProps {
  category: CategoryWithPackets;
  packet: PacketWithQuestions;
  onBack: () => void;
  onCreateQuestion: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion?: (question: Question) => void;
}

export function QuestionList({ category, packet, onBack, onCreateQuestion, onEditQuestion, onDeleteQuestion, onDuplicateQuestion }: QuestionListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showActionsFor, setShowActionsFor] = useState<string | null>(null);

  const isAllSelected = packet.questions.length > 0 && selectedIds.length === packet.questions.length;
  const isSomeSelected = selectedIds.length > 0;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(packet.questions.map((q: Question) => q.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleDuplicate = (question: Question) => {
    if (onDuplicateQuestion) {
      onDuplicateQuestion(question);
    }
    setShowActionsFor(null);
  };

  const getOptionLabel = (label: OptionLabel) => {
    const colors: Record<OptionLabel, string> = {
      A: 'bg-blue-100 text-blue-700',
      B: 'bg-green-100 text-green-700',
      C: 'bg-yellow-100 text-yellow-700',
      D: 'bg-purple-100 text-purple-700',
      E: 'bg-pink-100 text-pink-700',
    };
    return colors[label];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">{packet.name}</h2>
            <span className="text-sm font-mono bg-teal-100 text-teal-700 px-2 py-0.5 rounded">Kode {packet.code}</span>
          </div>
          <p className="text-sm text-gray-500">
            {category.name} ({category.code}) • {packet.totalQuestions} Soal • {packet.totalScore} Poin
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={onCreateQuestion} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Soal
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {isSomeSelected && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
            <span className="text-sm font-medium text-teal-800">{selectedIds.length} soal dipilih</span>
          </div>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => setSelectedIds([])} className="text-gray-600">
            Batal
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              selectedIds.forEach((id) => onDeleteQuestion(id));
              setSelectedIds([]);
            }}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus ({selectedIds.length})
          </Button>
        </div>
      )}

      {/* Question List */}
      {packet.questions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada soal</h3>
            <p className="text-sm text-gray-500 mb-4">Mulai dengan membuat soal pertama untuk paket ini</p>
            <Button onClick={onCreateQuestion} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Soal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {packet.questions.map((question: Question, index: number) => (
            <Card key={question.id} className={cn('overflow-hidden transition-all', selectedIds.includes(question.id) && 'ring-2 ring-teal-500')}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="shrink-0 pt-2">
                    <input type="checkbox" checked={selectedIds.includes(question.id)} onChange={() => toggleSelect(question.id)} className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                  </div>

                  {/* Question Number */}
                  <div className="shrink-0 w-10 h-10 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center font-semibold">{index + 1}</div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <p className="text-gray-900 line-clamp-2 flex-1">{question.questionText}</p>
                      {question.imagePath && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          <ImageIcon className="w-3 h-3" />
                          Gambar
                        </span>
                      )}
                    </div>

                    {/* Options Preview */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                      {question.options.map((option: QuestionOption) => (
                        <div key={option.id} className={cn('text-xs px-2 py-1.5 rounded flex items-center gap-1.5', option.label === question.correctAnswer ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-100 text-gray-600')}>
                          <span className={cn('w-5 h-5 rounded flex items-center justify-center text-xs font-medium', getOptionLabel(option.label))}>{option.label}</span>
                          <span className="truncate">{option.text}</span>
                          {option.label === question.correctAnswer && <CheckCircle className="w-3 h-3 shrink-0" />}
                        </div>
                      ))}
                    </div>

                    {/* Question Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-teal-600">{question.score} Poin</span>
                      </span>
                      <span>
                        Jawaban Benar: <span className="font-medium">{question.correctAnswer}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="relative shrink-0">
                    <Button variant="ghost" size="icon-sm" onClick={() => setShowActionsFor(showActionsFor === question.id ? null : question.id)}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>

                    {showActionsFor === question.id && (
                      <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-10" onClick={() => setShowActionsFor(null)} />

                        {/* Menu */}
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => {
                              onEditQuestion(question);
                              setShowActionsFor(null);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                            Edit Soal
                          </button>
                          {onDuplicateQuestion && (
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => handleDuplicate(question)}>
                              <Copy className="w-4 h-4" />
                              Duplikat
                            </button>
                          )}
                          <button
                            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                            onClick={() => {
                              onDeleteQuestion(question.id);
                              setShowActionsFor(null);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Hapus
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
