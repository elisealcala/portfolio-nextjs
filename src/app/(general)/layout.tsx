import React from "react";

import Navbar from "@/components/navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex flex-col lg:w-[960px] xl:w-[1024px] mx-auto mt-32 px-[24px] lg:px-0 pb-16">
        {children}
      </main>
    </>
  );
}
