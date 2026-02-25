import { render, screen } from '@testing-library/react';
import ProductCard from '@/components/ProductCard';

const product = {
  id: 'prod_01',
  name: '테스트 상품',
  description: '테스트 설명',
  thumbnailUrl: '',
  images: [],
  price: { amount: 10000, currency: 'KRW' },
  compareAtPrice: { amount: 12000, currency: 'KRW' },
  category: 'test',
  tags: [],
  stock: 10,
  status: 'ACTIVE',
  createdAt: '',
  updatedAt: '',
};

describe('ProductCard', () => {
  it('상품명, 가격, 설명이 렌더링된다', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText('테스트 상품')).toBeInTheDocument();
    expect(screen.getByText('10,000원')).toBeInTheDocument();
    expect(screen.getByText('테스트 설명')).toBeInTheDocument();
  });
});
