import { AuthCredential, User } from 'firebase/auth';
import { reauthenticateWithCredential } from 'firebase/auth';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { EmailAuthProvider } from 'firebase/auth';
import { useState, useCallback } from 'react';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import { useEffect } from 'react';

import { updateUserInPrisma } from '@/lib/api/userapi';

/**
 * 20240709追記
 * verifyBeforeUpdateEmailの後にはメッセージを表示する処理が必要。
 * 現在、この処理が抜けているため、追記する。
 */

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
    onError: (error: string) => void;
}

const EmailAuthModal = ({ user, onClose, onProfileUpdated, onError }: EmailReauthModalProps) => {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });

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

        if (!user || !user.email) {
            onError("ユーザー情報が見つかりません");
            return;
        }

        try {
            // 再認証
            const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
            await reauthenticateWithEmail(user, credential);

            // ユーザー名の更新
            if (formData.username !== user.displayName) {
                await updateProfile(user, { displayName: formData.username });
            }

            // パスワードの更新
            if (formData.newPassword) {
                if (formData.newPassword !== formData.confirmNewPassword) {
                    onError("新しいパスワードが一致しません");
                }
                await updatePassword(user, formData.newPassword);
            }

            // メールアドレスの更新
            if (formData.email === user.email) {
                onError("新しいメールアドレスは現在のメールアドレスと同じです");
            } else {
                if (isEmulator) {
                    await updateEmail(user, formData.email);
                } else {
                    const actionCodeSettings = {
                        url: `${process.env.NEXT_PUBLIC_URL}/signin`,
                        handleCodeInApp: true,
                    };
                    await verifyBeforeUpdateEmail(user, formData.email, actionCodeSettings);
                }
            }
            
            // DBのユーザテーブル上の情報も更新
            await updateUserInPrisma({
                firebaseUid: user.uid,
                email: formData.email,
                displayName: formData.username
            });

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
            onError(`更新に失敗しました: ${error instanceof Error ? error.message : '未知のエラー'}`);
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
            <button onClick={onClose}>キャンセル</button>
        </div>
    );
};

export default EmailAuthModal;