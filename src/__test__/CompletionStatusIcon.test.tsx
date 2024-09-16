import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import CompletionStatusIcon from '@/lib/components/CompletionStatusIcon';

describe('CompletionStatusIcon', () => {

    test('解決済みの場合、解決済みアイコンとテキストが表示される', async () => {
        render(<CompletionStatusIcon isSolved={true} />);
        const spanElement = screen.getByText('解決済み');
        expect(spanElement).toBeInTheDocument();
    });

    test('未解決の場合、未解決アイコンとテキストが表示される', async () => {
        render(<CompletionStatusIcon isSolved={false} />);

        const spanElement = screen.getByText('未解決');
        expect(spanElement).toBeInTheDocument();
    });
});