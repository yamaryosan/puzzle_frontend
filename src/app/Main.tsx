import LeftDrawer from "@/app/LeftDrawer";

export default function Main({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
            <LeftDrawer />
            {children}
        </>
    )
}