import Link from "next/link";

const AboutPage = () => {
  return (
    <div className="text-lg max-w-[600px]">
      <div className="mb-3">
        {`Hi I'm`} <b>Elizabeth</b> from Lima, Perú.
      </div>
      <div className="mb-3">
        {`I've`} been working as a front-end developer for almost five years with
        technologies such as <b>React</b>, <b>Typescript</b>, <b>Next.js</b> and many
        more.
      </div>
      <div className="mb-3">
        Feel free to contact me.
        <div className="flex flex-col font-bold text-base mt-6 space-y-4">
          <Link href="https://twitter.com/elisealcala" target="_blank">
            Twitter
          </Link>
          <Link href="https://github.com/elisealcala" target="_blank">
            Github
          </Link>
          <Link href="https://www.linkedin.com/in/elizalcala" target="_blank">
            LinkedIn
          </Link>
          <Link href="mailto:elizabethalcala28@gmail.com" target="_blank">
            elizabethalcala28@gmail.com
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
