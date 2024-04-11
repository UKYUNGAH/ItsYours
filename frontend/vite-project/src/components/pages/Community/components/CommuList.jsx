import {
	Line,
	Box,
	ListOfOne,
	LeftBottom,
	ListTitle,
	ListSub,
	ListLeft,
	MainTitle,
	List,
	ButtonBox,
	Img,
	ListRight,
	Comment,
} from '../CommunityList/CommunityStyle';
import { useNavigate } from 'react-router-dom';
import { Button } from '../CommunityList/CommunityStyle';
import { FaComments } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { GetCommunnityList } from '../../../../apis/service/community.api';
import detailDate from '../../../../utils/writeTime';

function CommuList() {
	const navigate = useNavigate();
	const [communityLists, setCommunityLists] = useState([]);

	useEffect(() => {
		async function GetData() {
			const datas = await GetCommunnityList();
			setCommunityLists(datas);
		}
		GetData();
	}, []);

	return (
		<Box>
			<ButtonBox
				onClick={() => {
					navigate('/community/write');
				}}
			>
				<Button>새글 등록</Button>
			</ButtonBox>
			<Line>
				<hr />
			</Line>
			<List>
				{communityLists.map((commu, i) => (
					<ListOne key={`list-item-${i}`} commu={commu} />
				))}
			</List>
		</Box>
	);
}

function ListOne({ commu }) {
	const navigate = useNavigate();
	const time = detailDate(new Date(commu.createdAt));
	return (
		<ListOfOne
			onClick={() => {
				console.log(1);
				navigate(`/community/${commu._id}`);
			}}
		>
			<ListLeft>
				<ListTitle>{commu.title}</ListTitle>
				<ListSub>{commu.content}</ListSub>
				<LeftBottom>
					<ListSub>{commu.univName}</ListSub>
					<ListSub>{time}</ListSub>
				</LeftBottom>
			</ListLeft>
			<ListRight>
				<Comment>
					<FaComments />
					<ListSub>{commu.commentCounts}</ListSub>
				</Comment>
				<Img src={commu.profilePic}></Img>
			</ListRight>
		</ListOfOne>
	);
}

export default CommuList;
