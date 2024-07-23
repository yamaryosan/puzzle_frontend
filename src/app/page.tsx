'use client';

import Link from "next/link";
import { useState } from "react";
import { Puzzle } from "@prisma/client";

type Puzzles = Puzzle[];

/**
 * パズル一覧を取得
 * @returns Promise<Puzzles>
 */
async function getPuzzles() {
  const response = await fetch("/api/puzzles");
  if (!response.ok) {
    const error = await response.json();
    console.error("パズルの取得に失敗: ", error);
  }
  const puzzles = await response.json();
  console.log("パズルの取得に成功: ", puzzles);
  return puzzles as Puzzles;
}

export default function Page() {
  const [puzzles, setPuzzles] = useState<Puzzles | null>(null);
  // パズル一覧を取得
  if (!puzzles) {
    getPuzzles().then((puzzles) => setPuzzles(puzzles));
  }

  return (
    <div>
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
