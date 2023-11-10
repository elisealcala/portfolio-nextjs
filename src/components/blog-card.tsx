import Link from "next/link";

type BlogCardTypes = {
  title: string;
  slug: string;
  description?: string;
  date: string;
};

const BlogCard = ({ title, slug, description, date }: BlogCardTypes) => {
  return (
    <div>
      <Link href={`/blog/${slug}`}>
        <h2 className="text-[18px] font-bold my-2">{title}</h2>
      </Link>
      <p className="text-sm">{description}</p>
      <p className="text-xs mt-2 font-light">{new Date(date).toDateString()}</p>
    </div>
  );
};

export default BlogCard;
