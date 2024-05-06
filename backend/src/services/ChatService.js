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
	const createChatroom = await Chatroom.create(newRoomData);
	return createChatroom;
}

async function getOneChatRoom(chatroomId) {
	const result = await Chatroom.findOne({ _id: chatroomId });
	return result;
}

async function getChatroomList(memberId) {
	const member = await Members.findById(memberId);

	const products = await Products.find({
		sellerId: member.id,
		isCompleted: false,
	});

	const productIds = products.map(product => product._id);
	const chatList = await Chatroom.find({
		productId: { $in: productIds },
	});
	return chatList;
}

const getChatroomListWithFilter = async userId => {
	const chatList = await Chatroom.find({
		$and: [{ $or: [{ buyerId: userId }, { sellerId: userId }] }, { isActivated: true }],
	});

	return chatList;
};

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
	const chatroom = await Chatroom.findOne({ _id: chatroomId });
	const product = await Products.findOne({ _id: chatroom.productId })
		.select('name price imgUrls sellerId')
		.exec();

	const sellerIdValue = product.sellerId;

	const sellerInfo = await Members.findOne({ id: sellerIdValue })
		.select('id nickName profilePic')
		.exec();

	const buyerInfo = await Members.findById(chatroom.buyerId)
		.select('id nickName profilePic')
		.exec();

	const messages = await ChatMessage.find({ chatRoomId: chatroomId })
		.populate({
			path: 'chatAuth',
			select: 'id',
		})
		.sort({ chatCreatedAt: 1 });

	const chatroomDetails = {
		product,
		sellerInfo,
		buyerInfo,
		messages,
	};

	return chatroomDetails;
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

	if (result) {
		await Chatroom.updateMany({ productId: productId }, { $set: { isActivated: false } });
	}
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
	getChatroomListWithFilter,
	saveChatMessage,
	getDetailChat,
	giveGoodManners,
	giveBadManners,
	confirmPurchase,
	quitChatroom,
};
