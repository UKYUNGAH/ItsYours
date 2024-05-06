import { useState, useEffect, useContext } from 'react';
import UserIdContext from '../../../context/UserIdContext';
import ChatRoomHeader from './ChatRoomHeader';
import {
	ChatRoomWrap,
	ChatSction,
	ChatContainer,
	ChatDate,
	ChatWrap,
	SendTextWrap,
	SendTime,
	SendText,
	ReplyTextWrap,
	ReplyTime,
	ReplyText,
	InputWrap,
	TextAreaText,
} from './ChatRoomStyle';
import { useParams } from 'react-router-dom';
import { postChat, getChatDetail } from '../../../apis/service/Chat.api';
import { ClickedChatContext } from '../../../pages/Chat';
import chatTime from '../../../utils/chatTime';

import io from 'socket.io-client';
const socket = io.connect('http://localhost:4000');

function ChatRoom() {
	const [placeholder, setPlaceholder] = useState('메시지 입력해 주세요.');
	const [isInputFocused, setIsInputFocused] = useState(false);
	const [sendMes, setSendMes] = useState('');

	const [receivedMes, setReceivedMes] = useState([]); // 여기에 전체 (수신 + 발신 )
	const [isLoaded, setIsLoaded] = useState(false); // 채팅 화면 초기 세팅 (목록 누르거나, 주소타고 들어온 경우에 보이게 )

	const { id } = useContext(UserIdContext);
	const { chatroomId } = useParams();

	const [userInfo, setUserInfo] = useState([]);
	const [productInfo, setProductInfo] = useState([]);
	const [myInfo, setMuInfo] = useState();

	// 입력창 포커스 관리 핸들러
	const handleFocus = () => {
		setIsInputFocused(true);
		setPlaceholder('');
	};

	// 입력창 포커스 아웃 관리 핸들러
	const handleBlur = () => {
		setIsInputFocused(false);
		setPlaceholder('메시지 입력해 주세요.');
	};

	async function handleKeyDown(e) {
		if (e.key === 'Enter') {
			socket.emit('send_message', { message: sendMes, roomNum: chatroomId, sendId: id });
			setSendMes('');
			const [sentMessageResponse, chatDetailResponse] = await Promise.all([
				postChat(chatroomId, sendMes),
				getChatDetail(chatroomId),
			]);
			setReceivedMes(chatDetailResponse.messages);
		}
	}
	// 메시지 전송 내용
	function onChange(e) {
		setSendMes(e.target.value);
	}
	useEffect(() => {
		async function getRoom() {
			// console.log('챗룸', chatroomId);
			const res = await getChatDetail(chatroomId);
			// console.log('내가 누른', res);
			setIsLoaded(true);
			if (id === res.buyerInfo.id) {
				setUserInfo(res.sellerInfo);
				setMuInfo(res.buyerInfo._id);
			} else {
				setUserInfo(res.buyerInfo);
				setMuInfo(res.sellerInfo._id);
			}
			setProductInfo(res.product);
			setReceivedMes(res.messages);
			console.log(res.messages.content);
			socket.emit('ask_join', { roomNum: chatroomId });
		}
		getRoom();
	}, [chatroomId]);

	// socket 랜더링시, 방 조인 + 메시지 수신
	useEffect(() => {
		socket.on('message_broadcast', data => {
			console.log(data.message);
			setReceivedMes(data.message);
		});
	}, [socket]);

	return (
		<>
			{isLoaded && (
				<ChatRoomWrap>
					<ChatSction>
						<ChatRoomHeader userInfo={userInfo} productInfo={productInfo} myInfo={myInfo} />
						<ChatContainer>
							<ChatDate>채팅방이 생성되었습니다.</ChatDate>
							<ChatWrap>
								{receivedMes.map((msg, i) => {
									return msg.chatAuth.id === id ? (
										<SendTextWrap key={i}>
											<SendTime>{chatTime(msg.chatCreatedAt)}</SendTime>
											<SendText>{msg.content}</SendText>
										</SendTextWrap>
									) : (
										<ReplyTextWrap key={i}>
											<ReplyText>{msg.content}</ReplyText>
											<ReplyTime>{chatTime(msg.chatCreatedAt)}</ReplyTime>
										</ReplyTextWrap>
									);
								})}
							</ChatWrap>
						</ChatContainer>
					</ChatSction>
					<InputWrap className="inputwrap">
						<TextAreaText
							className="inputtext"
							type="text"
							placeholder={placeholder}
							onFocus={handleFocus}
							onBlur={handleBlur}
							onKeyDown={handleKeyDown}
							onChange={onChange}
							value={sendMes}
						></TextAreaText>
					</InputWrap>
				</ChatRoomWrap>
			)}
		</>
	);
}

export default ChatRoom;
