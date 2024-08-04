import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaclient';
import { Category } from '@prisma/client';

/**
 * カテゴリー情報を取得
 * @params req リクエスト
 * @params params パラメータ
 * @returns Promise<NextResponse> レスポンス
 */
export async function GET(req: NextRequest, {params}: {params: {id: string}}): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({error: 'Invalid ID'}, {status: 400});
        }
        const category = await prisma.category.findUnique({
            where: {
                id: id
            }
        });
        if (!category) {
            return NextResponse.json({error: 'Category not found'}, {status: 404});
        }
        return NextResponse.json(category);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({error: error.message, stack: error.stack}, {status: 500});
        } else {
            return NextResponse.json({error: 'Unknown error'}, {status: 500});
        }
    }
}

/**
 * カテゴリー情報を更新
 * @params req リクエスト
 * @params params パラメータ
 * @returns Promise<NextResponse> レスポンス
 */
export async function PUT(req: NextRequest, {params}: {params: {id: string}}): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({error: 'Invalid ID'}, {status: 400});
        }
        const {name} = await req.json();
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({error: 'Invalid name'}, {status: 400});
        }
        const category = await prisma.category.update({
            where: {
                id: id
            },
            data: {
                name: name
            }
        });
        return NextResponse.json(category);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({error: error.message, stack: error.stack}, {status: 500});
        } else {
            return NextResponse.json({error: 'Unknown error'}, {status: 500});
        }
    }
}