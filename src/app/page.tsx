import Link from "next/link";

export default function Home() {
  return (
    <div>
      <p>難易度で並び替え</p>
      <p>カテゴリー別で並び替え</p>
      <p>ランダムに並び替え</p>
      <Link href="/puzzles/[id]" as="/puzzles/1">パズル1</Link>
      <Link href="/puzzles/[id]" as="/puzzles/2">パズル2</Link>
      <Link href="/puzzles/[id]" as="/puzzles/3">パズル3</Link>
    </div>
  );
}
