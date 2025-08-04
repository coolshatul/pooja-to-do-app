import React, { useState, useEffect } from 'react';
import { Flame, Plus, Trash2, X, ArrowLeft, Save, List, Share2 } from 'lucide-react';
import { PoojaItem, PoojaList } from './types';
import { useAuth } from './hooks/useAuth';
import { AuthButton } from './components/AuthButton';
import { MyLists } from './components/MyLists';
import { ShareModal } from './components/ShareModal';
import { PoojaListAPI } from './services/api';

function App() {
  const isSupabaseDisabled = import.meta.env.VITE_SUPABASE_DISABLED === 'true';
  // Simulate Supabase down state (for future extensibility, as per notice)
  const isSupabaseDown = false;
  const { user } = useAuth();
  const [currentList, setCurrentList] = useState<PoojaList | null>(null);
  const [items, setItems] = useState<PoojaItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [listTitle, setListTitle] = useState('My Pooja Checklist');
  const [showMyLists, setShowMyLists] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  // Track if localStorage items have been loaded
  const [localItemsLoaded, setLocalItemsLoaded] = useState(false);


  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Check for shared list on app load
  useEffect(() => {
    if (typeof user === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const shareCode = urlParams.get('share');

    if (shareCode) {
      loadSharedList(shareCode);
    } else {
      // Load from localStorage for non-authenticated users
      if (!user) {
        const savedData = localStorage.getItem('poojaList');

        if (savedData) {
          const parsed = JSON.parse(savedData);
          setItems(parsed.items || []);
          setListTitle(parsed.title || 'My Pooja Checklist');
        }
        setLocalItemsLoaded(true); // ✅ mark as loaded, even if nothing found
      }
    }
  }, [user !== undefined]);

  // Save to localStorage for non-authenticated users, only after loaded
  useEffect(() => {
    if (!user && !currentList && localItemsLoaded) {
      localStorage.setItem('poojaList', JSON.stringify({
        items,
        title: listTitle,
      }));
    }
  }, [items, listTitle, user, currentList, localItemsLoaded]);

  const loadSharedList = async (shareCode: string) => {
    try {
      const sharedList = await PoojaListAPI.getListByShareCode(shareCode);
      if (sharedList) {
        setCurrentList(sharedList);
        setItems(sharedList.items);
        setListTitle(sharedList.title);
      }
    } catch (error) {
      console.error('Error loading shared list:', error);
    }
  };

  const saveCurrentList = async () => {
    if (!user || !currentList) return;

    setSaving(true);
    try {
      await PoojaListAPI.updateList(currentList.id, {
        title: listTitle,
        items: items,
      });

      setCurrentList({
        ...currentList,
        title: listTitle,
        items: items,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error saving list:', error);
    } finally {
      setSaving(false);
    }
  };

  const createNewList = async () => {
    if (!user) return;

    try {
      const newListData = {
        title: 'New Pooja Checklist',
        items: [],
        ownerId: user.id,
        ownerName: user.name,
        ownerEmail: user.email,
        isPublic: false,
      };

      const listId = await PoojaListAPI.createList(newListData);
      const newList: PoojaList = {
        id: listId,
        ...newListData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setCurrentList(newList);
      setItems([]);
      setListTitle('New Pooja Checklist');
      setShowMyLists(false);
    } catch (error) {
      console.error('Error creating new list:', error);
    }
  };

  const selectList = (list: PoojaList) => {
    setCurrentList(list);
    setItems(list.items);
    setListTitle(list.title);
    setShowMyLists(false);
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      const item: PoojaItem = {
        id: Date.now().toString(),
        text: newItem.trim(),
        completed: false,
        createdAt: new Date(),
      };
      setItems([...items, item]);
      setNewItem('');
    }
  };

  const toggleComplete = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const isSharedList = currentList && currentList.ownerId !== user?.id;

  if (user && showMyLists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setShowMyLists(false)}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 text-orange-600" />
              <span className="text-orange-800">Back</span>
            </button>
            <AuthButton disabled={isSupabaseDisabled} />
          </div>
          <MyLists onSelectList={selectList} onCreateNew={createNewList} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setShowMyLists(true)}
                className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-all duration-300"
              >
                <List className="w-5 h-5 text-orange-600" />
              </button>
            )}
            <div className="bg-gradient-to-r from-orange-400 to-yellow-500 p-3 rounded-full shadow-lg">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
          <AuthButton disabled={isSupabaseDisabled} />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          {user && currentList && !isSharedList ? (
            <input
              type="text"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              className="text-2xl font-bold text-orange-900 bg-transparent text-center border-none outline-none w-full"
              onBlur={saveCurrentList}
            />
          ) : (
            <h1 className="text-3xl font-bold text-orange-900 mb-2">{listTitle}</h1>
          )}

          {isSharedList && (
            <p className="text-sm text-orange-600 mb-2">
              Shared by {currentList.ownerName}
            </p>
          )}

          <p className="text-orange-700 text-sm">Sacred items for your ritual</p>
          {totalCount > 0 && (
            <div className="mt-3 text-sm text-orange-600">
              {completedCount} of {totalCount} items collected
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {user && currentList && !isSharedList && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={saveCurrentList}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        )}

        {/* Add Item Form */}
        {!isSharedList && (
          <form onSubmit={addItem} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add pooja item (e.g., agarbatti, diya, flowers, camphor...)"
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none bg-white/80 backdrop-blur-sm text-orange-900 placeholder-orange-400 transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-400 to-yellow-500 text-white p-2 rounded-lg hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* Items List */}
        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${item.completed ? 'opacity-75 bg-gradient-to-r from-green-50 to-emerald-50' : ''
                }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleComplete(item.id)}
                  disabled={!!isSharedList}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${item.completed
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-500 text-white'
                    : 'border-orange-300 hover:border-orange-400 hover:bg-orange-50'
                    } ${isSharedList ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {item.completed && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => {
                    const updatedItems = items.map(i =>
                      i.id === item.id ? { ...i, text: e.target.value } : i
                    );
                    setItems(updatedItems);
                  }}
                  onBlur={() => {
                    // Optional: could persist here if desired, or just leave for Save button
                  }}
                  className={`flex-1 bg-transparent border-none outline-none text-orange-900 transition-all duration-300 ${item.completed ? 'line-through text-green-600' : ''
                    }`}
                  disabled={!!isSharedList}
                />
                {!isSharedList && (
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-md">
              <Flame className="w-12 h-12 text-orange-400 mx-auto mb-4 opacity-50" />
              <p className="text-orange-600 mb-2">
                {isSharedList ? 'This pooja list is empty' : 'Your pooja checklist is empty'}
              </p>
              <p className="text-sm text-orange-500">
                {isSharedList
                  ? 'The owner hasn\'t added any items yet'
                  : 'Add items like agarbatti, diya, flowers, camphor, etc.'
                }
              </p>
            </div>
          </div>
        )}

        {/* Clear All Button */}
        {items.length > 0 && !isSharedList && (
          <div className="text-center mb-4">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Items
            </button>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full text-center">
              <h2 className="text-lg font-semibold text-orange-800 mb-4">Clear All Items?</h2>
              <p className="text-sm text-orange-600 mb-6">Are you sure you want to remove all pooja items from this list?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    clearAll();
                    setShowClearConfirm(false);
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-orange-800 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Install PWA Prompt */}
        {showInstallPrompt && (
          <div className="text-center mb-6">
            <button
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600 text-white rounded-xl shadow-md transition-all duration-300"
              onClick={async () => {
                if (deferredPrompt) {
                  // @ts-ignore
                  deferredPrompt.prompt();
                  // @ts-ignore
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    console.log('User accepted install');
                  } else {
                    console.log('User dismissed install');
                  }
                  setDeferredPrompt(null);
                  setShowInstallPrompt(false);
                }
              }}
            >
              🛕 Install Pooja App
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-orange-500">
            May your pooja bring peace and blessings 🙏
          </p>
          {(isSupabaseDisabled || isSupabaseDown) && (
            <div className="mt-4 px-4 py-3 bg-orange-100 border border-orange-300 rounded-lg text-xs text-orange-800 shadow-sm max-w-md mx-auto">
              <strong className="block mb-1 font-semibold">Limited Online Features</strong>
              Online sync and Google login are currently disabled due to cost constraints.
              You can still use all features locally — your checklist will be saved in your browser. 🙏
            </div>
          )}
        </div>

        {/* Share Modal */}
        {shareModal && currentList && (
          <ShareModal
            list={currentList}
            onClose={() => setShareModal(false)}
            onUpdate={(updatedList) => {
              setCurrentList(updatedList);
              setShareModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;