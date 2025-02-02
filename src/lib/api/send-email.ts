export default async function sendEmail(
    username: string,
    email: string,
    content: string
) {
    if (!username || !email || !content) {
        console.error("未入力の項目があります");
        throw new Error("未入力の項目があります");
    }
    const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, content }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("メールの送信に失敗: ", error);
        throw new Error("メールの送信に失敗しました");
    }
    console.log("メールの送信に成功");
    return response.json();
}
