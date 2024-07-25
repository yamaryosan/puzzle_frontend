'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPuzzles } from '@/lib/api/puzzleapi';
import { Puzzle } from '@prisma/client';

type Puzzles = Puzzle[];

export default function Home() {
    const [puzzles, setPuzzles] = useState<Puzzles | null>(null);
    // パズル一覧を取得
    useEffect(() => {
      async function fetchPuzzles() {
        try {
          const puzzles = await getPuzzles();
          setPuzzles(puzzles);
        } catch (error) {
          console.error("パズルの取得に失敗: ", error);
        }
      }
      fetchPuzzles();
    }, []);
  
    if (!puzzles) {
      return <div>loading...</div>;
    }
    
    return (
        <div>
            <Link href="/puzzles/create">新しいパズルを作成</Link>
            <p>難易度で並び替え</p>
            <p>カテゴリー別で並び替え</p>
            <p>ランダムに並び替え</p>
            <p>パズル一覧</p>
            <ul>
                {puzzles?.map((puzzle) => (
                    <li key={puzzle.id}>
                        <Link href={`/puzzles/${puzzle.id}`}>
                        {puzzle.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
      );
}