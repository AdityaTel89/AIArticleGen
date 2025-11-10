import { supabase } from '../services/supabaseClient';

export interface Article {
  id?: number;
  title: string;
  content: string;
  user_id: string;
  author_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ArticleWithUser extends Article {
  user_email?: string;
  user_name?: string;
}

export const createArticle = async (
  title: string,
  content: string,
  user_id: string,
  author_name?: string
): Promise<Article> => {
  const { data, error } = await supabase
    .from('articles')
    .insert([{ title, content, user_id, author_name }])
    .select()
    .single();

  if (error) {
    console.error('Error inserting article:', error);
    throw error;
  }

  return data!;
};

// Fixed: Use the correct foreign key name
export const getAllArticles = async (): Promise<ArticleWithUser[]> => {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      users!fk_articles_user_id (
        email,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }

  // Flatten the response
  return data.map((article: any) => ({
    id: article.id,
    title: article.title,
    content: article.content,
    user_id: article.user_id,
    author_name: article.author_name,
    created_at: article.created_at,
    updated_at: article.updated_at,
    user_email: article.users?.email,
    user_name: article.users?.name,
  }));
};

export const getArticlesByUserId = async (
  user_id: string
): Promise<Article[]> => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user articles:', error);
    throw error;
  }

  return data!;
};

export const getArticleById = async (id: number): Promise<ArticleWithUser | null> => {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      users!fk_articles_user_id (
        email,
        name
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching article:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    user_id: data.user_id,
    author_name: data.author_name,
    created_at: data.created_at,
    updated_at: data.updated_at,
    user_email: data.users?.email,
    user_name: data.users?.name,
  };
};

export const updateArticle = async (
  id: number,
  updates: { title?: string; content?: string }
): Promise<Article> => {
  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating article:', error);
    throw error;
  }

  return data!;
};

export const deleteArticle = async (id: number, user_id: string): Promise<void> => {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id);

  if (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
};
