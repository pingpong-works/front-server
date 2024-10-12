import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import App from "./App";
import {
  Dashboard,
  Team,
  Boards,
  Elec,
  Contacts,
  Mine,
  Send,
  Receive,
  Temporary,
  FAQ,
  Calendar,
  Chat,
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
import Notification from "./scenes/notification/notification.jsx"

import ReceiveMailbox from "./scenes/mail/receiveMailbox.jsx";
import SendMailbox from "./scenes/mail/sendMailbox.jsx";

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
            <Route path="/chat" element={<Chat />} />
            <Route path="/totalMail" element={<TotalMail />} />
            <Route path="/pie" element={<Pie />} />
            <Route path="/stream" element={<Stream />} />
            <Route path="/line" element={<Line />} />
            <Route path="/new" element={<MailWrite />} />
            <Route path="/mailbox/-1" element={<TotalMail />} />
            <Route path="/mailbox/0" element={<Receive />} />
            <Route path="/mailbox/1" element={<Send />} />
            <Route path="/mailbox/2" element={<Temporary />} />
            <Route path="/mailbox/3" element={<Mine />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/approval-line-setup" element={<ApprovalLineSetup />} />
            <Route path="/approval-document-form/:documentId" element={<ApprovalDocumentForm />} />
            <Route path="/mypage" element={<Mypage />} />
            <Route path="/notification" element={<Notification />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
