//전자결재 모달 창 내 테이블 
import { useTheme, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableHead, TableBody, TableRow, TableCell, Button } from "@mui/material";
import { tokens } from "../theme";
import CloseIcon from '@mui/icons-material/Close';

const TableModal = ({ isOpen, handleClose }) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    return (
        <Dialog 
            open={isOpen} 
            onClose={handleClose}   
            PaperProps={{
                sx: {
                    backgroundColor: colors.gray[150],
                    color: colors.primary[150],
                    width: '1200px',  // 모달 너비
                    height: '600px',  // 모달 높이
                    maxWidth: 'none',  // 기본 maxWidth 제한을 제거

                }
            }}>
            <DialogTitle >
                결재 작성
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'black',  // 아이콘 색상을 검정색으로 설정
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                결재라인 설정

            </DialogContent>
            <DialogActions sx={{ backgroundColor: '#444' }}>
                <Button onClick={handleClose} sx={{ color: '#fff' }}>
                    닫기
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TableModal;
