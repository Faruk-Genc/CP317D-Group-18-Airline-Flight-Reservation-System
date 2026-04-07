import { useState } from "react";
import styles from "./InfoPages.module.css";

export default function InfoPages({
  title,
  intro,
  sections,
  onBackHome,
  showTextBox = false,
  textBoxPlaceholder = "Type here...",
  onTextSubmit,
  textBoxLabel
}) {
  const [textValue, setTextValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onTextSubmit?.(textValue);
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.overlay}>
          <h1>{title}</h1>
          {intro && <p className={styles.intro}>{intro}</p>}
        </div>
      </div>

      <div className={styles.container}>
        <button className={styles.backBtn} onClick={onBackHome}>
          Back to Home
        </button>

        {sections?.map((section, index) => (
          <section key={index} className={styles.section}>
            <h2>{section.heading}</h2>

            {Array.isArray(section.text)
              ? section.text.map((t, i) => <p key={i}>{t}</p>)
              : section.text && <p>{section.text}</p>}

            {section.list && (
              <ul className={styles.list}>
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {showTextBox && (
          <form className={styles.textBoxSection} onSubmit={handleSubmit}>
            {textBoxLabel && (
              <h3 className={styles.textBoxLabel}>{textBoxLabel}</h3>
            )}

            <textarea
              className={styles.textBox}
              placeholder={textBoxPlaceholder}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
            />

            <button type="submit" className={styles.submitBtn}>
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
