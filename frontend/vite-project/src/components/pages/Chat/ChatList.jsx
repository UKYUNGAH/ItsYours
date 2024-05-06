import React, { useEffect, useState, useContext } from 'react';
import ChatListProfile from './ChatListProfile';
import { ChatListWrap, ChatListHeader, ChatContainer } from './ChatListStyle';
import { getChatList, getChatDetail } from '../../../apis/service/Chat.api';
import { ClickedChatContext } from '../../../pages/Chat';
import { useNavigate } from 'react-router-dom';
import UserIdContext from '../../../context/UserIdContext';

// 채팅방의 리스트 (왼쪽 만드는 페이지)
function ChatList() {
	const [userInfo, setuserInfo] = useState([]); // 상대방 정보
	const [productInfo, setProductInfo] = useState([]); // 제품 정보
	const [chatRoomLists, setChatRoomLists] = useState({}); // 내 속한 채팅방 리스트
	const [isLoaded, setIsLoaded] = useState(false);
	const { setClickedChatroom, clickedChatroom } = useContext(ClickedChatContext);
	const { id } = useContext(UserIdContext);
	const navigate = useNavigate();

	useEffect(() => {
		async function getList() {
			try {
				const res = await getChatList(); // 현 유저가 속한 채팅방 리스트 가져오기
				setChatRoomLists(res); // 리스트 저장
				console.log('채팅 리스트', res);
				const usersIds = [];
				const productIds = [];

				// 각 채팅방의 상세 정보 가져오기
				await Promise.all(
					res.map(async chatRoomList => {
						// console.log('각 채팅방 id', chatRoomList._id);
						const detailRes = await getChatDetail(chatRoomList._id);
						console.log('id1', detailRes.buyerInfo.id);
						console.log('id2', detailRes.sellerInfo.id);

						if (id == detailRes.buyerInfo.id) {
							usersIds.push(detailRes.sellerInfo);
						} else {
							usersIds.push(detailRes.buyerInfo);
						}
						productIds.push(detailRes.product);
					}),
				);

				setuserInfo(usersIds);
				setProductInfo(productIds);
				setIsLoaded(true);
				console.log(userInfo);
				console.log(productInfo);
			} catch (error) {
				console.error('오류가 발생했습니다	:', error);
			}
		}
		getList();
	}, []);

	function handleChatItem(chatroomId) {
		// console.log(chatroomId);
		navigate(`/chat/${chatroomId}`);
	}

	return (
		<ChatListWrap>
			<ChatListHeader>
				<img src="/logoCharacter.png" alt="" />
				Chat List
			</ChatListHeader>
			<ChatContainer>
				{isLoaded &&
					chatRoomLists.map((chatRoomList, i) => (
						<div
							key={`item=${i}`}
							onClick={() => {
								// console.log('중요', chatRoomList);
								// console.log('순서', i);
								handleChatItem(chatRoomList._id);
							}}
						>
							<ChatListProfile
								userInfo={userInfo[i]}
								productInfo={productInfo[i]}
								product={chatRoomList.productId}
							/>
						</div>
					))}
			</ChatContainer>
		</ChatListWrap>
	);
}

export default ChatList;
