import axios from "axios";
import Swal from "sweetalert2";

const sendPostDocumentSaveRequest = async(state, requestBody, executeAfter) => {
    try{
        const response = await axios.post('http://localhost:50001/documents/save',
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    //'Authorization': state.token
                }   
            }
        );
        if(response.status === 200 || response.status === 201){
            console.log('결재문서 임시저장 성공', response);
            if(executeAfter !== undefined){
                executeAfter();
            }
        }else{
            console.log('결재문서 임시저장 실패: ', response.status);
            Swal.fire({text: `요청 실패(${response.status})`});
        }
    } catch(error){
        console.error('결재문서 임시저장 실패(에러 발생): ', error);
        Swal.fire({text: `요청 실패(${error.status})`});
    }
}
export default sendPostDocumentSaveRequest;