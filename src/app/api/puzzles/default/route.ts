import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prismaclient";

const defaultPuzzles = [
    {
        title: "謎解き1",
        description: `<p>答えは？</p><p><br></p><p><img src="/images/sample-puzzle-1.png"></p>`,
        user_answer: "",
        solution: "リスク",
        difficulty: 2,
        is_favorite: true,
        is_solved: true
    },
    {
        title: "謎解き2",
        description: `<p>答えは？</p><p><br></p><p><img src="/images/sample-puzzle-2.png"></p>`,
        user_answer: "",
        solution: "クイズ",
        difficulty: 1,
        is_favorite: false,
        is_solved: false
    },
    {
        title: "元に戻ってきた探検家",
        description: `<p>探検家が小屋を出て、北に10km歩き、東に10km歩き、それからさらに南に10km歩くと、なぜか自分が出発した小屋に戻ってきた。もちろん小屋の場所は変わっていない。こんなことが起こり得るだろうか？</p>`,
        user_answer: "",
        solution: `<p>あり得る。この小屋はちょうど地球の南極点にあったのだ。我々はふだん、地球が球体であることを認識せず、メルカトル図法の世界で生きているので、こうした問題を不思議に思うことがある。</p>`,
        difficulty: 3,
        is_favorite: false,
        is_solved: false
    },
];

/**
 * ユーザ登録完了後にデフォルトでパズルを登録する
 * @param req リクエスト
 */
export async function POST(req: NextRequest): Promise<NextResponse>{
    const { userId } = await req.json();
    if (!userId) {
        throw new Error("ユーザIDが指定されていません");
    }
    try {
        // パズルの登録
        const puzzles = await prisma.puzzle.createMany({
            data: defaultPuzzles.map((puzzle) => {
                return {
                    user_id: userId,
                    title: puzzle.title,
                    description: puzzle.description,
                    user_answer: puzzle.user_answer,
                    solution: puzzle.solution,
                    difficulty: puzzle.difficulty,
                    is_favorite: puzzle.is_favorite,
                    is_solved: puzzle.is_solved,
                };
            }),
        });
        // 登録したパズルのIDを取得
        const puzzleIds = await prisma.puzzle.findMany({
            where: {
                user_id: userId,
            },
            select: {
                id: true,
            },
        });
        // ヒントの登録
        await prisma.hint.createMany({
            data: [
                { puzzle_id: puzzleIds[0].id, content: "それぞれの熟語の読みを考えてみよう" },
                { puzzle_id: puzzleIds[0].id, content: "それぞれの熟語の文字数を考えてみよう" },
                { puzzle_id: puzzleIds[1].id, content: "正方形しかないが、これに似たものをどこかで見たことがあるはずだ" },
                { puzzle_id: puzzleIds[1].id, content: "身の回りにある、7つで1セットのものといえば…？" },
                { puzzle_id: puzzleIds[1].id, content: "カレンダーを見てみよう" },
                { puzzle_id: puzzleIds[2].id, content: "地球は球体である。地球儀を見ながら考えよう" },
                { puzzle_id: puzzleIds[2].id, content: "小屋の場所が特殊である。ただし日本には存在しない。" },
                { puzzle_id: puzzleIds[2].id, content: "小屋は南の、とても寒い場所にある。" },
            ],
        });
        // カテゴリーの登録
        await prisma.category.createMany({
            data: [
                { user_id: userId, name: "謎解き" },
                { user_id: userId, name: "頭の体操" },
            ],
        });
        // 登録したカテゴリーのIDを取得
        const categoryIds = await prisma.category.findMany({
            where: {
                user_id: userId,
            },
            select: {
                id: true,
            },
        });
        // カテゴリーとパズルの紐付け
        await prisma.puzzleCategory.createMany({
            data: [
                { puzzle_id: puzzleIds[0].id, category_id: categoryIds[0].id },
                { puzzle_id: puzzleIds[1].id, category_id: categoryIds[0].id },
                { puzzle_id: puzzleIds[2].id, category_id: categoryIds[1].id },
            ],
        });

        // 定石の登録
        await prisma.approach.createMany({
            data: [
                { user_id: userId, title: "文字のない謎解き問題の考え方", content: `<p>問題に文字がない場合、いくつのセットで構成されているかを考えよう。以下は典型例である。</p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>4つ:東西南北, 春夏秋冬, トランプのスート(ハート, クローバー, ダイヤ, スペードなど)</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>5つ: 指, 五感</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>7つ: カレンダー, 虹の色, 音階</li></ol>`},
                { user_id: userId, title: "地図上の移動に関する問題のコツ", content: `<p>地図上の移動に関する頭の体操の問題は、以下の点に着目するとよい。</p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>ある特別な場所でのみ通用する条件である(南極点,北極点,赤道)</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>特殊な天体現象を利用する(日食, 月食等)</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>特殊な形の天体である(ドーナツ型惑星)</li></ol><p>総じて、我々が普段使うデカルト座標的な地図から抜け出して柔軟に考える必要がある。</p>` }
            ],
        });

        // パズルと定石の紐付け
        const approachIds = await prisma.approach.findMany({
            where: {
                user_id: userId,
            },
            select: {
                id: true,
            },
        });
        await prisma.puzzleApproach.createMany({
            data: [
                { puzzle_id: puzzleIds[1].id, approach_id: approachIds[0].id },
                { puzzle_id: puzzleIds[2].id, approach_id: approachIds[1].id },
            ],
        });

        return NextResponse.json(puzzles);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}