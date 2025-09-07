import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { FileText, Youtube } from 'lucide-react';

export default function MaterialCard({ material, index }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex gap-6 mb-6">
      <div className="w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
        {material.type === 'pdf' ? (
          <FileText size={48} className="text-gray-500" />
        ) : (
          <Youtube size={48} className="text-red-600" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Material {index + 1} - {material.title}
          </h3>
          <button className="text-gray-500 hover:text-gray-800">
            <MoreHorizontal size={24} />
          </button>
        </div>
        <p className="text-gray-600 text-sm">
          {material.description}
        </p>
      </div>
    </div>
  );
}
