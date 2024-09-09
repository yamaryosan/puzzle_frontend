import { getAuth, User, Auth, reauthenticateWithCredential, AuthCredential, EmailAuthProvider } from 'firebase/auth';
import firebaseApp from '@/app/firebase';
import { useState, useEffect, useCallback } from 'react';
import { updateProfile, updateEmail, updatePassword, verifyBeforeUpdateEmail } from 'firebase/auth';
import { updateUserInPrisma } from '@/lib/api/userapi';
import { Box, Button } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Email, BadgeOutlined, PasswordOutlined } from '@mui/icons-material';
import CommonInputText from '@/lib/components/common/CommonInputText';
import CommonButton from '@/lib/components/common/CommonButton';
import { FirebaseError } from 'firebase/app';

type EmailAuthProfileCardProps = {
    user: User | null;
}

const isEmulator = process.env.NODE_ENV === 'development';

/**
 * メールアドレス認証の場合の再認証
 * @param user ユーザー
 * @param credential 資格情報
 */
async function reauthenticate(user: User, credential: AuthCredential) {
    try {
        await reauthenticateWithCredential(user, credential);
    } catch (error) {
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/wrong-password':
                    throw new FirebaseError('auth/wrong-password', 'パスワードが間違っています');
                default:
                    throw new FirebaseError(error.code, error.message);
            }
        }
    }
};

export default function EmailAuthProfileCard({ user }: EmailAuthProfileCardProps) {
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        username: user?.displayName || "",
        email: user?.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ユーザー情報の取得
    useEffect(() => {
        const unsubscribe = getAuth(firebaseApp).onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setForm({
                    username: currentUser.displayName || "",
                    email: currentUser.email || "",
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [user]);

    // フォームの入力値を更新
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prevState => ({ ...prevState, [name]: value }));
        setMessage(null);
    }, []);

    // プロフィール更新
    const handleUpdate = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setMessage(null);

        if (!user || !user.email) {
            setError('ユーザーが見つかりません');
            return;
        }

        try {
            // 再認証
            const credential = EmailAuthProvider.credential(user.email, form.currentPassword);
            await reauthenticate(user, credential);
            // 何も更新しない場合
            if (form.username === user.displayName && form.email === user.email && !form.newPassword) {
                setMessage('変更はありません');
                setError(null);
                return;
            }
            // ユーザ名の更新
            if (form.username !== user.displayName) {
                await updateProfile(user, { displayName: form.username });
                await updateUserInPrisma({
                    firebaseUid: user.uid,
                    email: user.email,
                    displayName: form.username
                })
                setMessage('プロフィールを更新しました');
            }
            // メールアドレスの更新
            if (form.email !== user.email) {
                if (isEmulator) {
                    await updateEmail(user, form.email);
                } else {
                    const actionCodeSettings = {
                        url: "http://localhost:3000/complete-email-update",
                        handleCodeInApp: true,
                    }
                    await verifyBeforeUpdateEmail(user, form.email, actionCodeSettings);
                }
                // メールアドレスの更新が完了したら、Prismaのユーザー情報も更新(後で以下の行を移動)
                await updateUserInPrisma({
                    firebaseUid: user.uid,
                    email: form.email,
                    displayName: user.displayName
                })
                setMessage('入力されたメールアドレスに確認メールを送信しました。メール内のリンクをクリックして更新を完了してください');
            }
            // パスワードの更新
            if (form.newPassword) {
                if (form.newPassword !== form.confirmPassword) {
                    throw new Error('新しいパスワードと確認用パスワードが一致しません');
                }
                await updatePassword(user, form.newPassword);
                setMessage('パスワードを更新しました');
                setForm(prevState => ({ ...prevState, currentPassword: "", newPassword: "", confirmPassword: "" }));
            }
        } catch (error) {
            console.error(error);
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case 'auth/wrong-password':
                        setError('パスワードが間違っています');
                        break;
                    case 'auth/missing-password':
                        setError('パスワードを入力してください');
                        break;
                    case 'auth/invalid-email':
                        setError('メールアドレスの形式が正しくありません');
                        break;
                    default:
                        setError(error.message);
                        break;
                }
            } else {
                setError('更新に失敗しました');
            }
        }
    }

    return (
        <>
        <Box component="form">
            <BadgeOutlined />
            <span>ユーザ名</span>
            <CommonInputText name="username" value={form.username} onChange={handleInputChange} />
            <Email />
            <span>メールアドレス</span>
            <CommonInputText name="email" elementType="email" value={form.email} onChange={handleInputChange} />
            <PasswordOutlined />
            <span>現在のパスワード</span>
            <CommonInputText name="currentPassword" elementType="password" value={form.currentPassword} onChange={handleInputChange} />
            <PasswordOutlined />
            <span>新しいパスワード</span>
            <CommonInputText name="newPassword" elementType="password" value={form.newPassword} onChange={handleInputChange} />
            <PasswordOutlined />
            <span>新しいパスワード（確認）</span>
            <CommonInputText name="confirmPassword" elementType="password" value={form.confirmPassword} onChange={handleInputChange} />
            <Box sx={{ color: 'red' }}>{error}</Box>
            {message && <Box sx={{ color: 'green' }}>{message}</Box>}
            <CommonButton color="primary" onClick={handleUpdate}>編集結果を確定</CommonButton>
        </Box>
        </>
    );
}