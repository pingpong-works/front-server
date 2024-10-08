import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    isAuthenticated: false,
    token: null,
    user: null,  // 사용자 정보를 저장할 user 필드 추가
  });

  // 로그인 처리 예시 (로그인 성공 시 token과 user 정보 저장)
  const login = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:50000/login', credentials);
      const { token, user } = response.data;
      
      setState({
        isAuthenticated: true,
        token: token,
        user: user,  // 로그인한 사용자 정보를 state에 저장
      });
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  const logout = () => {
    setState({
      isAuthenticated: false,
      token: null,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
