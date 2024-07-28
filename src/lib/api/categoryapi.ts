/**
 * カテゴリー一覧を取得
 * @returns Promise<Categories>
 */
async function getCategories() {
    const response = await fetch("/api/categories");
    if (!response.ok) {
        const error = await response.json();
        console.error("カテゴリーの取得に失敗: ", error);
    }
    const categories = await response.json();
    console.log("カテゴリーの取得に成功: ", categories);
    return categories as Categories;
}
