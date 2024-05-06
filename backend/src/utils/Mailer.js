const nodemailer = require('nodemailer');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

async function sendCustomEmail({ to, subject, templateName, replacements }) {
	try {
		let templatePath = path.join(__dirname, `${templateName}.html`);
		let html = fs.readFileSync(templatePath, 'utf8');

		// replacements 객체에 있는 모든 키-값 쌍을 사용하여 템플릿 내용을 치환
		Object.keys(replacements).forEach(key => {
			html = html.replace(`{{${key}}}`, replacements[key]);
		});

		// replacements 객체에 있는 모든 키-값 쌍을 사용하여 템플릿 내용을 치환
		Object.keys(replacements).forEach(key => {
			const regex = new RegExp(`{{${key}}}`, 'g'); // 정규 표현식 사용
			html = html.replace(regex, replacements[key]);
		});

		const mailOptions = {
			from: process.env.EMAIL_USER,
			to,
			subject,
			html,
		};

		const result = await transporter.sendMail(mailOptions);
		return result;
	} catch (error) {
		console.error('Failed to send email:', error);
		throw error;
	}
}

async function sendPasswordEmail(email, verificationCode) {
	await sendCustomEmail({
		to: email,
		subject: '[이제너해] 인증번호 안내',
		templateName: 'FindPwEmailForm',
		replacements: {
			verificationCode: verificationCode, // 인증번호를 치환할 위치
		},
	});
}

async function sendQnAReplyEmail(email, answer) {
	await sendCustomEmail({
		to: email,
		subject: '[이제너해] QnA 답변 안내',
		templateName: 'QnaAnswerForm',
		replacements: {
			answer: answer, // 답변을 치환할 위치
		},
	});
}

async function sendVerifyEmail(email, verificationCode) {
	await sendCustomEmail({
		to: email,
		subject: '[이제너해] 회원가입 이메일 인증코드입니다.',
		templateName: 'SignUpEmailForm',
		replacements: {
			verificationCode: verificationCode, // 답변을 치환할 위치
		},
	});
}

module.exports = {
	sendCustomEmail,
	sendPasswordEmail,
	sendQnAReplyEmail,
	sendVerifyEmail,
};
