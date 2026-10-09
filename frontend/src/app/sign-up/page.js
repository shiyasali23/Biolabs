import AuthComponent from "@/components/AuthComponent";
export const metadata = { title: "Create Account" };
export default function AuthPage() { return <main className="bio-page auth-layout"><AuthComponent signUp={true}/></main>; }
