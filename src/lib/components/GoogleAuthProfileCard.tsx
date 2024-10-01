import { getAuth, User, Auth, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import firebaseApp from '@/app/firebase';
import { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { updateUserInPrisma } from '@/lib/api/userapi';
import { Box, Button, Input } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Email, BadgeOutlined } from '@mui/icons-material';

type GoogleAuthProfileCardProps = {
    user: User | null;
}

/**
 * 再認証
 * @param auth 認証情報
 */
async function reauthenticate(auth: Auth) {
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

export default function GoogleAuthProfileCard({ user }: GoogleAuthProfileCardProps) {    
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState(user?.displayName || "");
    const [isEditing, setIsEditing] = useState(false);    

    useEffect(() => {
        if (!user) return;
        setUsername(user.displayName || "");
        setLoading(false);
    }, [user]);

    if (loading) return <p>読み込み中...</p>;

    // 入力欄クリック時のイベント
    const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    }

    // 編集ボタンクリック時のイベント
    const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsEditing(true);
    }

    // 編集結果確定ボタンクリック時のイベント
    const handleUpdateClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        try {
            if (!user) {
                throw new Error('ユーザーが見つかりません');
            }
            await reauthenticate(getAuth(firebaseApp));
            if (username !== user.displayName) {
                await updateProfile(user, { displayName: username });
                // DBのユーザテーブル上の情報も更新
                await updateUserInPrisma({
                    firebaseUid: user.uid,
                    email: user.email,
                    displayName: username
                });
            }
        } catch (error) {
            console.error(error);
        }
        setIsEditing(false);
    }

    return (
        <>
        <Box sx={{ display: "flex", alignItems: "center" }}>
            <BadgeOutlined style={{marginRight: "1rem"}} />
            {isEditing ? (
                <>
                <Input type="text" value={username} onClick={handleInputClick} onChange={(e) => setUsername(e.target.value)} required
                sx={{ display: "inline-block", paddingY: "0.5rem", fontSize: "1.5rem", marginRight: "0.5rem" }}/>
                <Button onClick={handleUpdateClick}>
                    <Edit />
                </Button>
                </>
            ) : (
                <>
                <p>{user?.displayName}</p>
                <Button onClick={handleEditClick}>
                    <Edit />
                </Button>
                </>
            )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
            <Email style={{marginRight: "1rem"}} />
            <span style={{ overflowWrap: "anywhere" }}>{user?.email}</span>
        </Box>
        </>
    )
};