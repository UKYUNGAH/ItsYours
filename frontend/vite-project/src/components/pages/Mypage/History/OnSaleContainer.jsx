import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SalesHistoryWrap, ForSalesList, OnSaleVoid } from './OnSaleContainerStyle';
import OnSaleCard from '../../../MypageHistoryCard/OnSaleCard';
import { fetchOnSaleItems, deleteSaleItem } from '../../../../apis/service/OnSaleApi';

const OnSaleContainer = () => {
	const [saleItems, setSaleItems] = useState([]);
	const { id } = useParams();

	useEffect(() => {
		if (id) {
			fetchOnSaleItems(id)
				.then(data => {
					// isCompleted가 false이고, deletedAt이 null인 항목만 필터링 하세요
					const validItems = data.filter(
						item => item.isCompleted === false && item.deletedAt == null,
					);
					setSaleItems(validItems);
				})
				.catch(error => {
					console.error('판매 완료 목록을 가져오는데 실패했습니다:', error);
					alert('서버 오류가 발생했습니다. 나중에 다시 시도해주세요.');
				});
		}
	}, [id]);

	const handleDelete = async prodId => {
		try {
			const response = await deleteSaleItem(id, prodId);
			if (!response) {
				throw new Error('서버의 응답이 없습니다.');
			}
			if (response.status === 200) {
				const newItems = saleItems.filter(item => item._id !== prodId);
				setSaleItems([...newItems]);
			} else {
				console.error('서버가 응답한 Status:', response.status);
				throw new Error('서버에서 아이템 삭제가 실패했습니다..');
			}
		} catch (error) {
			console.error('아이템 삭제 실패:', error);
			alert('아이템을 삭제하는 도중 문제가 발생했습니다. 나중에 다시 시도해 주세요.');
		}
	};

	return (
		<SalesHistoryWrap>
			{saleItems.length > 0 ? (
				saleItems.map(onsale => (
					<ForSalesList key={onsale._id}>
						<OnSaleCard
							imgUrls={onsale.imgUrls[0]}
							price={onsale.price}
							name={onsale.name}
							createdAt={onsale.createdAt}
							wishescount={onsale.wishesCount}
							onDelete={() => handleDelete(onsale._id)}
							id={onsale._id}
						/>
					</ForSalesList>
				))
			) : (
				<OnSaleVoid>판매중인 상품이 없습니다.</OnSaleVoid>
			)}
		</SalesHistoryWrap>
	);
};

export default OnSaleContainer;
