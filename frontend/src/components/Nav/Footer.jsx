import styles from "./Footer.module.css";
import logo from "../../assets/logo/airline-logo.svg";
import { ExternalLink } from "lucide-react";
import { useLang } from "../../context/LangContext";

export default function Footer({ onNavigate }) {
  const { en } = useLang();

  const footerSections = [
    {
      title: en ? "About Air Laurier" : "À propos d'Air Laurier",
      links: [
        { label: en ? "About us" : "À propos de nous", page: "about" },
        { label: en ? "Careers" : "Carrières", page: "careers" },
        { label: en ? "News Hub " : "Actualités ", external: true, url: "https://simpleflying.com/category/aviation-news/"},
        { label: en ? "Investor Relations " : "Relations investisseurs ", external: true, url: "https://www.iata.org/en/publications/economics/" },
        { label: en ? "Business Travel " : "Voyages d'affaires ", external: true, url: "https://www.travelctm.com/global/"},
        { label: en ? "Travel Agents " : "Agences de voyage ", external: true, url: "https://www.iata.org/en/services/travel-agency-program/"},
        { label: en ? "Mobile App " : "Application mobile ", external: true, url: "https://apps.microsoft.com/search?query=Air+Laurier&hl=en-GB&gl=CA"},
      ],
    },
    {
      title: en ? "Customer Service" : "Service client",
      links: [
        { label: en ? "Help Center" : "Centre d'aide", page: "help-center" },
        { label: en ? "Message Us" : "Envoyez-nous un message", page: "message-us" },
        { label: en ? "Comment/Complaint" : "Commentaire/Plainte", page: "complaint" },
      ],
    },
    {
      title: en ? "Site Support" : "Assistance du site",
      links: [
        { label: en ? "Login help" : "Aide à la connexion", page: "login-help" },
        { label: en ? "Site Map" : "Plan du site", page: "site-map" },
        { label: en ? "Browser Compatibility" : "Compatibilité des navigateurs", page: "browser" },
        { label: en ? "Accessibility" : "Accessibilité", page: "accessibility" },
        { label: en ? "Booking Information" : "Informations sur les réservations", page: "booking-info" },
        { label: en ? "Tracking Preferences" : "Préférences de suivi", page: "tracking" },
      ],
    },
    {
      title: en ? "Company" : "Entreprise",
      links: [
        { label: en ? "Customer Commitment" : "Engagement client", page: "commitment" },
        { label: en ? "Tarmac Delay Plan" : "Plan de retard sur le tarmac", page: "tarmac" },
        { label: en ? "Legal" : "Mentions légales", page: "legal" },
        { label: en ? "Sustainability" : "Durabilité", page: "sustainability" },
        { label: en ? "Contract of Carriage" : "Contrat de transport", page: "contract" },
        { label: en ? "Privacy & Security" : "Confidentialité et sécurité", page: "privacy" },
      ],
    },
  ];

  return (
    <section className={styles.bar}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <img src={logo} alt="Airline Logo" style={{ width: "50px" }}/> AIR LAURIER
        </div>
        <br/>
        <hr style={{ border: "none", borderTop: "2px solid #333"}} />
        <br/>
        <nav className={styles.columns}>
          {footerSections.map((section, i) => (
            <div key={i} className={styles.group}>
              <h4>{section.title}</h4>

              <ul>
                {section.links.map((link, j) => (
                  <li
                    key={j}
                    onClick={() => {
                      if (link.external && link.url) {
                        window.open(link.url, "_blank");
                      } else if (link.page) {
                        onNavigate?.(link.page);
                      }
                    }}
                    style={{ cursor: link.page ? "pointer" : "default" }}
                  >
                    {link.label}
                    {link.external && <ExternalLink size={14} />}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className={styles.info}>
          <span>© 2026 Air Laurier, Inc</span>
          <span>{en ? "Privacy Policy" : "Politique de confidentialité"}</span>
          <span>{en ? "Terms of Service" : "Conditions d'utilisation"}</span>
        </div>
        <br/><br/>
      </div>
    </section>
  );
}