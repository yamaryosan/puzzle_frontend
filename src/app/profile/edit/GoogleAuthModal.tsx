import { getAuth } from 'firebase/auth';
import { Auth, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import firebaseApp from '@/app/firebase';
import { User } from 'firebase/auth';
import { useState, useCallback, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';

/**
 * Googleアカウントで再認証
 * @returns 
 */
async function reauthenticateWithGoogle(auth: Auth) {
    try {
        if (!auth.currentUser) {
            throw new Error('ユーザーが見つかりません');
        }
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(auth.currentUser, provider);
    } catch (error) {
        console.error(error);
        throw new Error('再認証に失敗しました');
    }
}

type GoogleAuthModalProps = {
    user: User | null;
    onClose: () => void;
    onProfileUpdated: () => void;
    onError: (error: string) => void;
}

const GoogleAuthModal = ({ user, onClose, onProfileUpdated, onError }: GoogleAuthModalProps) => {    
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        username: "",
    });

    useEffect(() => {
        if (!user) return;
        setFormData(prevState => ({
            ...prevState,
            username: user.displayName || ""
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
            const auth = getAuth(firebaseApp);
            await reauthenticateWithGoogle(auth);
            // ユーザー名の更新
            if (formData.username !== user.displayName) {
                await updateProfile(user, { displayName: formData.username });
            }
            // フォームのリセット
            setFormData(prevState => ({
                ...prevState,
            }));

            // プロフィール更新完了後の処理
            onProfileUpdated();

        } catch (error) {
            console.error(error);
            onError(`更新に失敗しました: ${error instanceof Error ? error.message : '未知のエラー'}`)
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
                            type='text'
                            id={key}
                            name={key}
                            value={value}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                ))}
                <button type="submit">更新</button>
            </form>
            <button onClick={onClose}>キャンセル</button>
        </div>
    );
};


export default GoogleAuthModal;