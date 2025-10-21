"use client";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginationControlsProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  pagination,
  onPageChange,
}: PaginationControlsProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={!pagination.hasPrev}
        className={`px-4 py-2 rounded-lg border transition-colors ${
          pagination.hasPrev
            ? "bg-background border-gray-600 text-white hover:bg-gray-800"
            : "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
        }`}
      >
        Previous
      </button>

      <span className="text-gray-400">
        Page {pagination.page} of {pagination.totalPages}
      </span>

      <button
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={!pagination.hasNext}
        className={`px-4 py-2 rounded-lg border transition-colors ${
          pagination.hasNext
            ? "bg-background border-gray-600 text-white hover:bg-gray-800"
            : "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
        }`}
      >
        Next
      </button>
    </div>
  );
}
