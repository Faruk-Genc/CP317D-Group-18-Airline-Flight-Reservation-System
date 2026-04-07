import { useState } from "react";
import { useLang } from "../context/LangContext";
import styles from "./InfoPages.module.css";

export default function InfoPages({
  title,
  intro,
  sections,
  onBackHome,
  showTextBox = false,
  textBoxPlaceholder = { en: "Type here...", fr: "..." },
  onTextSubmit,
  textBoxLabel,
}) {
  const { en } = useLang();
  const lang = en ? "en" : "fr";

  const [textValue, setTextValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onTextSubmit?.(textValue);
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.overlay}>
          <h1>{title?.[lang]}</h1>
          {intro && <p className={styles.intro}>{intro[lang]}</p>}
        </div>
      </div>

      <div className={styles.container}>
        <button className={styles.backBtn} onClick={onBackHome}>
          {en ? "Back to Home" : "Retour à l'accueil"}
        </button>

        {sections?.map((section, index) => (
          <section key={index} className={styles.section}>
            <h2>{section.heading?.[lang]}</h2>

            {section.text?.map((t, i) => (
              <p key={i}>{t[lang]}</p>
            ))}

            {section.list && (
              <ul className={styles.list}>
                {section.list.map((item, i) => (
                  <li key={i}>{item[lang]}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {showTextBox && (
          <form className={styles.textBoxSection} onSubmit={handleSubmit}>
            {textBoxLabel && (
              <h3 className={styles.textBoxLabel}>{textBoxLabel[lang]}</h3>
            )}

            <textarea
              className={styles.textBox}
              placeholder={textBoxPlaceholder?.[lang]}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
            />

            <button type="submit" className={styles.submitBtn}>
              {en ? "Submit" : "..."}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}