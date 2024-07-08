import { AuthCredential, User } from 'firebase/auth';
import { reauthenticateWithCredential } from 'firebase/auth';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { EmailAuthProvider } from 'firebase/auth';
import { useState, useCallback } from 'react';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import { useEffect } from 'react';

const isEmulator = process.env.NODE_ENV === 'development';

/**
 * メールアドレス認証の場合の再認証
 * @param user ユーザー
 * @param credential 資格情報
 */
async function reauthenticateWithEmail(user: User, credential: AuthCredential) {
    try {
        await reauthenticateWithCredential(user, credential);
    } catch (error) {
        console.error(error);
        throw new Error('再認証に失敗しました');
    }
};

type EmailReauthModalProps = {
    user: User | null;
    onClose: () => void;
    onProfileUpdated: () => void;
}

const EmailAuthModal = ({ user, onClose, onProfileUpdated }: EmailReauthModalProps) => {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!user) return;
        setFormData(prevState => ({
            ...prevState,
            username: user.displayName || "",
            email: user.email || ""
        }));
        setLoading(false);
    }, [user]);

    // フォームの入力値を更新
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }, []);

    // フォームの送信
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!user || !user.email) {
            setMessage("ユーザー情報が見つかりません");
            return;
        }

        try {
            // 再認証
            const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
            await reauthenticateWithEmail(user, credential);
            // ユーザー名の更新
            if (formData.username !== user.displayName) {
                await updateProfile(user, { displayName: formData.username });
                setMessage(prevMessage => prevMessage + "ユーザー名を更新しました。 ");
            }

            // パスワードの更新
            if (formData.newPassword) {
                if (formData.newPassword !== formData.confirmNewPassword) {
                    throw new Error("新しいパスワードが一致しません");
                }
                await updatePassword(user, formData.newPassword);
                setMessage(prevMessage => prevMessage + "パスワードを更新しました。 ");
            }

            // メールアドレスの更新
            if (formData.email === user.email) {
                setMessage(prevMessage => prevMessage + "メールアドレスは変更されていません。 ");
            } else {
                if (isEmulator) {
                    await updateEmail(user, formData.email);
                    setMessage(prevMessage => prevMessage + "メールアドレスを更新しました。 ");
                } else {
                    const actionCodeSettings = {
                        url: "http://localhost:3000/signin",
                        handleCodeInApp: true,
                    };
                    await verifyBeforeUpdateEmail(user, formData.email, actionCodeSettings);
                    setMessage(prevMessage => prevMessage + "メールアドレスの確認メールを送信しました。 ");
                }
            }

            // フォームのリセット
            setFormData(prevState => ({
                ...prevState,
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            }));

            // プロフィール更新完了後の処理
            onProfileUpdated();

        } catch (error) {
            console.error(error);
            setMessage(`更新に失敗しました: ${error instanceof Error ? error.message : '未知のエラー'}`);
        }
    };

    if (loading) return <p>読み込み中...</p>;
    if (!user) return <p>ログインしてください</p>;

    return (
        <div>
            <form onSubmit={handleSubmit}>
                {/* フォームフィールド */}
                {Object.entries(formData).map(([key, value]) => (
                    <div key={key}>
                        <label htmlFor={key}>{key}</label>
                        <input
                            type={key.includes('Password') ? 'password' : 'text'}
                            id={key}
                            name={key}
                            value={value}
                            onChange={handleInputChange}
                            disabled={key === 'email' && formData.newPassword !== ''}
                            required={key !== 'newPassword' && key !== 'confirmNewPassword'}
                        />
                    </div>
                ))}
                <button type="submit">更新</button>
            </form>
            {message && <p>{message}</p>}
            <button onClick={onClose}>キャンセル</button>
        </div>
    );
};

export default EmailAuthModal;