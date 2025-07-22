import React, { useState } from 'react';
import { X, Share2, Copy, Check, Globe, Lock } from 'lucide-react';
import { PoojaList } from '../types';
import { PoojaListAPI } from '../services/api';

interface ShareModalProps {
  list: PoojaList;
  onClose: () => void;
  onUpdate: (updatedList: PoojaList) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ list, onClose, onUpdate }) => {
  const [isPublic, setIsPublic] = useState(list.isPublic);
  const [shareCode, setShareCode] = useState(list.shareCode || '');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTogglePublic = async () => {
    setLoading(true);
    try {
      const newIsPublic = !isPublic;
      let newShareCode = shareCode;

      if (newIsPublic && !shareCode) {
        newShareCode = PoojaListAPI.generateShareCode();
      }

      await PoojaListAPI.updateList(list.id, {
        isPublic: newIsPublic,
        shareCode: newIsPublic ? newShareCode : undefined,
      });

      setIsPublic(newIsPublic);
      setShareCode(newIsPublic ? newShareCode : '');

      onUpdate({
        ...list,
        isPublic: newIsPublic,
        shareCode: newIsPublic ? newShareCode : undefined,
      });
    } catch (error) {
      console.error('Error updating share settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareCode) return;

    const shareUrl = `${window.location.origin}?share=${shareCode}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-800">Share List</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-gray-600" />
              )}
              <div>
                <p className="font-medium text-gray-800">
                  {isPublic ? 'Public' : 'Private'}
                </p>
                <p className="text-sm text-gray-600">
                  {isPublic ? 'Anyone with the link can view' : 'Only you can access'}
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePublic}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-green-600' : 'bg-gray-300'
                } ${loading ? 'opacity-50' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          {/* Share Link */}
          {isPublic && shareCode && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}?share=${shareCode}`}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={copyShareLink}
                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600">Link copied to clipboard!</p>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-orange-50 rounded-xl">
            <p className="text-sm text-orange-800">
              {isPublic
                ? 'Share the link above with others to let them view your pooja checklist.'
                : 'Make your list public to generate a shareable link that others can view.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};