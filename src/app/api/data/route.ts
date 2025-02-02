import prisma from "@/lib/prismaclient";
import { NextResponse, NextRequest } from "next/server";
import {
    Approach,
    Category,
    Hint,
    PuzzleCategory,
    PuzzleApproach,
} from "@prisma/client";

type Puzzle = {
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
    PuzzleApproach: {
        approach: {
            id: number;
            title: string;
            content: string;
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
    user_id: string;
};

/**
 * ユーザに紐づく全データ(パズル、カテゴリ、定石、ヒント)をエクスポート
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

        const puzzleCategories: PuzzleCategory[] =
            await prisma.puzzleCategory.findMany({
                where: {
                    puzzle: {
                        user_id,
                    },
                },
            });

        const puzzleApproaches: PuzzleApproach[] =
            await prisma.puzzleApproach.findMany({
                where: {
                    puzzle: {
                        user_id,
                    },
                },
            });

        return NextResponse.json({
            puzzles,
            categories,
            approaches,
            hints,
            puzzleCategories,
            puzzleApproaches,
        });
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
 * IDマッピングを作成
 * @param oldIds 旧IDリスト
 * @param maxId 全ユーザデータの最大ID
 * @returns マッピングリスト
 */
const createIdMapping = (oldIds: number[], maxId: number): number[] => {
    return Array.from({ length: oldIds.length }, (_, i) => maxId + i + 1);
};

/**
 * 旧IDを新IDに変換
 * @param oldId 旧ID
 * @param oldIds 旧IDリスト
 * @param mapping マッピングリスト
 * @returns 新ID
 */
const convertId = (
    oldId: number,
    oldIds: number[],
    mapping: number[]
): number => {
    // 旧IDリストの中の旧IDのインデックスを取得
    const index = oldIds.indexOf(oldId);
    if (index === -1) {
        throw new Error("旧IDが見つかりません");
    }
    return mapping[index];
};

/**
 * ユーザに紐づく全データをインポート
 * @returns Promise
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { userId, data } = await req.json();
        // データをインポート
        const importedPuzzles = data.puzzles as Puzzle[];
        const importedCategories = data.categories as Category[];
        const importedApproaches = data.approaches as Approach[];
        const importedHints = data.hints as Hint[];
        const importedPuzzleCategories =
            data.puzzleCategories as PuzzleCategory[];
        const importedPuzzleApproaches =
            data.puzzleApproaches as PuzzleApproach[];

        // 全ユーザデータの最大IDを取得
        const maxPuzzleId = await prisma.puzzle.findFirst({
            orderBy: { id: "desc" },
            select: { id: true },
        });
        const maxCategoryId = await prisma.category.findFirst({
            orderBy: { id: "desc" },
            select: { id: true },
        });
        const maxApproachId = await prisma.approach.findFirst({
            orderBy: { id: "desc" },
            select: { id: true },
        });
        if (!maxPuzzleId) {
            throw new Error("全ユーザデータの最大パズルIDが取得できません");
        }
        if (!maxCategoryId) {
            throw new Error("全ユーザデータの最大カテゴリIDが取得できません");
        }
        if (!maxApproachId) {
            throw new Error("全ユーザデータの最大定石IDが取得できません");
        }
        // 旧IDリストを作成
        const oldPuzzleIds = importedPuzzles.map((p) => p.id);
        const oldCategoryIds = importedCategories.map((c) => c.id);
        const oldApproachIds = importedApproaches.map((a) => a.id);

        // マッピングリストを作成
        const puzzleMapping = createIdMapping(oldPuzzleIds, maxPuzzleId.id);
        const categoryMapping = createIdMapping(
            oldCategoryIds,
            maxCategoryId.id
        );
        const approachMapping = createIdMapping(
            oldApproachIds,
            maxApproachId.id
        );

        // パズルテーブル用データを作成
        const savedPuzzles = importedPuzzles.map((puzzle: Puzzle) => ({
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
        }));

        // パズルテーブルに保存
        await prisma.puzzle.createMany({
            data: savedPuzzles,
        });

        // カテゴリテーブル用データを作成
        const savedCategories = importedCategories.map(
            (category: Category) => ({
                name: category.name,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
                user_id: userId,
            })
        );

        // カテゴリテーブルに保存
        await prisma.category.createMany({
            data: savedCategories,
        });

        // 定石テーブル用データを作成
        const savedApproaches = importedApproaches.map(
            (approach: Approach) => ({
                title: approach.title,
                content: approach.content,
                createdAt: approach.createdAt,
                updatedAt: approach.updatedAt,
                user_id: userId,
            })
        );

        // 定石テーブルに保存
        await prisma.approach.createMany({
            data: savedApproaches,
        });

        // ヒントテーブル用データを作成
        const savedHints = importedHints.map((hint: Hint) => ({
            content: hint.content,
            createdAt: hint.createdAt,
            updatedAt: hint.updatedAt,
            puzzle_id: convertId(hint.puzzle_id, oldPuzzleIds, puzzleMapping),
            user_id: userId,
        }));

        // ヒントテーブルに保存
        await prisma.hint.createMany({
            data: savedHints,
        });

        // パズル・カテゴリーテーブル用データを作成
        const savedPuzzleCategories = importedPuzzleCategories.map(
            (puzzleCategory: PuzzleCategory) => ({
                puzzle_id: convertId(
                    puzzleCategory.puzzle_id,
                    oldPuzzleIds,
                    puzzleMapping
                ),
                category_id: convertId(
                    puzzleCategory.category_id,
                    oldCategoryIds,
                    categoryMapping
                ),
            })
        );

        // パズル・カテゴリーテーブルに保存
        await prisma.puzzleCategory.createMany({
            data: savedPuzzleCategories,
        });

        // パズル・定石テーブル用データを作成
        const savedPuzzleApproaches = importedPuzzleApproaches.map(
            (puzzleApproach: PuzzleApproach) => ({
                puzzle_id: convertId(
                    puzzleApproach.puzzle_id,
                    oldPuzzleIds,
                    puzzleMapping
                ),
                approach_id: convertId(
                    puzzleApproach.approach_id,
                    oldApproachIds,
                    approachMapping
                ),
            })
        );

        // パズル・定石テーブルに保存
        await prisma.puzzleApproach.createMany({
            data: savedPuzzleApproaches,
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

/**
 * ユーザに紐づく全データを削除
 * @returns Promise
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
        return NextResponse.json(
            { error: "ユーザIDが指定されていません" },
            { status: 400 }
        );
    }
    // ユーザに紐づくパズルIDを取得
    const puzzleIds = await prisma.puzzle.findMany({
        where: { user_id: userId },
        select: { id: true }, // IDのみを取得
    });
    // パズルIDをもとにパズル・定石中間テーブルのレコードを削除
    await prisma.puzzleApproach.deleteMany({
        where: { puzzle_id: { in: puzzleIds.map((p) => p.id) } }, // IDの配列を使用
    });
    // パズルIDをもとにパズル・カテゴリーテーブルのレコードを削除
    await prisma.puzzleCategory.deleteMany({
        where: { puzzle_id: { in: puzzleIds.map((p) => p.id) } }, // IDの配列を使用
    });
    await prisma.category.deleteMany({ where: { user_id: userId } });
    await prisma.approach.deleteMany({ where: { user_id: userId } });
    await prisma.hint.deleteMany({ where: { user_id: userId } });
    await prisma.puzzle.deleteMany({ where: { user_id: userId } });
    return NextResponse.json({ message: "データの削除に成功" });
}
