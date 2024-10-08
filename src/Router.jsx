import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import App from "./App";
import {
  Dashboard,
  Team,
  Boards,
  Elec,
  Contacts,
  Form,
  Line,
  Pie,
  FAQ,
  Geography,
  Calendar,
  Stream,
  TotalMail,
} from "./scenes";
import ApprovalLineSetup from './components/ApprovalLineSetup';
import Login from './scenes/login/login'; 
import Mypage from './scenes/mypage/mypage';

import { AuthProvider } from './auth/AuthContext'; // AuthProvider 추가

const AppRouter = () => {
  return (
    <AuthProvider> {/* AuthProvider로 인증 상태 관리 */}
      <Router>
        <Routes>
          {/* 기본 경로로 접근 시 로그인 페이지로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* 로그인 페이지 */}
          <Route path="/login" element={<Login />} />

          {/* 로그인 후의 페이지들 */}
          <Route path="/" element={<App />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/team" element={<Team />} />
            <Route path="/elec" element={<Elec />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/boards" element={<Boards />} />
            <Route path="/form" element={<Form />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/totalMail" element={<TotalMail />} />
            <Route path="/pie" element={<Pie />} />
            <Route path="/stream" element={<Stream />} />
            <Route path="/line" element={<Line />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/geography" element={<Geography />} />
            <Route path="/approval-line-setup" element={<ApprovalLineSetup />} />
            <Route path="/mypage" element={<Mypage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;