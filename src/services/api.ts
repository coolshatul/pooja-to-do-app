import { supabase } from '../supabase';
import { PoojaList, PoojaItem } from '../types';

export class PoojaListAPI {
  static async createList(list: Omit<PoojaList, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('pooja_lists')
        .insert({
          title: list.title,
          items: list.items,
          owner_id: list.ownerId,
          owner_name: list.ownerName,
          owner_email: list.ownerEmail,
          is_public: list.isPublic,
          share_code: list.shareCode || null,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  }

  static async updateList(listId: string, updates: Partial<PoojaList>): Promise<void> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.items !== undefined) updateData.items = updates.items;
      if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
      if (updates.shareCode !== undefined) updateData.share_code = updates.shareCode;

      const { error } = await supabase
        .from('pooja_lists')
        .update(updateData)
        .eq('id', listId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  }

  static async deleteList(listId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pooja_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  }

  static async getUserLists(userId: string): Promise<PoojaList[]> {
    try {
      const { data, error } = await supabase
        .from('pooja_lists')
        .select('*')
        .eq('owner_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        title: item.title,
        items: item.items,
        ownerId: item.owner_id,
        ownerName: item.owner_name,
        ownerEmail: item.owner_email,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        isPublic: item.is_public,
        shareCode: item.share_code,
      }));
    } catch (error) {
      console.error('Error fetching user lists:', error);
      throw error;
    }
  }

  static async getListByShareCode(shareCode: string): Promise<PoojaList | null> {
    try {
      const { data, error } = await supabase
        .from('pooja_lists')
        .select('*')
        .eq('share_code', shareCode)
        .eq('is_public', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        items: data.items,
        ownerId: data.owner_id,
        ownerName: data.owner_name,
        ownerEmail: data.owner_email,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isPublic: data.is_public,
        shareCode: data.share_code,
      };
    } catch (error) {
      console.error('Error fetching list by share code:', error);
      throw error;
    }
  }

  static async getList(listId: string): Promise<PoojaList | null> {
    try {
      const { data, error } = await supabase
        .from('pooja_lists')
        .select('*')
        .eq('id', listId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        items: data.items,
        ownerId: data.owner_id,
        ownerName: data.owner_name,
        ownerEmail: data.owner_email,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isPublic: data.is_public,
        shareCode: data.share_code,
      };
    } catch (error) {
      console.error('Error fetching list:', error);
      throw error;
    }
  }

  static generateShareCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}