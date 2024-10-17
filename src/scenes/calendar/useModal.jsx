import React, { useState, useEffect } from 'react';
import AddModal from "./addModal.jsx";
import DeleteModal from "./deleteModal.jsx";
import ViewModal from "./viewModal.jsx";
import UpdateModal from "./updateModal.jsx";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const useModal = (fetchEvents) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvePromise, setResolvePromise] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [modalType, setModalType] = useState('view');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState(null); // departmentId 상태 추가
  const navigate = useNavigate();
  
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('로그인이 필요합니다.');
        navigate('/login');  // 로그인 페이지로 리다이렉트
    } else {
      fetchUserInfo(accessToken); // 사용자 정보 가져오기
    }
  }, [navigate]);

  // 사용자 정보에서 departmentId 가져오기
  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get("http://localhost:8081/employees/my-info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = response.data.data;
      setDepartmentId(userData.departmentId);
    } catch (error) {
      alert("사용자 정보를 가져오는 데 실패했습니다.");
    }
  };

  const showModal = (title, message, type = 'confirm', details = null) => {
    setEventDetails(details);
    setModalType(type);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const closeModal = () => {
    setIsOpen(false);
    setEventDetails(null);
    setIsDeleteModalOpen(false); 
    if (resolvePromise) resolvePromise(false);
  };

  const handleUpdate = () => {
    setModalType('update');
  };

  const handleUpdateSubmit = async (updatedData) => {
    try {
      const calendarId = eventDetails.id;
      const carBookId = eventDetails.carBookId;
      const roomBookId = eventDetails.roomBookId;

      if (!departmentId) {
        alert('부서 정보가 없습니다.');
        return;
      }

      const ensureSeconds = (timeString) => {
        return timeString.includes(":") && timeString.split(":").length === 2 
          ? `${timeString}:00` 
          : timeString;
      };

      const updatedPayload = {
        id : updatedData.id,
        title: updatedData.title,
        content: updatedData.content,
        startTime: ensureSeconds(updatedData.start),
        endTime: ensureSeconds(updatedData.end)
      };

      if(!updatedPayload.title) {
        alert("제목을 입력해주세요.");
        return;
      }

      if(!updatedPayload.content) {
        alert("내용을 입력해주세요.");
      }

      if (carBookId) {
        const carResponse = await axios.patch(`http://localhost:8084/car-books/${carBookId}`, {
          carId : updatedPayload.id,
          bookStart: updatedPayload.startTime,
          bookEnd: updatedPayload.endTime,
          purpose: updatedData.purpose, 
        }, {
          params: { 
            departmentId, 
            title: updatedPayload.title,
            content: updatedPayload.content
          }
        });

        if (carResponse.status !== 200) {
          alert("차량 예약 변경에 실패했습니다.");
          return;
        }
      }

      if (roomBookId) {
        const roomResponse = await axios.patch(`http://localhost:8084/room-books/${roomBookId}`, {
          roomId : updatedPayload.id,
          bookStart: updatedPayload.startTime,
          bookEnd: updatedPayload.endTime,
          purpose: updatedData.purpose, 
        }, {
          params: { 
            departmentId, 
            title: updatedPayload.title,
            content: updatedPayload.content 
          }
        });

        if (roomResponse.status !== 200) {
          alert("회의실 예약 변경에 실패했습니다.");
          return;
        }
      }

      if (!carBookId && !roomBookId) {
        const response = await axios.patch(`http://localhost:8084/calendars/${calendarId}`, updatedPayload, {
          params: { departmentId }
        });

        if (response.status !== 200) {
          alert("일정 변경에 실패했습니다.");
          return;
        }
      }

      setIsOpen(false);

      if (resolvePromise) resolvePromise(true);

      if (fetchEvents) {
        fetchEvents();
      }
      
    } catch (error) {
      alert("일정 변경에 실패했습니다.");
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true); 
  };

  const handleDeleteSubmit = async () => {
    try {
      const calendarId = eventDetails.id;
      const carBookId = eventDetails.carBookId;
      const roomBookId = eventDetails.roomBookId;

      if (!departmentId) {
        alert('부서 정보가 없습니다.');
        return;
      }

      if (carBookId) {
        const carResponse = await axios.delete(`http://localhost:8084/car-books/${carBookId}`, {
          params: { departmentId }
        });
        if (carResponse.status !== 204) {
          alert("차량 예약 삭제에 실패했습니다.");
          return;
        }
      }

      if (roomBookId) {
        const roomResponse = await axios.delete(`http://localhost:8084/room-books/${roomBookId}`, {
          params: { departmentId }
        });
        if (roomResponse.status !== 204) {
          alert("회의실 예약 삭제에 실패했습니다.");
          return;
        }
      }

      if (!carBookId && !roomBookId) {
        const response = await axios.delete(`http://localhost:8084/calendars/${calendarId}`, {
          params: { departmentId }
        });

        if (response.status !== 204) {
          alert("일정 삭제에 실패했습니다.");;
          return;
        }
      }

      setIsDeleteModalOpen(false);
      setIsOpen(false);

      if (resolvePromise) resolvePromise(true);

      if (fetchEvents) {
        fetchEvents();
      }

    } catch (error) {
      alert("일정 삭제에 실패했습니다.");
    }
  };

  const handleSubmit = (data) => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(data);
  };

  const modal = (() => {
    if (modalType === 'add') {
      return (
        <AddModal
          isOpen={isOpen}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      );
    }
    if (modalType === 'update') {
      return (
        <UpdateModal
          isOpen={isOpen}
          eventDetails={eventDetails}
          onCancel={closeModal}
          onSubmit={handleUpdateSubmit}
        />
      );
    }
    return (
      <>
        <ViewModal
          isOpen={isOpen}
          eventDetails={eventDetails}
          onCancel={closeModal}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
        {isDeleteModalOpen && (
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onCancel={() => setIsDeleteModalOpen(false)}
            onSubmit={handleDeleteSubmit}
            title="정말 삭제하시겠습니까?"
          />
        )}
      </>
    );
  })();

  return { showModal, closeModal, modal };
};

export default useModal;
