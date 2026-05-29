import { User } from "./types";
import { hashPassword, verifyPassword } from "./password";

const notifyStorageChanged = () => {
  window.dispatchEvent(new Event("greenmart-storage"));
};

export const getRegisteredUsers = (): User[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("greenmart_users");
  return stored ? JSON.parse(stored) : [];
};

export const loginUser = (user: User) => {
  if (typeof window === "undefined") return;
  // Never store password in localStorage session
  const { password, ...userWithoutPassword } = user;
  localStorage.setItem("greenmart_current_user", JSON.stringify(userWithoutPassword));
  notifyStorageChanged();
};

export const logoutUser = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("greenmart_current_user");
  notifyStorageChanged();
};

export const registerUser = (user: User) => {
  if (typeof window === "undefined") return;
  
  // Hash password before storing in users database
  const hashedPassword = hashPassword(user.password || "");
  const userWithHashedPassword = { ...user, password: hashedPassword };
  
  // Don't store password in the current user session
  const { password, ...userWithoutPassword } = userWithHashedPassword;
  localStorage.setItem("greenmart_current_user", JSON.stringify(userWithoutPassword));
  
  const users = getRegisteredUsers();
  const existingIndex = users.findIndex(u => u.phone === user.phone);
  if (existingIndex >= 0) {
    users[existingIndex] = userWithHashedPassword;
  } else {
    users.push(userWithHashedPassword);
  }
  localStorage.setItem("greenmart_users", JSON.stringify(users));
  notifyStorageChanged();
};

export const findUserByPhone = (phone: string): User | undefined => {
  const users = getRegisteredUsers();
  return users.find(u => u.phone === phone);
};

export const verifyUserCredentials = (phone: string, password: string): User | null => {
  const user = findUserByPhone(phone);
  if (!user || !user.password) {
    return null;
  }
  
  if (verifyPassword(password, user.password)) {
    return user;
  }
  
  return null;
};

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("greenmart_current_user");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse user", e);
      return null;
    }
  }
  return null;
};
