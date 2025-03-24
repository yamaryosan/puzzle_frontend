import prisma from "@/lib/prismaclient";
import { NextResponse, NextRequest } from "next/server";
import {
    approaches,
    categories,
    hints,
    puzzle_categories,
    puzzle_approaches,
} from "@prisma/client";

type Puzzle = {
    id: number;
    title: string;
    source: string;
    description: string;
    solution: string;
    user_answer: string;
    difficulty: number;
    is_favorite: boolean;
    is_solved: boolean;
    created_at: Date;
    updated_at: Date;
    puzzle_categories: {
        category: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
        };
    }[];
    puzzle_approaches: {
        approach: {
            id: number;
            title: string;
            content: string;
            created_at: Date;
            updated_at: Date;
        };
    }[];
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

        const puzzles = await prisma.puzzles.findMany({
            where: { user_id },
            include: {
                puzzle_categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        const categories: categories[] = await prisma.categories.findMany({
            where: { user_id },
        });

        const approaches: approaches[] = await prisma.approaches.findMany({
            where: { user_id },
        });

        const hints: hints[] = await prisma.hints.findMany({
            where: {
                puzzle: {
                    user_id,
                },
            },
        });

        const puzzleCategories: puzzle_categories[] =
            await prisma.puzzle_categories.findMany({
                where: {
                    puzzle: {
                        user_id,
                    },
                },
            });

        const puzzleApproaches: puzzle_approaches[] =
            await prisma.puzzle_approaches.findMany({
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
        const importedCategories = data.categories as categories[];
        const importedApproaches = data.approaches as approaches[];
        const importedHints = data.hints as hints[];
        const importedPuzzleCategories =
            data.puzzleCategories as puzzle_categories[];
        const importedPuzzleApproaches =
            data.puzzleApproaches as puzzle_approaches[];

        // 全ユーザデータの最大IDを取得
        const maxPuzzleId = Number(
            (
                await prisma.$queryRaw<{ nextval: bigint }[]>`
            SELECT nextval(pg_get_serial_sequence('puzzles', 'id'))
        `
            )[0].nextval
        );
        // カテゴリの最大IDを取得(Postgresから[ { nextval: 19n } ]という形で返ってくる)
        const maxCategoryId = Number(
            (
                await prisma.$queryRaw<{ nextval: bigint }[]>`
            SELECT nextval(pg_get_serial_sequence('categories', 'id'))
        `
            )[0].nextval
        );
        const maxApproachId = Number(
            (
                await prisma.$queryRaw<{ nextval: bigint }[]>`
            SELECT nextval(pg_get_serial_sequence('approaches', 'id'))
        `
            )[0].nextval
        );
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
        const puzzleMapping = createIdMapping(oldPuzzleIds, maxPuzzleId);
        const categoryMapping = createIdMapping(oldCategoryIds, maxCategoryId);
        const approachMapping = createIdMapping(oldApproachIds, maxApproachId);

        // マッピングリストにNaNがある場合はエラーを返す
        if (
            puzzleMapping.includes(NaN) ||
            categoryMapping.includes(NaN) ||
            approachMapping.includes(NaN)
        ) {
            throw new Error("マッピングリストにNaNが含まれています");
        }
        // パズルテーブル用データを作成
        const savedPuzzles = importedPuzzles.map((puzzle: Puzzle) => ({
            title: puzzle.title,
            source: puzzle.source,
            description: puzzle.description,
            user_answer: puzzle.user_answer,
            solution: puzzle.solution,
            user_id: userId,
            difficulty: puzzle.difficulty,
            is_favorite: puzzle.is_favorite,
            is_solved: puzzle.is_solved,
            created_at: puzzle.created_at,
            updated_at: puzzle.updated_at,
        }));

        // パズルテーブルに保存
        await prisma.puzzles.createMany({
            data: savedPuzzles,
        });

        // カテゴリテーブル用データを作成
        const savedCategories = importedCategories.map(
            (category: categories) => ({
                name: category.name,
                created_at: category.created_at,
                updated_at: category.updated_at,
                user_id: userId,
            })
        );

        // カテゴリテーブルに保存
        await prisma.categories.createMany({
            data: savedCategories,
        });

        // 定石テーブル用データを作成
        const savedApproaches = importedApproaches.map(
            (approach: approaches) => ({
                title: approach.title,
                content: approach.content,
                created_at: approach.created_at,
                updated_at: approach.updated_at,
                user_id: userId,
            })
        );

        // 定石テーブルに保存
        await prisma.approaches.createMany({
            data: savedApproaches,
        });

        // ヒントテーブル用データを作成
        const savedHints = importedHints.map((hint: hints) => ({
            content: hint.content,
            created_at: hint.created_at,
            updated_at: hint.updated_at,
            puzzle_id: convertId(hint.puzzle_id, oldPuzzleIds, puzzleMapping),
            user_id: userId,
        }));

        // ヒントテーブルに保存
        await prisma.hints.createMany({
            data: savedHints,
        });

        // パズル・カテゴリーテーブル用データを作成
        const savedPuzzleCategories = importedPuzzleCategories.map(
            (puzzleCategory: puzzle_categories) => ({
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
        await prisma.puzzle_categories.createMany({
            data: savedPuzzleCategories,
        });

        // パズル・定石テーブル用データを作成
        const savedPuzzleApproaches = importedPuzzleApproaches.map(
            (puzzleApproach: puzzle_approaches) => ({
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
        await prisma.puzzle_approaches.createMany({
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
    const puzzleIds = await prisma.puzzles.findMany({
        where: { user_id: userId },
        select: { id: true }, // IDのみを取得
    });
    // パズルIDをもとにパズル・定石中間テーブルのレコードを削除
    await prisma.puzzle_approaches.deleteMany({
        where: { puzzle_id: { in: puzzleIds.map((p) => p.id) } }, // IDの配列を使用
    });
    // パズルIDをもとにパズル・カテゴリーテーブルのレコードを削除
    await prisma.puzzle_categories.deleteMany({
        where: { puzzle_id: { in: puzzleIds.map((p) => p.id) } }, // IDの配列を使用
    });
    await prisma.categories.deleteMany({ where: { user_id: userId } });
    await prisma.approaches.deleteMany({ where: { user_id: userId } });
    await prisma.hints.deleteMany({ where: { user_id: userId } });
    await prisma.puzzles.deleteMany({ where: { user_id: userId } });
    return NextResponse.json({ message: "データの削除に成功" });
}
