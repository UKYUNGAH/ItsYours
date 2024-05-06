import React, { useEffect, useState } from 'react';
import {
	ProfileWrap,
	Profile,
	ProfileImg,
	ProfileInfo,
	Wrap,
	NickName,
	Notification,
	BookName,
	SendTime,
} from './ChatListProfileStyle';

function ChatListProfile({ userInfo, productInfo }) {
	const [insertProduct, setInsertProduct] = useState({});

	const [isActive, setIsActive] = useState(false);
	function handleClick() {
		setIsActive(!isActive);
	}

	useEffect(() => {}, []);
	return (
		<ProfileWrap className={isActive ? 'active' : ''} onClick={handleClick}>
			<Profile>
				<ProfileImg src={userInfo.profilePic} />
			</Profile>
			<ProfileInfo>
				<Wrap>
					<NickName>{userInfo.nickName}</NickName>
					<Notification />
				</Wrap>
				<Wrap>
					<BookName>{productInfo.name}</BookName>
					{/* <SendTime>1시간 전</SendTime> */}
				</Wrap>
			</ProfileInfo>
		</ProfileWrap>
	);
}

export default ChatListProfile;
