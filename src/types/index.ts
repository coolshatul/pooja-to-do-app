export interface PoojaItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface PoojaList {
  id: string;
  title: string;
  items: PoojaItem[];
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  shareCode?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}