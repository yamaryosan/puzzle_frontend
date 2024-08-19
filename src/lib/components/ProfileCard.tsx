import { useEffect, useState } from 'react';
import { getAuth, User } from 'firebase/auth';
import { Box } from '@mui/material';

export default function ProfileCard({ user }: { user: User }) {
    const [username, setUsername] = useState(user.displayName || '');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setUsername(user.displayName || '');
    }, [user.displayName]);

    // 入力欄クリック時のイベント
    const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {

    }

    // 編集ボタンクリック時のイベント
    const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {

        setIsEditing(true);
    }

    // 編集結果確定ボタンクリック時のイベント
    const handleUpdateClick = (e: React.MouseEvent<HTMLButtonElement>) => {

        setIsEditing(false);
    }
    return (
        <>
        {isEditing ? (
            <>
            <input type="text" value={username} onClick={handleInputClick} onChange={(e) => setUsername(e.target.value)} required style={{ display: "inline-block" }}/>
            <button onClick={handleUpdateClick}>更新</button>
            <p>メールアドレス: {user?.email}</p>
            </>
        ) : (
            <>
                <p style={{display: "inline-block"}}>{user?.displayName}</p>
                <button onClick={handleEditClick}>編集</button>
            <p>メールアドレス: {user?.email}</p>
            </>
        )}
        </>
    )
}