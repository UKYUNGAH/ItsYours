import React, { useState, useEffect } from 'react';
import { fetchMyPageData, updateMyPageData } from '../../../apis/service/ProfileEdit';
import ProfileImageUploader from '../../Users/ProfileImageEdit';
import { Form, Input, Button, ErrorMessage } from '../../Users/UsersStyles';
import {
	validateUserId,
	validatePassword,
	validateConfirmPassword,
	validateName,
	validateEmail,
	validateNickname,
	validateUniversity,
} from '../../Users/ValidationService';
import EmailVerificationForm from '../../Users/EmailVerificationForm';
import UniversitySearchForm from '../../Users/University/UniversitySearchForm';
import UniversityModal from '../../Users/University/UniversityModal';

function ProfileEditForm({ userInfo }) {
	const [profileImage, setProfileImage] = useState(null);
	const [userId, setUserId] = useState(userInfo?.userId || '');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [name, setName] = useState(userInfo?.name || '');
	const [email, setEmail] = useState(userInfo?.email || '');
	const [university, setUniversity] = useState(userInfo?.university || '');
	const [nickname, setNickname] = useState(userInfo?.nickname || '');
	const [errors, setErrors] = useState({});
	const [emailVerificationCode, setEmailVerificationCode] = useState('');
	const [isModalOpen, setModalOpen] = useState(false);

	useEffect(() => {
		fetchProfileData();
	}, []);

	const fetchProfileData = async () => {
		try {
			const data = await fetchMyPageData();
			console.log('Received data:', data); // 서버로부터 받은 데이터를 확인합니다.
			setUserId(data.id);
			setName(data.realName);
			setEmail(data.email);
			setUniversity(data.schoolName);
			setNickname(data.nickName);
			setProfileImage(data.profilePic); // 프로필 이미지 데이터를 설정합니다.
		} catch (error) {
			console.error('프로필 정보 로딩 실패:', error);
		}
	};

	const handleValidation = () => {
		const newErrors = {
			userId: validateUserId(userId),
			password: validatePassword(password),
			confirmPassword: validateConfirmPassword(password, confirmPassword),
			name: validateName(name),
			email: validateEmail(email),
			university: validateUniversity(university),
			nickname: validateNickname(nickname),
		};
		setErrors(newErrors);
		return Object.values(newErrors).every(error => error === '');
	};

	const handleSubmit = async event => {
		event.preventDefault();
		if (!handleValidation()) {
			console.error('유효성 검사 실패:', errors);
			return;
		}
		const formData = new FormData();
		formData.append('userId', userId);
		if (password) {
			formData.append('password', password);
		}
		formData.append('name', name);
		formData.append('email', email);
		formData.append('university', university);
		formData.append('nickname', nickname);
		if (profileImage) {
			formData.append('profileImage', profileImage);
		}

		try {
			const response = await updateMyPageData(formData);
			console.log('프로필 업데이트 완료:', response);
			await fetchProfileData(); // 업데이트 후 프로필 데이터를 비동기적으로 다시 불러옵니다.
		} catch (error) {
			console.error('프로필 업데이트 오류:', error);
		}
	};

	const handleOpenModal = () => setModalOpen(true);
	const handleCloseModal = () => setModalOpen(false);
	const handleSelectUniversity = selectedUniversity => {
		setUniversity(selectedUniversity);
		setErrors(prevErrors => ({ ...prevErrors, university: '' }));
		handleCloseModal();
	};

	return (
		<>
			<UniversityModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSelectUniversity={handleSelectUniversity}
			/>
			<ProfileImageUploader onImageSelected={setProfileImage} initialPreview={profileImage} />
			<Form onSubmit={handleSubmit}>
				<Input type="text" value={userId} disabled />
				<Input
					type="password"
					placeholder="*비밀번호를 입력해주세요"
					value={password}
					onChange={e => setPassword(e.target.value)}
				/>
				{errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
				<Input
					type="password"
					placeholder="*비밀번호를 다시 입력해주세요"
					value={confirmPassword}
					onChange={e => setConfirmPassword(e.target.value)}
				/>
				{errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
				<Input
					type="text"
					placeholder="*이름을 입력해주세요"
					value={name}
					onChange={e => setName(e.target.value)}
				/>
				{errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
				<Input
					type="text"
					placeholder="*닉네임을 입력해주세요"
					value={nickname}
					onChange={e => setNickname(e.target.value)}
				/>
				{errors.nickname && <ErrorMessage>{errors.nickname}</ErrorMessage>}
				<EmailVerificationForm
					email={email}
					setEmail={setEmail}
					emailVerificationCode={emailVerificationCode}
					setEmailVerificationCode={setEmailVerificationCode}
					emailError={errors.email}
				/>
				<UniversitySearchForm
					university={university}
					setUniversity={setUniversity}
					universityError={errors.university}
					onSearchUniversity={handleOpenModal}
				/>
				<Button type="submit">수정하기</Button>
			</Form>
		</>
	);
}

export default ProfileEditForm;
