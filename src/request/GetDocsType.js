import axios from 'axios'; 
import Swal from 'sweetalert2';

const getDocsTypeAllRequest = async (state, page, size, setDocuments, sort, direction, setIsLoading) => {
    setIsLoading(true); // 요청 시작 시 로딩 상태 true
    try {
        const params = {
            page,
            size,
            sort: 'id',
            direction: 'asc'
        };

        const response = await axios.get(`http://localhost:57679/docs-types`, {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': state.token  // 토큰이 필요할 경우 사용
            }, 
            params
        });

        if (response.status === 200) {
            console.log('문서타입 GET요청 성공: ', response.data);

            if (response.data.data && response.data.data.length > 0) {
                setDocuments(response.data);  // 받아온 데이터를 설정
            } else {
                setDocuments({ data: [] });  // 데이터가 없을 경우 빈 배열 설정
                Swal.fire({ text: '데이터가 없습니다.' });
            }
        } else {
            console.error('Failed to fetch documents data:', response.status);
            Swal.fire({ text: `문서 타입 요청 실패(${response.status})` });
            setDocuments({ data: [] });
        }
        
    } catch (error) {
        console.error('데이터 요청 중 오류 발생:', error);
        Swal.fire({ text: '데이터를 가져오는 중 오류가 발생했습니다.' });
        setDocuments({ data: [] });  // 에러 발생 시에도 빈 배열로 설정
    } finally {
        setIsLoading(false);  // 최종적으로 로딩 상태 false
    }
};

export default getDocsTypeAllRequest;
