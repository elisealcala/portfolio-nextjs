import { featuredExperience } from "@/lib/experience";

export function ExperienceList({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className="experience-list">
      {featuredExperience.map((work) => (
        <article className="experience-row" key={work.company} data-reveal>
          <div className="experience-meta">
            <span className="eyebrow">
              {work.company}
              {work.client ? ` · Client: ${work.client}` : ""}
            </span>
            <span className="experience-period mono">
              <time dateTime={work.start}>{work.period.split(" — ")[0]}</time>
              {" — "}
              {work.end ? (
                <time dateTime={work.end}>{work.period.split(" — ")[1]}</time>
              ) : (
                "Present"
              )}
            </span>
            <p>{work.role}</p>
          </div>
          <div className="experience-copy">
            <h3>{work.title}</h3>
            <p>{work.summary}</p>
            {detailed && (
              <ul>
                {work.contributions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {detailed && (
              <div className="tags">
                {work.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
