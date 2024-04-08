import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicForm from '../../Users/DynamicForm';
import Modal from '../../Users/Modal';
import sendDataToServer from '../../Users/sendDataToServer';

const FindPasswordForm = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(''); 
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const isEmailSent = await sendDataToServer('http://example.com/api/send-password', { userId, email });
    setIsModalOpen(true); 
    if (isEmailSent) {
      setModalMessage(`입력하신 이메일 주소로 비밀번호를 보냈습니다.\n이메일을 확인해주세요.`);
      setTimeout(() => {
        setIsModalOpen(false); 
        navigate('/login'); 
      }, 3000); 
    } else {
      setModalMessage('해당 정보를 가진 사용자를 찾을 수 없습니다.\n다시 확인해주세요.');
    }
  };

  return (
    <>
    <DynamicForm
      inputPlaceholder1="아이디를 입력해주세요" 
      inputPlaceholder2="이메일을 입력해주세요"
      buttonText="비밀번호 찾기" 
      onSubmit={handleSubmit}
      setInput1={setUserId} 
      setInput2={setEmail} 
    />
      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen}
          message={modalMessage}
          onClose={() => setIsModalOpen(false)}
        />
    )}
  </>
);
};

export default FindPasswordForm;