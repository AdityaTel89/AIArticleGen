import { supabase } from '../services/supabaseClient';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export interface User {
  id: string;
  email: string;
  name?: string;
  password_hash?: string; // Don't expose in responses
  created_at?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

// Create user with hashed password
export const createUser = async (
  email: string,
  password: string,
  name?: string
): Promise<UserResponse> => {
  // Hash password with bcrypt
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash, name }])
    .select('id, email, name, created_at')
    .single();

  if (error) {
    console.error('Error inserting user:', error);
    throw error;
  }

  return data!;
};

// Get user by email (includes password_hash for verification)
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching user:', error);
    throw error;
  }
  return data;
};

// Get user by ID (without password_hash)
export const getUserById = async (id: string): Promise<UserResponse | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, created_at')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching user:', error);
    throw error;
  }
  return data;
};

// Verify password
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Update user
export const updateUser = async (
  id: string,
  updates: { name?: string; email?: string }
): Promise<UserResponse> => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, email, name, created_at')
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  return data!;
};
