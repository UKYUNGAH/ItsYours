const { Chatroom, Members, Products, ChatMessage } = require('../models/index');

/*
 * 채팅방 생성 service
 * 작성자 : 김고은
 * 작성 시작일 : 2024-04-17
 * 채팅방 생성시 동작되는 DB작업을 모아놓은 service입니다.
 */
async function createChatroom(buyerId, productId, sellerId) {
	const newRoomData = {
		productId: productId,
		sellerId: sellerId,
		buyerId: buyerId,
		createdAt: new Date(),
	};
	console.log('newData', newRoomData);
	const createChatroom = await Chatroom.create(newRoomData);
	return createChatroom;
}

async function getOneChatRoom(chatroomId) {
	const result = await Chatroom.findOne({ _id: chatroomId });
	return result;
}

async function getChatroomList(memberId) {
	const chatList = await Chatroom.find({ $or: [{ buyerId: memberId }, { sellerId: memberId }] });
	return chatList;
}

async function saveChatMessage(roomObjId, { auth, content }) {
	const newChat = {
		chatRoomId: roomObjId,
		chatAuth: auth,
		content: content,
	};
	const chat = await ChatMessage.create(newChat);
	return chat;
}

async function getDetailChat(chatroomId) {
	const chatroom = await Chatroom.findOne({ _id: chatroomId })
		.populate('productId', 'name price imgUrls')
		.populate('buyerId', 'nickName profilePic')
		.populate('sellerId', 'nickName profilePic');

	const messages = await ChatMessage.find({ chatRoomId: chatroomId })
		.populate('chatAuth', 'content')
		.sort({ chatCreatedAt: -1 });
	return {
		chatroom,
		messages,
	};
}

async function giveGoodManners(memberId) {
	try {
		const member = await Members.findOneAndUpdate(
			{ _id: memberId },
			{ $inc: { likeCount: 1 } },
			{ new: true, runValidators: true }, // 업데이트된 문서 반환 및 유효성 검사 실행
		);

		// likeCount가 0보다 작은 경우 에러 발생
		if (member.likeCount < 0) {
			throw new Error('0보다 적은 값은 가질수 없습니다.');
		}
		return member;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

async function giveBadManners(memberId) {
	const member = await Members.findOneAndUpdate(
		{ _id: memberId },
		{ $inc: { dislikeCount: 1 } },
		{ new: true }, // 업데이트된 문서 반환
	);
	return member;
}

async function confirmPurchase(productId) {
	const result = await Products.findOneAndUpdate(
		{ _id: productId },
		{ isCompleted: true },
		{ new: true },
	);
	return result;
}

async function quitChatroom(chatroomId) {
	const result = await Chatroom.deleteOne({ _id: chatroomId });
	return result;
}

module.exports = {
	createChatroom,
	getOneChatRoom,
	getChatroomList,
	saveChatMessage,
	getDetailChat,
	giveGoodManners,
	giveBadManners,
	confirmPurchase,
	quitChatroom,
};
