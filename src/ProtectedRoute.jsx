import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useStore from './store';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ element }) => {
    const { isLogined, initializeState } = useStore(state => state);
    const [isChecking, setIsChecking] = useState(true);  // 상태 초기화

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await initializeState();  // 비동기로 인증 상태 확인
            } finally {
                setIsChecking(false);  // 인증 상태 확인 후 로딩 중단
            }
        };
        checkAuth();
    }, [initializeState]);

    if (isChecking) {
        // 로딩 중일 때 표시되는 UI
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress
                    sx={{
                        color: '#ffb121',
                    }}
                />
            </Box>
        );
    }

    // 로그인 상태가 확인되면 페이지 렌더링, 그렇지 않으면 /login으로 리디렉션
    return isLogined ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
