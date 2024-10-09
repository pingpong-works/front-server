import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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
  TotalMail
} from "./scenes";
import ApprovalLineSetup from './components/ApprovalLineSetup';
import CreateBoard from './scenes/boards/createBoard';
import ViewBoard from './scenes/boards/viewBoard';
import UpdateBoard from './scenes/boards/updateBoard';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/team" element={<Team />} />
          <Route path="/elec" element={<Elec />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/boards" element={<Boards />} />
          <Route path="/boards/createBoard" element={<CreateBoard />} />
          <Route path="/viewBoard/:id" element={<ViewBoard />} />
          <Route path="/updateBoard" element={<UpdateBoard />} />
          <Route path="/form" element={<Form />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/totalMail" element={<TotalMail />} />
          <Route path="/pie" element={<Pie />} />
          <Route path="/stream" element={<Stream />} />
          <Route path="/line" element={<Line />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/geography" element={<Geography />} />
          {/* ApprovalLineSetup 경로 추가 */}
          <Route path="/approval-line-setup" element={<ApprovalLineSetup />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
