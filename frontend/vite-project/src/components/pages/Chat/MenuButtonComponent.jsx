import React, { useState } from 'react';
import ReportModal from './ReportModal';
import ToastPopup from '../../TostPopUp';
import Modal from '../../Modal';
import { MenuButton, Img, Menu, MenuItem } from './ChatRoomHeaderStyle';
import { thumbUp, thumbDown, confirmBuying, quitChat } from '../../../apis/service/Chat.api';

function MenuButtonComponent({ userInfo, productInfo, myInfo }) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [reportModalOpen, setReportModalOpen] = useState(false);
	const [toastMessage, setToastMessage] = useState(''); // 토스트 메시지 상태 추가
	const [buyUserModalOpen, setBuyUserModalOpen] = useState(false); // 사용자  모달 상태 추가
	const [leaveRoomModalOpen, setLeaveRoomModalOpen] = useState(false); // 채팅방 나가기 모달 상태 추가

	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
	};

	const openReportModal = () => {
		setReportModalOpen(true);
	};

	const closeReportModal = () => {
		setReportModalOpen(false);
	};

	const handleBuyUser = () => {
		setBuyUserModalOpen(true);
	};

	const handleLeaveRoom = () => {
		setLeaveRoomModalOpen(true);
	};

	const handleCloseModal = () => {
		console.log(productInfo._id);
		confirmBuying(productInfo._id);
		setBuyUserModalOpen(false);
		setLeaveRoomModalOpen(false);
		navigate('/');
	};

	const quitRoom = async () => {
		console.log(productInfo._id, userInfo);
		await quitChat(productInfo._id, userInfo._id, myInfo);
		setBuyUserModalOpen(false);
		setLeaveRoomModalOpen(false);
		navigate('/');
	};

	const handleToastMessage = message => {
		setToastMessage(message);
		setTimeout(() => {
			setToastMessage('');
		}, 3000); // 3초 후에 토스트 메시지 초기화
	};

	return (
		<>
			<MenuButton onClick={toggleMenu}>
				<Img src="/menu_bar.svg" />
				<Menu open={menuOpen}>
					<MenuItem
						onClick={() => {
							handleToastMessage(`${userInfo.nickName}님에게 칭찬하였습니다.`);
							thumbUp(userInfo._id);
						}}
					>
						매너 칭찬하기
					</MenuItem>
					<MenuItem
						onClick={() => {
							handleToastMessage(`${userInfo.nickName}님에게 비판하였습니다.`);
							thumbDown(userInfo._id);
						}}
					>
						매너 비판하기
					</MenuItem>
					<MenuItem onClick={handleBuyUser}>구매확정</MenuItem>
					<MenuItem onClick={openReportModal}>신고하기</MenuItem>
					<MenuItem onClick={handleLeaveRoom}>채팅방 나가기</MenuItem>
				</Menu>
			</MenuButton>
			<ReportModal isOpen={reportModalOpen} onClose={closeReportModal} />
			{toastMessage && <ToastPopup message={toastMessage} />}
			<Modal
				isOpen={buyUserModalOpen}
				onClose={handleCloseModal}
				title={`${userInfo.nickName}님과의 
				구매를 확정하겠습니까?`}
				content={
					<>
						이제너할 수 있도록! 구매를 확정 지어주세요 :)
						<br />
						다음 구매와 판매도 이제너해와 함께 해주세요!
					</>
				}
				confirmText="구매 확정하기"
				onConfirm={handleCloseModal}
			/>
			<Modal
				isOpen={leaveRoomModalOpen}
				onClose={handleCloseModal}
				title="채팅방을 나가시겠습니까?"
				content=<>
					채팅방을 떠나시면 모든 대화 기록이 사라집니다.
					<br />
					정말로 나가시겠어요?
				</>
				confirmText="나가기"
				onConfirm={quitRoom}
			/>
		</>
	);
}

export default MenuButtonComponent;
