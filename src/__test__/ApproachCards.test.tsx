import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ApproachCards from '@/lib/components/ApproachCards';
import { Approach } from '@prisma/client';

jest.mock('@/lib/components/ApproachCard', () => {
    return function MockApproachCard({ approach, isActive }: { approach: Approach; isActive: boolean }) {
        return <div data-testid="approach-info">{`Approach: ${approach.id}, Active: ${isActive}`}</div>;
    };
});

// モックデータ
const mockApproaches = [
    {
        id: 1,
        title: '定石1',
        content: '定石1の説明',
        user_id: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 2,
        title: '定石2',
        content: '定石2の説明',
        user_id: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
] as Approach[];

const mockOnClick = jest.fn();

describe('ApproachCards', () => {

    test('定石の情報を表示', async () => {
        render(<ApproachCards approaches={mockApproaches} activeCardId={1} handleCardClick={mockOnClick} />);
        expect(screen.getByText('Approach: 1, Active: true')).toBeInTheDocument();
        expect(screen.getByText('Approach: 2, Active: false')).toBeInTheDocument();
    });
});