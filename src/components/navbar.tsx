"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const Navbar = () => {
  const { setTheme, theme } = useTheme();

  console.log({ theme });

  return (
    <div className="flex justify-between items-center border w-full border-b max-w-[1920px] fixed top-0 p-[30px] r-[50%] text-sm uppercase dark:text-white">
      <h2 className="font-bold">Elizabeth Alcalá</h2>
      <div className="flex items-center text-xs">
        <Link href="/blog" className="font-medium px-8">
          Blog
        </Link>
        <Link href="/about" className="font-medium px-8">
          About
        </Link>
        <button className="px-4" name="dark-mode" onClick={() => setTheme("dark")}>
          <Moon size={16} strokeWidth={1} />
        </button>
        <button className="px-4" name="light-mode" onClick={() => setTheme("light")}>
          <Sun size={16} strokeWidth={1} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
