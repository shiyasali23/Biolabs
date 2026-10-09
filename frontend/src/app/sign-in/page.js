import AuthComponent from "@/components/AuthComponent";
export const metadata = { title: "Sign In" };
export default function AuthPage() { return <main className="bio-page auth-layout"><AuthComponent signUp={false}/></main>; }
