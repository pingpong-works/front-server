import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { tokens } from "../../theme";
import { Header } from "../../components";
import { formatDate } from "@fullcalendar/core";
import useModal from "./useModal";
import { useNavigate } from "react-router-dom";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMdDevices = useMediaQuery("(max-width:920px)");
  const isSmDevices = useMediaQuery("(max-width:600px)");
  const [currentEvents, setCurrentEvents] = useState([]);
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 상태
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      navigate('/login'); // 로그인 페이지로 리다이렉트
    } else {
      fetchUserInfo(accessToken); // 사용자 정보 가져오기
    }
  }, [navigate]);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get("http://localhost:8081/employees/my-info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserInfo(response.data.data); // 사용자 정보 저장
    } catch (error) {
      alert("사용자 정보를 가져오는 데 실패했습니다.");
    }
  };

  const fetchEvents = async () => {
    if (!userInfo) return; // 사용자 정보가 없으면 실행하지 않음
    if (!userInfo.departmentId) return;
    try {
      const response = await axios.get("http://localhost:8084/calendars", {
        params: {
          departmentId: userInfo.departmentId,
        },
      });

      const data = response.data;

      const events = data
        .map((item) => {
          const start = new Date(item.startTime);
          const end = new Date(item.endTime);

          let backgroundColor = colors.greenAccent[500];
          if (item.carBookId) {
            backgroundColor = colors.redAccent[500];
          } else if (item.roomBookId) {
            backgroundColor = colors.blueAccent[500];
          }

          return {
            id: item.calendarId,
            title: item.title,
            start: start,
            end: end,
            allDay: false,
            content: item.content,
            backgroundColor,
          };
        })
        .sort((a, b) => a.start - b.start);

      setCurrentEvents(events);
    } catch (error) {
      alert("일정 정보를 가져오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    if (userInfo) {
      fetchEvents();
    }
  }, [userInfo]);

  const { showModal, modal } = useModal(fetchEvents);

  const handleDateClick = async (selected) => {
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();

    const inputValues = await showModal(
      "일정 추가",
      "일정을 입력하세요:",
      "add"
    );

    if (inputValues && userInfo) {
      const { title, start, end, content, isReservation, reservationType, selectedOption, purpose } = inputValues;

      if (!title) {
        alert("제목을 입력해주세요.");
        return;
      }
  
      if (!content) {
        alert("내용을 입력해주세요.");
        return;
      }
  
      if (!start) {
        alert("시작일을 입력해주세요.");
        return;
      }

      if (!end) {
        alert("종료일을 입력해주세요.");
        return;
      }

      if (!isReservation) {
        const newEvent = {
          title: title,
          content: content,
          startTime: new Date(start).toISOString(),
          endTime: new Date(end).toISOString(),
        };

        try {
          const response = await axios.post(`http://localhost:8084/calendars?departmentId=${userInfo.departmentId}`, newEvent);

          if (response.status === 201) {
            fetchEvents();
          } else {
            alert("일정을 작성하는 데 실패했습니다.");
          }
        } catch (error) {
          alert("일정을 작성하는 데 실패했습니다.");
        }
      } else {
        let reservationUrl = "";
        let requestBody = {
          bookStart: new Date(start).toISOString(),
          bookEnd: new Date(end).toISOString(),
          purpose: purpose,
        };

        if (reservationType === "car") {
          reservationUrl = `http://localhost:8084/cars/${selectedOption}/books?employeeId=${userInfo.employeeId}&title=${title}&content=${content}`;
        } else if (reservationType === "room") {
          reservationUrl = `http://localhost:8084/rooms/${selectedOption}/books?employeeId=${userInfo.employeeId}&title=${title}&content=${content}`;
        }

        if (!reservationType) {
          alert("예약타입을 선택해주세요.");
          return;
        }

        if (!selectedOption) {
          alert("예약 목록을 선택해주세요.");
          return;
        }

        if (!requestBody.purpose) {
          alert("목적을 선택해주세요.");
          return;
        }

        if (reservationUrl) {
          try {
            const response = await axios.post(reservationUrl, requestBody);

            if (response.status === 201) {
              fetchEvents();
            } else {
              alert("일정을 작성하는 데 실패했습니다.");
            }
          } catch (error) {
            alert("일정을 작성하는 데 실패했습니다.");
          }
        }
      }
    }
  };

  const handleEventClick = async (selected) => {
    try {
      const response = await axios.get(`http://localhost:8084/calendars/${selected.event.id}`);
      const eventData = response.data.data;

      const isOwner = eventData.departmentId === userInfo.departmentId;

      const carBookId = eventData.carBookId || null;
      const roomBookId = eventData.roomBookId || null;

      await showModal(
        `${eventData.title}`,
        "",
        "view",
        {
          id: eventData.calendarId,
          ...eventData,
          isOwner,
          carBookId,
          roomBookId,
        }
      );
    } catch (error) {
      alert("일정을 가져오는 데 실패했습니다.");
    }
  };

  return (
    <Box m="20px">
      <Header title="캘린더"/>

      <Box display="flex" justifyContent="center" mb={2}>
        <Box display="flex" alignItems="center" mr={3}>
          <Box
            width={20}
            height={20}
            bgcolor={colors.greenAccent[500]}
            mr={1}
            borderRadius="50%"
          />
          <Typography color={colors.gray[100]}>일반 일정</Typography>
        </Box>
        <Box display="flex" alignItems="center" mr={3}>
          <Box
            width={20}
            height={20}
            bgcolor={colors.redAccent[500]}
            mr={1}
            borderRadius="50%"
          />
          <Typography color={colors.gray[100]}>차량 예약</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box
            width={20}
            height={20}
            bgcolor={colors.blueAccent[500]}
            mr={1}
            borderRadius="50%"
          />
          <Typography color={colors.gray[100]}>회의실 예약</Typography>
        </Box>
      </Box>

      <Box display="flex" justifyContent="space-between" gap={2}>
        <Box
          display={`${isMdDevices ? "none" : "block"}`}
          flex="1 1 20%"
          bgcolor={colors.primary[400]}
          p="15px"
          borderRadius="4px"
        >
          <Typography variant="h5">Events</Typography>
          <List>
            {currentEvents
              .filter((event) => event.end > new Date())
              .map((event) => (
                <ListItem
                  key={event.id}
                  sx={{
                    bgcolor: `${event.backgroundColor}`,
                    my: "10px",
                    borderRadius: "2px",
                  }}
                >
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <Typography>
                        {formatDate(event.start, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
          </List>
        </Box>

        <Box
          flex="1 1 100%"
          sx={{
            "& .fc-list-day-cushion ": {
              bgcolor: `${colors.greenAccent[500]} !important`,
            },
          }}
        >
          <FullCalendar
            height="75vh"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: `${isSmDevices ? "prev,next" : "prev,next today"}`,
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            events={currentEvents}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: false,
            }}
          />
        </Box>
      </Box>
      {modal}
    </Box>
  );
};

export default Calendar;
