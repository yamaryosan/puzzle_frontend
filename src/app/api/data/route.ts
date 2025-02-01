import prisma from "@/lib/prismaclient";
import { NextResponse, NextRequest } from "next/server";
import { Approach, Puzzle, Category, Hint } from "@prisma/client";

type PuzzleWithCategories = {
    id: number;
    title: string;
    description: string;
    solution: string;
    user_answer: string;
    difficulty: number;
    is_favorite: boolean;
    is_solved: boolean;
    created_at: Date;
    updated_at: Date;
    PuzzleCategory: {
        category: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
        };
    }[];
};

type ImportedCategory = {
    id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
};

type ImportedApproach = {
    id: number;
    title: string;
    content: string;
    created_at: Date;
    updated_at: Date;
};

type ImportedHint = {
    id: number;
    content: string;
    created_at: Date;
    updated_at: Date;
    puzzle_id: number;
};

/**
 * ユーザに紐づく全データ(パズル、カテゴリ、定石、ヒント)を取得
 * @returns Promise
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const user_id = searchParams.get("userId");

        if (!user_id) {
            throw new Error("ユーザIDが指定されていません");
        }

        const puzzles = await prisma.puzzle.findMany({
            where: { user_id },
            include: {
                PuzzleCategory: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        const categories: Category[] = await prisma.category.findMany({
            where: { user_id },
        });

        const approaches: Approach[] = await prisma.approach.findMany({
            where: { user_id },
        });

        const hints: Hint[] = await prisma.hint.findMany({
            where: {
                puzzle: {
                    user_id,
                },
            },
        });

        return NextResponse.json({ puzzles, categories, approaches, hints });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message, stack: error.stack },
                { status: 500 }
            );
        } else {
            return NextResponse.json(
                { error: "Unknown error" },
                { status: 500 }
            );
        }
    }
}

/**
 * 元のパズルとインポートされるパズルをマージ
 * @param originalPuzzles 元のパズル
 * @param importedPuzzles インポートされるパズル
 * @returns マージされたパズル
 */
function mergePuzzles(
    originalPuzzles: PuzzleWithCategories[],
    importedPuzzles: PuzzleWithCategories[]
): PuzzleWithCategories[] {
    return originalPuzzles.map((originalPuzzle: PuzzleWithCategories) => {
        const importedPuzzle = importedPuzzles.find(
            (puzzle: PuzzleWithCategories) => puzzle.id === originalPuzzle.id
        );
        return { ...originalPuzzle, ...importedPuzzle };
    });
}

/**
 * ユーザに紐づく全データ(パズル、カテゴリ、定石、ヒント)をインポート
 * @returns Promise
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { userId, data } = await req.json();
        // データをインポート
        const importedPuzzles = data.puzzles as PuzzleWithCategories[];

        // パズルテーブル用データを作成(PuzzleCategoryは別途保存)
        const savedPuzzles = importedPuzzles.map(
            (puzzle: PuzzleWithCategories) => ({
                title: puzzle.title,
                description: puzzle.description,
                user_answer: puzzle.user_answer,
                solution: puzzle.solution,
                user_id: userId,
                difficulty: puzzle.difficulty,
                is_favorite: puzzle.is_favorite,
                is_solved: puzzle.is_solved,
                createdAt: puzzle.created_at,
                updatedAt: puzzle.updated_at,
            })
        );

        // パズルテーブルに保存
        await prisma.puzzle.createMany({
            data: savedPuzzles,
        });

        const categories = data.categories as ImportedCategory[];
        const updatedCategories = categories.map(
            (category: ImportedCategory) => ({
                name: category.name,
                created_at: category.created_at,
                updated_at: category.updated_at,
                user_id: userId,
            })
        );
        await prisma.category.createMany({
            data: updatedCategories,
        });

        const approaches = data.approaches as ImportedApproach[];
        const updatedApproaches = approaches.map(
            (approach: ImportedApproach) => ({
                title: approach.title,
                content: approach.content,
                created_at: approach.created_at,
                updated_at: approach.updated_at,
                user_id: userId,
            })
        );
        await prisma.approach.createMany({
            data: updatedApproaches,
        });

        const hints = data.hints as ImportedHint[];
        const updatedHints = hints.map((hint: ImportedHint) => ({
            content: hint.content,
            created_at: hint.created_at,
            updated_at: hint.updated_at,
            puzzle_id: hint.puzzle_id,
        }));
        await prisma.hint.createMany({
            data: updatedHints,
        });

        const puzzleCategories = importedPuzzles
            .map((puzzle: PuzzleWithCategories) =>
                puzzle.PuzzleCategory.map(
                    (puzzleCategory: { category: { id: number } }) => ({
                        puzzle_id: puzzle.id,
                        category_id: puzzleCategory.category.id,
                    })
                )
            )
            .flat(); // 配列を平坦化
        await prisma.puzzleCategory.createMany({
            data: puzzleCategories,
        });

        return NextResponse.json({ message: "データのインポートに成功" });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message, stack: error.stack },
                { status: 500 }
            );
        } else {
            return NextResponse.json(
                { error: "Unknown error" },
                { status: 500 }
            );
        }
    }
}
