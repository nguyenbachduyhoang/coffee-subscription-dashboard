import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName?: string;
  loading?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title,
  itemName,
  loading = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                disabled={loading}
                title="Đóng"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 text-center">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-gray-700 mb-2">
                Bạn có chắc chắn muốn xóa?
              </p>
              {itemName && (
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">"{itemName}"</span>
                </p>
              )}
              <p className="text-xs text-red-600">
                Hành động này không thể hoàn tác.
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-4 pt-0">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xóa...
                  </>
                ) : (
                  'Xóa'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteModal;
