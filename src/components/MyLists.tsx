import React, { useState, useEffect } from 'react';
import { Plus, Share2, Trash2, Calendar, Users } from 'lucide-react';
import { PoojaList } from '../types';
import { PoojaListAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { ShareModal } from './ShareModal';

interface MyListsProps {
  onSelectList: (list: PoojaList) => void;
  onCreateNew: () => void;
}

export const MyLists: React.FC<MyListsProps> = ({ onSelectList, onCreateNew }) => {
  const { user } = useAuth();
  const [lists, setLists] = useState<PoojaList[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalList, setShareModalList] = useState<PoojaList | null>(null);

  useEffect(() => {
    if (user) {
      loadUserLists();
    }
  }, [user]);

  const loadUserLists = async () => {
    if (!user) return;
    
    try {
      const userLists = await PoojaListAPI.getUserLists(user.id);
      setLists(userLists);
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (listId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this list?')) return;

    try {
      await PoojaListAPI.deleteList(listId);
      setLists(lists.filter(list => list.id !== listId));
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const handleShareList = (list: PoojaList, e: React.MouseEvent) => {
    e.stopPropagation();
    setShareModalList(list);
  };

  const handleUpdateList = (updatedList: PoojaList) => {
    setLists(lists.map(list => 
      list.id === updatedList.id ? updatedList : list
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-orange-900">My Pooja Lists</h2>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-yellow-500 text-white rounded-xl hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New List
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-md">
            <Calendar className="w-12 h-12 text-orange-400 mx-auto mb-4 opacity-50" />
            <p className="text-orange-600 mb-2">No pooja lists yet</p>
            <p className="text-sm text-orange-500 mb-4">Create your first checklist to get started</p>
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-white rounded-xl hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Create First List
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {lists.map((list) => (
            <div
              key={list.id}
              onClick={() => onSelectList(list)}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-orange-900">{list.title}</h3>
                <div className="flex items-center gap-2">
                  {list.isPublic && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      <Users className="w-3 h-3" />
                      Public
                    </div>
                  )}
                  <button
                    onClick={(e) => handleShareList(list, e)}
                    className="p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-300"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteList(list.id, e)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-orange-600">
                <span>
                  {list.items.filter(item => item.completed).length} of {list.items.length} items collected
                </span>
                <span>
                  {new Date(list.updatedAt).toLocaleDateString()}
                </span>
              </div>
              
              {list.items.length > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-orange-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(list.items.filter(item => item.completed).length / list.items.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {shareModalList && (
        <ShareModal
          list={shareModalList}
          onClose={() => setShareModalList(null)}
          onUpdate={handleUpdateList}
        />
      )}
    </div>
  );
};