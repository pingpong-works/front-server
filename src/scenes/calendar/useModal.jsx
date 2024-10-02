import React, {useEffect, useState} from 'react';
import DeleteModal from "./deleteModal.jsx";
import AddModal from "./addModal.jsx";

const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [resolvePromise, setResolvePromise] = useState(null);
    const [modalContent, setModalContent] = useState({title: '', message: '', type: 'confirm'});
    const [inputValues, setInputValues] = useState({title: '', start: '', end: '', description: ''});

    // 동기처리를 하여 값이 변경되었는지 확인하기 위해서 잠깐 추가
    useEffect(() => {
        console.log('Modal Open State Changed:', isOpen);
    }, [isOpen]);
    const showModal = (title, message, type = 'confirm') => {
        console.log('showModal Called !')
        setModalContent({title, message, type});
        setIsOpen(true);
        console.log('Modal Open State:', isOpen); // 비동기 처리이기 때문에 아직 false 값을 반환한다.
        return new Promise((resolve) => {
            setResolvePromise(() => resolve);
        });
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (resolvePromise) resolvePromise(false);
    };

    const handleSubmit = () => {
        setIsOpen(false);
        if (resolvePromise) {
            if (modalContent.type === 'prompt') {
                resolvePromise(inputValues);
            } else {
                resolvePromise(true);
            }
        }
    };

    const modal = modalContent.type === 'confirm' ? (
        <DeleteModal
            isOpen={isOpen}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            title={modalContent.title}
            message={modalContent.message}
        />) : (
        <AddModal
            isOpen={isOpen}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            inputValues={inputValues}
            setInputValues={setInputValues}
        />
    );

    return {showModal, modal};
};

export default useModal;