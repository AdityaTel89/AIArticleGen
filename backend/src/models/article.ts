import { supabase } from '../services/supabaseClient';

export interface Article {
  id?: number;
  title: string;
  content: string;
  created_at?: string;
}

export const createArticle = async (
  title: string,
  content: string
): Promise<Article> => {
  // Note the explicit type cast here helps TypeScript
  const { data, error } = await supabase
    .from('articles')
    .insert([{ title, content }] as Article[])  // cast to Article[] to avoid 'never' type
    .select()
    .single();

  if (error) {
    console.error('Error inserting article:', error);
    throw error;
  }

  return data!;
};

export const getAllArticles = async (): Promise<Article[]> => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }

  return data!;
};
