import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({ className = "brand-lockup", priority = false }) {
  return (
    <Link href="/" className={className} aria-label="Biolabs home">
      <Image
        src="/images/logo.svg"
        width={30}
        height={20}
        priority={priority}
        alt=""
        aria-hidden="true"
      />
      <span>BIOLABS</span>
    </Link>
  );
}
