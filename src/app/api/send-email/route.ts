import { NextResponse, NextRequest } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    const { username, email, content } = await req.json();

    // トランスポーターの設定
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // TLS を使用
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    try {
        // メールの送信
        await transporter.sendMail({
            from: '"Your Name" <your-email@example.com>',
            to: process.env.EMAIL_USER,
            subject: "お問い合わせがありました",
            text: `名前: ${username}\nメールアドレス: ${email}\n内容:\n${content}`,
            html: `<p><strong>名前:</strong> ${username}</p>
            <p><strong>メールアドレス:</strong> ${email}</p>
            <p><strong>内容:</strong></p>
            <p>${content}</p>`,
        });
        return NextResponse.json({ message: "メールを送信しました" });
    } catch (error) {
        console.error("メール送信エラー:", error);
        return NextResponse.json(
            { error: "メールの送信に失敗しました" },
            { status: 500 }
        );
    }
}
