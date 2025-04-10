import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApproachCard from '@/lib/components/ApproachCard';
import { Approach } from '@prisma/client';

// ApproachInfoコンポーネントのモック
jest.mock('@/lib/components/ApproachInfo', () => {
    return function MockApproachInfo({ approach, isActive }: { approach: Approach; isActive: boolean }) {
        return <div data-testid="approach-info">{`Approach: ${approach.id}, Active: ${isActive}`}</div>;
    };
});

// モックデータ
const mockApproach = {
    id: 1,
    title: '定石のタイトル',
    content: '定石の説明',
    user_id: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
} as Approach;

const mockOnClick = jest.fn();

describe('ApproachCard', () => {

    test('定石の情報を表示', async () => {
        render(<ApproachCard approach={mockApproach} isActive={false} onClick={mockOnClick} />);

        const approachInfo = screen.getByTestId('approach-info');
        expect(approachInfo).toHaveTextContent('Approach: 1, Active: false');
    });

    test('クリック時にonClick関数が呼ばれる', async () => {
        const ev = userEvent.setup();
        render(<ApproachCard approach={mockApproach} isActive={false} onClick={mockOnClick} />);

        const card = screen.getByTestId('approach-info').closest('div');
        await ev.click(card as HTMLElement);
        expect(mockOnClick).toHaveBeenCalled();
    });
});