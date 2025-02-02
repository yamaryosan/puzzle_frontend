"use client";

import { createContext } from "react";
import { User } from "firebase/auth";

// Firebaseのユーザー情報を保持するコンテキスト
export const FirebaseUserContext = createContext<User | null>(null);

export default FirebaseUserContext;
