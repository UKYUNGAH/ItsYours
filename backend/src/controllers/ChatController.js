const chatService = require('../services/ChatService');
const ObjectId = require('mongodb').ObjectId;
const {
	BadRequestError,
	ForbiddenError,
	UnauthorizedError,
	NotFoundError,
} = require('../config/CustomError');
const { Products, Chatroom, Members } = require('../models/index');
const { copyFileSync } = require('fs');

/*
 * 채팅방 생성 controller
 * 작성자 : 김고은
 * 작성 시작일 : 2024-04-17
 * 기능 : 채팅방 생성시 필요한 동작들을 모아놓은 컨트롤러입니다.
 */
const createChatroom = async (req, res, next) => {
	try {
		const buyerId = req.user._id;
		const { productId, sellerId } = req.params;

		if (!buyerId) {
			throw new BadRequestError('로그인 후 이용해주세요.');
		}

		// 구매자와 상품 ID의 조합으로 unique index 생성
		const existingChatroom = await Chatroom.findOne({ buyerId, productId });
		if (existingChatroom) {
			throw new BadRequestError('이미 해당 상품에 대한 채팅방이 존재합니다.');
		}

		const newChatroom = await chatService.createChatroom(buyerId, productId, sellerId);

		res.status(200).json(newChatroom);
	} catch (err) {
		next(err);
	}
};

//채팅방 목록 불러오기
const getChatroomList = async (req, res, next) => {
	try {
		const memberId = req.user._id;

		if (!memberId) {
			throw new BadRequestError('로그인 후 이용해주세요.');
		}

		// Members 테이블에서 사용자의 실제 ID 찾기
		const member = await Members.findById(memberId);
		if (!member) {
			throw new NotFoundError('회원 정보를 찾을 수 없습니다.');
		}

		// 사용자의 실제 ID를 사용하여 채팅방 목록 불러오기
		const chatList = await chatService.getChatroomListWithFilter(member._id);
		if (!chatList || chatList.length === 0) {
			throw new NotFoundError('채팅 목록이 없습니다.');
		}

		res.status(200).json(chatList);
	} catch (err) {
		next(err);
	}
};
//채팅방 메세지 저장
const saveChatMessage = async (req, res, next) => {
	try {
		const { chatroomId } = req.params;
		const roomObjId = new ObjectId(chatroomId);

		const auth = req.user._id;

		const { content } = req.body;

		if (!auth) {
			throw new BadRequestError('로그인 후 이용해주세요.');
		}

		const chat = await chatService.saveChatMessage(roomObjId, { auth, content });
		res.status(200).json({ data: chat, message: '채팅 메세지 추가' });
	} catch (err) {
		next(err);
	}
};

//채팅방 내용보기
const getDetailChat = async (req, res, next) => {
	try {
		const memberId = req.user._id;
		const { chatroomId } = req.params;
		const chatObjId = new ObjectId(chatroomId);

		const chatroom = await chatService.getOneChatRoom(chatObjId);

		if (!chatroom) {
			throw new NotFoundError('채팅내역이 없습니다.');
		}

		if (!memberId) {
			throw new BadRequestError('로그인 후 이용해주세요.');
		}

		// 채팅방에 참여한 사용자인지 확인
		if (chatroom.buyerId.toString() !== memberId && chatroom.sellerId.toString() !== memberId) {
			throw new UnauthorizedError('권한이 없습니다.');
		}

		const chatData = await chatService.getDetailChat(chatroomId);
		res.status(200).json({ data: chatData, message: '채팅방 정보 조회 성공' });
	} catch (err) {
		next(err);
	}
};

//칭찬하기
const giveGoodManners = async (req, res, next) => {
	try {
		const memberId = req.user._id;

		const { Id } = req.body;
		const sellerObjectId = new ObjectId(Id);

		if (!memberId) {
			throw new BadRequestError('로그인 후 이용해주세요.');
		}
		// 멤버의 좋아요 수 업데이트
		await chatService.giveGoodManners(sellerObjectId);

		res.status(200).json({ message: '좋아요가 반영되었습니다.' });
	} catch (err) {
		next(err);
	}
};
//비판하기
const giveBadManners = async (req, res, next) => {
	try {
		const memberId = req.user._id;

		const { sellerId } = req.body;
		const sellerObjectId = new ObjectId(sellerId);

		if (!memberId) {
			throw new BadRequestError('로그인 후 이용해주세요.');
		}
		// 멤버의 좋아요 수 업데이트
		await chatService.giveBadManners(sellerObjectId);

		res.status(200).json({ message: '비판하기를 반영했습니다.' });
	} catch (err) {
		next(err);
	}
};
//구매확정
const confirmPurchase = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const { productId } = req.body;
		const productObjectId = new ObjectId(productId);

		if (!userId) {
			throw new BadRequestError('로그인 후 이용해주세요.');
		}
		const prodInfo = await Products.findOne({ _id: productObjectId });

		if (prodInfo.isCompleted) {
			throw new BadRequestError('이미 구매확정된 상품입니다.');
		}

		await chatService.confirmPurchase(productObjectId);

		res.status(200).json({ message: '구매확정이 완료되었습니다.' });
	} catch (err) {
		next(err);
	}
};
//채팅방 나가기(삭제하기)
const quitChatroom = async (req, res, next) => {
	try {
		const { productId, buyerId, sellerId } = req.params;
		const userId = req.user._id; // 현재 로그인한 사용자의 ID

		if (!userId) {
			throw new BadRequestError('로그인 후 이용해주세요.');
		}
		// 채팅방 삭제 권한 확인
		const chatroom = await Chatroom.findOne({ productId, $or: [{ buyerId }, { sellerId }] });
		if (!chatroom) {
			throw new NotFoundError('해당 채팅방이 존재하지 않습니다.');
		}
		if (
			chatroom.buyerId.toString() !== userId.toString() &&
			chatroom.sellerId.toString() !== userId.toString()
		) {
			throw new ForbiddenError('채팅방 삭제 권한이 없습니다.');
		}
		await chatService.quitChatroom(chatroom._id);
		res.status(200).json({ message: '채팅방이 삭제되었습니다.' });
	} catch (err) {
		next(err);
	}
};

module.exports = {
	createChatroom,
	getChatroomList,
	saveChatMessage,
	getDetailChat,
	giveGoodManners,
	giveBadManners,
	confirmPurchase,
	quitChatroom,
};
