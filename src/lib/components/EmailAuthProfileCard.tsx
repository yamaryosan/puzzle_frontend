import { getAuth, User, reauthenticateWithCredential, AuthCredential, EmailAuthProvider } from 'firebase/auth';
import firebaseApp from '@/app/firebase';
import { useState, useEffect, useCallback } from 'react';
import { updateProfile, updateEmail, updatePassword, verifyBeforeUpdateEmail } from 'firebase/auth';
import { updateUserInPrisma, checkPasswordStrength } from '@/lib/api/userapi';
import { Box } from '@mui/material';
import { Email, BadgeOutlined, PasswordOutlined } from '@mui/icons-material';
import CommonInputText from '@/lib/components/common/CommonInputText';
import CommonButton from '@/lib/components/common/CommonButton';
import { FirebaseError } from 'firebase/app';
import { ErrorOutline } from '@mui/icons-material';

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
    const [generalError, setGeneralError] = useState<string | null>(null);

    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [isVerified, setIsVerified] = useState<boolean>(false);

    // パスワードのバリデーション
    useEffect(() => {
        const validatePassword = async () => {
            const { messages, isVerified } = await checkPasswordStrength(form.newPassword);
            setPasswordErrors(messages);
            setIsVerified(isVerified);
        };
        validatePassword();
    }, [form.newPassword]);

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
            setGeneralError('ユーザーが見つかりません');
            return;
        }
        if (form.email === "") {
            setGeneralError('メールアドレスを入力してください');
            return;
        }
        if (form.currentPassword === "") {
            setGeneralError('現在のパスワードを入力してください');
            return;
        }
        if (form.newPassword && !isVerified) {
            setGeneralError('新パスワードに誤りがあります');
            return;
        }
        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            setGeneralError('新しいパスワードと確認用パスワードが一致しません');
            return;
        }

        try {
            // 再認証
            const credential = EmailAuthProvider.credential(user.email, form.currentPassword);
            await reauthenticate(user, credential);
            // 何も更新しない場合
            if (form.username === user.displayName && form.email === user.email && !form.newPassword) {
                setMessage('変更はありません');
                setGeneralError(null);
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
                setGeneralError(null);
            }
            // メールアドレスの更新
            if (form.email !== user.email) {
                if (isEmulator) {
                    await updateEmail(user, form.email);
                } else {
                    const actionCodeSettings = {
                        url: `${process.env.NEXT_PUBLIC_URL}/complete-email-update`,
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
                setGeneralError(null);
            }
            // パスワードが変更されていない場合
            if (form.newPassword === form.currentPassword) {
                setGeneralError('新しいパスワードは現在のパスワードと異なるものを入力してください');
                return;
            }
            // パスワードの更新
            if (form.newPassword) {
                if (form.newPassword !== form.confirmPassword) {
                    throw new Error('新しいパスワードと確認用パスワードが一致しません');
                }
                await updatePassword(user, form.newPassword);
                setMessage('パスワードを更新しました');
                setGeneralError(null);
                setForm(prevState => ({ ...prevState, currentPassword: "", newPassword: "", confirmPassword: "" }));
            }
        } catch (error) {
            console.error(error);
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case 'auth/wrong-password':
                        setGeneralError('パスワードが間違っています');
                        break;
                    case 'auth/missing-password':
                        setGeneralError('パスワードを入力してください');
                        break;
                    case 'auth/invalid-email':
                        setGeneralError('メールアドレスの形式が正しくありません');
                        break;
                    default:
                        setGeneralError(error.message);
                        break;
                }
            } else {
                setGeneralError('更新に失敗しました');
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
            {(passwordErrors.length > 0 && form.newPassword.length > 0) &&
                <Box sx={{ color: "error.main", display: "flex", gap: "0.5rem"}}>
                    <ErrorOutline />
                    <ul>
                        {passwordErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </Box>}
            <PasswordOutlined />
            <span>新しいパスワード(確認用)</span>
            <CommonInputText name="confirmPassword" elementType="password" value={form.confirmPassword} onChange={handleInputChange} />
            <Box sx={{ color: 'red' }}>{generalError}</Box>
            {message && <Box sx={{ color: 'green' }}>{message}</Box>}
            <CommonButton color="primary" onClick={handleUpdate}>更新</CommonButton>
        </Box>
        </>
    );
}