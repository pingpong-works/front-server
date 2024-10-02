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
import listPlugin from "@fullcalendar/list";
import { tokens } from "../../theme";
import { useState } from "react";
import { Header } from "../../components";
import { formatDate } from "@fullcalendar/core";
import useModal from "./useModal";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMdDevices = useMediaQuery("(max-width:920px)");
  const isSmDevices = useMediaQuery("(max-width:600px)");
  const isXsDevices = useMediaQuery("(max-width:380px)");
  const [currentEvents, setCurrentEvents] = useState([]);
  const {showModal, modal} = useModal();

  const handleDateClick = async (selected) => {
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();

    const inputValues = await showModal("일정 추가", "일정을 입력하세요:", 'prompt');
    if (inputValues) {
        const { title, start, end, description } = inputValues;
        const event = {
            id: `${selected.startStr}-${title}`,
            title,
            start: new Date(start), // start 값 설정
            end: new Date(end), // end 값 설정
            allDay: selected.allDay,
            description,
        };
        // 시간을 로컬 시간 형식으로 변환
        const localStart = new Date(start).toLocaleString();
        const localEnd = new Date(end).toLocaleString();
        console.log(`Adding Event: ${event.title} | Start: ${localStart} | End: ${localEnd}`); // 콘솔에 로그 출력
        calendarApi.addEvent(event);
    }
};
const handleEventClick = async (selected) => {
    const result = await showModal(
        `${selected.event.title}`,
        `해당일정을 정말로 취소하시겠습니까?`
    );
    if (result) {
        selected.event.remove();
    }
};
return (
    <Box m="20px">
        <Header title="Calendar" subtitle="Full Calendar Interactive Page"/>
        <Box display="flex" justifyContent="space-between" gap={2}>
            {/* CALENDAR SIDEBAR */}
            <Box
                display={`${isMdDevices ? "none" : "block"}`}
                flex="1 1 20%"
                bgcolor={colors.primary[400]}
                p="15px"
                borderRadius="4px"
            >
                <Typography variant="h5">Events</Typography>
                <List>
                    {currentEvents.map((event) => (
                        <ListItem
                            key={event.id}
                            sx={{
                                bgcolor: `${colors.greenAccent[500]}`,
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

            {/* CALENDAR */}
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
                    plugins={[
                        dayGridPlugin,
                        timeGridPlugin,
                        interactionPlugin,
                        listPlugin,
                    ]}
                    headerToolbar={{
                        left: `${isSmDevices ? "prev,next" : "prev,next today"}`,
                        center: "title",
                        right: `${
                            isXsDevices
                                ? ""
                                : isSmDevices
                                    ? "dayGridMonth,listMonth"
                                    : "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
                        }`,
                    }}
                    initialView="dayGridMonth"
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    select={handleDateClick}
                    eventClick={handleEventClick}
                    eventsSet={(events) => setCurrentEvents(events)}
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: false,
                    }} // 시간 포맷 설정
                />
            </Box>
        </Box>
        {modal}
    </Box>
);
};

export default Calendar;