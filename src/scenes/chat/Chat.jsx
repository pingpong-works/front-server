import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./chatList.jsx";
import ChatRoomContainer from "./ChatRoomContainer.jsx";
import GroupModal from "../../components/groupModal.jsx";
import { Modal } from "react-bootstrap";
import './Chat.css';
import axios from "axios";
import logo from "../../../public/logo.png";
import useWebSocket from '../../hooks/useWebSocker.js';

const Chat = () => {
  const [activeRoom, setActiveRoom] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatRoomName, setChatRoomName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [name, setName] = useState('');
  const [chatRoomList, setChatRoomList] = useState([]);
  const [filteredRoomList, setFilteredRoomList] = useState([]);
  const [profile, setProfile] = useState('');
  const [isChatRoomVisible, setIsChatRoomVisible] = useState(false);
  const [messages, setMessages] = useState([]);

  // useWebSocket 훅 사용
  const onMessageReceived = useCallback((receivedMessage) => {
    setMessages(prevMessages => [...prevMessages, receivedMessage]);
    updateChatRoomList(receivedMessage.chatRoomId, receivedMessage.content);
  }, []);

  const { isConnected, stompClientRef } = useWebSocket(
    memberId,
    activeRoom?.chatRoomId,
    activeRoom?.topic,
    onMessageReceived
  );

  useEffect(() => {
    autoSelect();
  }, []);

  useEffect(() => {
    if (memberId) {
      getChatRoomList();
    }
  }, [memberId]);

  const sendMessage = useCallback((message) => {
    if (isConnected && stompClientRef.current) {
      const messageObj = {
        chatRoomId: activeRoom.chatRoomId,
        senderId: memberId,
        senderName: name,
        content: message,
        timestamp: new Date().toISOString()
      };
      stompClientRef.current.send("/app/chat", {}, JSON.stringify(messageObj));
    }
  }, [isConnected, activeRoom, memberId, name]);

  const autoSelect = async () => {
    try {
      const res = await axios.get("/employee/info");
      const userInfo = res.data;
      setMemberId(userInfo.id);
      setName(userInfo.name);
      setProfile(userInfo.profileFile);
      setParticipants(prev => {
        const isAlreadyAdded = prev.some(participant => participant.memberId === userInfo.id);
        if (!isAlreadyAdded) {
          return [...prev, { memberId: userInfo.id, name: userInfo.name, profile: userInfo.profileFile }];
        }
        return prev;
      });
      console.log("내 정보 추가 성공");
    } catch (err) {
      console.error("내 정보 가져오기 실패:", err);
    }
  };

  const getChatRoomList = async () => {
    try {
      const res = await axios.post('/chat/list', { memberId }, {
        headers: { 'Content-Type': 'application/json' },
      });
      setChatRoomList(res.data);
      setFilteredRoomList(res.data);
    } catch (err) {
      console.error("채팅방 목록 가져오기 실패:", err);
    }
  };

  const handleModalSelect = (value) => {
    setParticipants(prev => {
      const existingIds = prev.map(participant => participant.memberId);
      const newParticipants = value
        .filter(item => !existingIds.includes(item.id))
        .map(item => ({
          memberId: item.id,
          name: item.name,
          profile: item.profileFile
        }));
      const allParticipants = [...prev, ...newParticipants];
      return allParticipants.filter((participant, index, self) =>
        index === self.findIndex(p => p.memberId === participant.memberId)
      );
    });
    setShowRoomInput(true);
    setModalOpen(false);
  };

  const createChatting = async () => {
    const currentDate = new Date();
    const data = {
      chatRoomId: '',
      chatRoomName,
      participants,
      lastMessage: '',
      topic: participants.length === 2 ? 'create-room-one' : 'create-room-many',
      lastActive: currentDate.toISOString()
    };
    try {
      await axios.post("/chat/create", data, {
        headers: { 'Content-Type': 'application/json' }
      });
      getChatRoomList();
      setChatRoomName('');
      setParticipants([]);
      setShowRoomInput(false);
    } catch (err) {
      console.error("채팅방 생성 실패:", err);
    }
  };

  const handleRoomClick = (room) => {
    setActiveRoom(room);
    setIsChatRoomVisible(true);
  };

  const handleCloseChatRoom = () => {
    setIsChatRoomVisible(false);
    setTimeout(() => setActiveRoom(null), 300);
  };

  const formatDate = (dateString, lastMessage) => {
    if (!dateString || !lastMessage) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const formatTwoDigits = (num) => num.toString().padStart(2, '0');
    const hours = formatTwoDigits(date.getHours());
    const minutes = formatTwoDigits(date.getMinutes());
    if (isToday) {
      return `${hours}:${minutes}`;
    } else {
      const month = formatTwoDigits(date.getMonth() + 1);
      const day = formatTwoDigits(date.getDate());
      return `${month}/${day}`;
    }
  };

  const formatDate2 = (dateString) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const updateChatRoomList = (chatRoomId, lastMessage) => {
    const updateRoom = (room) =>
      room.chatRoomId === chatRoomId
        ? { ...room, lastMessage, lastActive: new Date() }
        : room;
    
    setChatRoomList(prevList => prevList.map(updateRoom));
    setFilteredRoomList(prevList => prevList.map(updateRoom));
  };

  return (
    <div className="chat-container">
      <div className="sidebar-container">
        <Sidebar
          formatDate={formatDate}
          setActiveRoom={setActiveRoom}
          filteredRoomList={filteredRoomList}
          setFilteredRoomList={setFilteredRoomList}
          onRoomClick={handleRoomClick}
          openModal={() => setModalOpen(true)}
          memberId={memberId}
          getChatRoomList={getChatRoomList}
          chatRoomList={chatRoomList}
          updateChatRoomList={updateChatRoomList}
        />
      </div>
      <div className={`chatroom-container ${isChatRoomVisible ? 'visible' : ''}`}>
        {activeRoom && (
          <ChatRoomContainer
          formatDate2={formatDate2}
          activeRoom={activeRoom}
          chatRoomId={activeRoom.chatRoomId}
          memberId={memberId}
          profile={profile}
          participants={activeRoom.participants}
          name={name}
          topic={activeRoom.topic}
          getChatRoomList={getChatRoomList}
          onClose={handleCloseChatRoom}
          updateChatRoomList={updateChatRoomList}
          isConnected={isConnected}
          sendMessage={sendMessage}
          messages={messages}
        />
        )}
      </div>
      {!isChatRoomVisible && (
        <img src={logo} alt="Logo" className={`grey-logo ${isChatRoomVisible ? 'visible' : ''}`} />
      )}
      <GroupModal open={modalOpen} onClose={() => setModalOpen(false)} onSelect={handleModalSelect} />
      <Modal show={showRoomInput} onHide={() => setShowRoomInput(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>방 제목 입력</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>참가자: {participants.map(p => p.name).join(', ')}</p>
          <input
            type="text"
            value={chatRoomName}
            onChange={(e) => setChatRoomName(e.target.value)}
            placeholder="방 제목 입력"
            style={{width: '100%', padding: '10px', margin: '10px 0'}}
          />
        </Modal.Body>
        <Modal.Footer>
          <button onClick={createChatting} style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#5CB85C',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            방 만들기
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Chat;