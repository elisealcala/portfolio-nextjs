"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { setTheme } = useTheme();
  const pathname = usePathname();

  return (
    <div className="flex justify-between sm:items-center border-b w-full max-w-[1920px] fixed top-0 p-6 r-[50%] text-sm uppercase dark:text-white">
      <Link href="/">
        <h2 className="font-bold">Elizabeth Alcalá</h2>
      </Link>
      <div className="flex flex-col items-end sm:items-center sm:flex-row text-xs">
        <div className="flex items-center space-x-8 mt-1 sm:mt-0">
          <Link
            href="/blog"
            className={pathname === "/blog" ? "font-bold" : "font-medium"}
          >
            Blog
          </Link>
          <Link
            href="/about"
            className={pathname === "/about" ? "font-bold" : "font-medium"}
          >
            About
          </Link>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0 sm:pl-8">
          <button name="dark-mode" onClick={() => setTheme("dark")}>
            <Moon size={16} strokeWidth={2} />
          </button>
          <button name="light-mode" onClick={() => setTheme("light")}>
            <Sun size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
