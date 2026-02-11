'use client';

import { Plus, Edit, Trash2, FileQuestion, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CategoryWithPackets, PacketWithQuestions } from '@/types/bank-soal';

// ============================================
// Packet List Component
// ============================================

interface PacketListProps {
  category: CategoryWithPackets;
  onBack: () => void;
  onCreatePacket: () => void;
  onEditPacket: (packet: PacketWithQuestions) => void;
  onDeletePacket: (packetId: string) => void;
  onSelectPacket: (packet: PacketWithQuestions) => void;
}

export function PacketList({ category, onBack, onCreatePacket, onEditPacket, onDeletePacket, onSelectPacket }: PacketListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
            <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
            <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">{category.code}</span>
          </div>
          <p className="text-sm text-gray-500">Kelola paket soal untuk kategori ini</p>
        </div>
        <Button onClick={onCreatePacket} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Paket
        </Button>
      </div>

      {/* Packet Grid */}
      {category.packets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada paket</h3>
            <p className="text-sm text-gray-500 mb-4">Mulai dengan membuat paket pertama untuk kategori ini</p>
            <Button onClick={onCreatePacket} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Paket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.packets.map((packet) => (
            <Card key={packet.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelectPacket(packet)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{packet.name}</h3>
                      <span className="text-xs font-mono bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">Kode {packet.code}</span>
                    </div>
                    {packet.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <XCircle className="w-3 h-3" />
                        Nonaktif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPacket(packet);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePacket(packet.id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <FileQuestion className="w-4 h-4" />
                    <span>{packet.totalQuestions} Soal</span>
                  </div>
                  <div>
                    <span>Total: {packet.totalScore} Poin</span>
                  </div>
                </div>

                <div className="text-xs text-gray-400">Diupdate: {formatDate(packet.updatedAt)}</div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPacket(packet);
                    }}
                  >
                    <FileQuestion className="w-4 h-4 mr-2" />
                    Kelola Soal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
