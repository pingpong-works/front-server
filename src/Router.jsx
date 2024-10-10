import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import App from "./App";
import {
  Dashboard,
  Team,
  Boards,
  Elec,
  Contacts,
  Mail,
  Line,
  Pie,
  FAQ,
  Geography,
  Calendar,
  Stream,
  TotalMail
} from "./scenes";
import ApprovalLineSetup from './components/ApprovalLineSetup';
import Login from './scenes/login/login';
import Mypage from './scenes/mypage/mypage';
import { AuthProvider } from './auth/AuthContext'; // AuthProvider 추가
import ApprovalDocumentForm from "./components/ApprovalDocumentForm";
import CreateBoard from './scenes/boards/createBoard';
import ViewBoard from './scenes/boards/viewBoard';
import UpdateBoard from './scenes/boards/updateBoard';
import MailWrite from "./scenes/mail/mailWrite.jsx";

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
            <Route path="/boards/createBoard" element={<CreateBoard />} />
            <Route path="/viewBoard/:id" element={<ViewBoard />} />
            <Route path="/updateBoard" element={<UpdateBoard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/new" element={<MailWrite />} />
            <Route path="/mailbox/-1" element={<TotalMail />} />
            <Route path="/mailbox/0" element={<Pie />} />
            <Route path="/mailbox/1" element={<Line />} />
            <Route path="/mailbox/2" element={<Geography />} />
            <Route path="/mailbox/3" element={<Stream />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/approval-line-setup" element={<ApprovalLineSetup />} />
            <Route path="/approval-document-form/:documentId" element={<ApprovalDocumentForm />} />
            <Route path="/mypage" element={<Mypage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
