const { Posts, Comments } = require('../models');

/**
 * 커뮤니티 게시글 작성 service
 * 작성자 : 유경아
 * 작성 시작일 : 2024-04-05
 * 커뮤니티 글 작성시 동작되는 DB작업을 모아놓은 service입니다.
 */
async function createPost(title, content, nickName, profilePic, schoolName, photos) {
	const newPostData = {
		title: title,
		content: content,
		nickName: nickName,
		profilePic: profilePic,
		schoolName: schoolName,
		photos: photos,
	};
	const createPost = await Posts.create(newPostData);
	return createPost;
}

/**
 * 커뮤니티 전체 게시글 조회 service
 * 작성자 : 유경아
 * 작성 시작일 : 2024-04-05
 * 커뮤니티 글 작성시 동작되는 DB작업을 모아놓은 service입니다.
 */
async function getAllPosts() {
	// 삭제되지 않은 모든 게시글을 조회
	const posts = await Posts.find({ deletedAt: { $exists: false } }).sort({ _id: -1 });

	return posts;
}

/**
 * 커뮤니티 게시글 상세 조회 service
 * 작성자 : 유경아
 * 작성 시작일 : 2024-04-07
 * 커뮤니티 글 상세조회시 동작되는 DB작업을 모아놓은 service입니다.
 */
// async getPostDetails(id) {
// 	return await Posts.findOne({ _id: id, deletedAt: { $exists: false } });
// }
async function getPostDetails(postId) {
	try {
		// 삭제되지 않은 게시글만 조회
		const getPostDetails = await Posts.findOne({ _id: postId, deletedAt: { $exists: false } });
		if (!getPostDetails) {
			throw new Error('게시글을 찾을 수 없습니다.');
		}
		return getPostDetails;
	} catch (err) {
		throw err;
	}
}

/**
 * 커뮤니티 게시글 수정 service
 * 작성자 : 유경아
 * 작성 시작일 : 2024-04-07
 * 커뮤니티 글 수정에 동작되는 DB작업을 모아놓은 service입니다.
 */
async function updatePost(postId, newData) {
	try {
		// 게시글 ID로 게시글을 찾고 업데이트합니다.
		const updatedPost = await Posts.findByIdAndUpdate(
			postId,
			{
				title: newData.title, // 게시글 제목 업데이트
				content: newData.content, // 게시글 본문 업데이트
				photos: newData.photos, // 게시글 사진 업데이트, 선택적
				updatedAt: new Date(Date.now() + 9 * 60 * 60 * 1000),
			},
			{ new: true },
		); // 업데이트된 문서를 반환하도록 합니다.
		if (!updatedPost) {
			return null; // 게시글을 찾지 못한 경우
		}
		return updatedPost; // 업데이트된 게시글 정보를 반환합니다.
	} catch (error) {
		console.error('Error updating the post:', error);
		throw error;
	}
}

/**
 * 커뮤니티 게시글 삭제 service
 * 작성자 : 유경아
 * 작성 시작일 : 2024-04-07
 * 커뮤니티 글 삭제에 동작되는 DB작업을 모아놓은 service입니다.
 */
async function deletePost(postId) {
	try {
		const deletedAt = Date.now() + 9 * 60 * 60 * 1000; // 현재 시간
		const deletedPost = await Posts.findByIdAndUpdate(postId, { deletedAt }, { new: true });
		if (!deletedPost) {
			throw new Error('게시글을 찾을 수 없습니다.');
		}
		return { message: '게시글이 성공적으로 삭제되었습니다.', deletedPost };
	} catch (error) {
		throw error;
	}
}

module.exports = { createPost, getAllPosts, getPostDetails, updatePost, deletePost };
