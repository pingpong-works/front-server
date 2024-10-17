import React, { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from "./chatList.jsx";
import ChatRoomContainer from "./ChatRoomContainer.jsx";
import GroupModal from "../../components/groupModal.jsx";
import './Chat.css';
import axios from "axios";
import logo from "../../../public/logo.png";
import useWebSocket from '../../hooks/useWebSocker.js';

const Chat = () => {
  const [activeRoom, setActiveRoom] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [chatRoomName, setChatRoomName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [name, setName] = useState('');
  const [chatRoomList, setChatRoomList] = useState([]);
  const [filteredRoomList, setFilteredRoomList] = useState([]);
  const [profile, setProfile] = useState('');
  const [isChatRoomVisible, setIsChatRoomVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const participantsRef = useRef([]); // useRef로 변경
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const createChatting = async () => {
    console.log(participantsRef.current);
    if (participantsRef.current.length != 2) {
      alert("1:1 방을 만들려면 한 명의 참가자가 필요합니다.");
      return;
    }

    const currentDate = new Date();
    const data = {
      chatRoomId: '',  // 새 방이므로 빈 값
      chatRoomName: `${participantsRef.current[0].name}와의 채팅방`,  // 1:1 방 이름 설정
      participants: participantsRef.current,
      lastMessage: '',
      topic: 'one-to-one-chat',
      lastActive: currentDate.toISOString()
    };

    try {
      await axios.post("http://localhost:8085/chat/create", data, {
        headers: { 'Content-Type': 'application/json' }
      });

      // 채팅방 목록을 새로 불러오고 모달 닫기
      getChatRoomList();
      setChatRoomName('');
      await autoSelect();
      setShowRoomInput(false); // 방 이름 입력 모달 닫기
    } catch (err) {
      console.error("채팅방 생성 실패:", err);
    }
  };

  // WebSocket 훅 사용
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

  console.log('memberId:', memberId);
  console.log('chatRoomId:', activeRoom?.chatRoomId);
  console.log('topic:', activeRoom?.topic);

  useEffect(() => {
    autoSelect();
  }, []);

  useEffect(() => {
    if (memberId) {
      getChatRoomList();
    }
  }, [memberId, name, profile]);

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
      const res = await axios.get("http://localhost:8081/employees/my-info", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const userInfo = res.data.data;
      console.log(userInfo);
      setMemberId(userInfo.employeeId);
      setName(userInfo.name);
      setProfile(userInfo.email);
      participantsRef.current = [{ userId: userInfo.employeeId, name: userInfo.name, profile: userInfo.profileFile }];
      console.log("내 정보 추가 성공");
    } catch (err) {
      console.error("내 정보 가져오기 실패:", err);
    }
  };

  const getChatRoomList = useCallback(async () => {
    try {
      const res = await axios.post('http://localhost:8085/chat/list', {
        userId: memberId,
        name: name,
        profile: profile
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
        }
      });
      setChatRoomList(res.data);
      setFilteredRoomList(res.data);
    } catch (err) {
      console.error("채팅방 목록 가져오기 실패:", err);
    }
  }, [memberId, name, profile]);

  const handleModalSelect = (selectedParticipant) => {
    console.log("currentParticipants: ", participantsRef.current);
    if(participantsRef.current.length == 1) {
      participantsRef.current = [...participantsRef.current, { userId: selectedParticipant.employeeId, name: selectedParticipant.name, profile: selectedParticipant.profileFile }];
      createChatting();
      setModalOpen(false); // 모달 닫기
      setShowRoomInput(true); // 방 이름 입력 모달 표시
    } else if(participantsRef.current.length == 2) {
      participantsRef.current = [participantsRef.current[0], { userId: selectedParticipant.employeeId, name: selectedParticipant.name, profile: selectedParticipant.profileFile }];
      createChatting();
      setModalOpen(false); // 모달 닫기
      setShowRoomInput(true); // 방 이름 입력 모달 표시
    } else {
      alert("참가자가 너무 많습니다.");
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
    </div>
  );
};

export default Chat;