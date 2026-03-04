import styles from "./Footer.module.css";
import logo from "../../assets/logo/airline-logo.svg";
import { ExternalLink } from "lucide-react";
import { useLang } from "../../context/LangContext";

export default function Footer() {
  const { en } = useLang();

  return (
    <section className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogo}>
          <img src={logo} alt="Airline Logo" style={{ width: "50px" }}/> AIR LAURIER
        </div>
        <br/>
        <hr style={{ color: "#333" }}/>
        <br/>

        <nav className={styles.footerColumn}>
          <div className={styles.column}>
            <h4>{en ? "About Air Laurier" : "À propos d'Air Laurier"}</h4>
            <ul>
              <li>{en ? "About us" : "À propos de nous"}</li>
              <li>{en ? "Careers" : "Carrières"}</li>
              <li>{en ? "News Hub" : "Actualités"} <ExternalLink size={14}/></li>
              <li>{en ? "Investor Relations" : "Relations investisseurs"} <ExternalLink size={14}/></li>
              <li>{en ? "Business Travel" : "Voyages d'affaires"} <ExternalLink size={14}/></li>
              <li>{en ? "Travel Agents" : "Agences de voyage"} <ExternalLink size={14}/></li>
              <li>{en ? "Mobile App" : "Application mobile"}</li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4>{en ? "Customer Service" : "Service client"}</h4>
            <ul>
              <li>{en ? "Help Center" : "Centre d'aide"}</li>
              <li>{en ? "Message Us" : "Envoyez-nous un message"}</li>
              <li>{en ? "Comment/Complaint" : "Commentaire/Plainte"}</li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4>{en ? "Site Support" : "Assistance du site"}</h4>
            <ul>
              <li>{en ? "Login help" : "Aide à la connexion"}</li>
              <li>{en ? "Site Map" : "Plan du site"}</li>
              <li>{en ? "Browser Compatibility" : "Compatibilité des navigateurs"}</li>
              <li>{en ? "Accessibility" : "Accessibilité"}</li>
              <li>{en ? "Booking Information" : "Informations sur les réservations"}</li>
              <li>{en ? "Tracking Preferences" : "Préférences de suivi"}</li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4>{en ? "Company" : "Entreprise"}</h4>
            <ul>
              <li>{en ? "Customer Commitment" : "Engagement client"}</li>
              <li>{en ? "Tarmac Delay Plan" : "Plan de retard sur le tarmac"}</li>
              <li>{en ? "Legal" : "Mentions légales"}</li>
              <li>{en ? "Sustainability" : "Durabilité"}</li>
              <li>{en ? "Contract of Carriage" : "Contrat de transport"}</li>
              <li>{en ? "Privacy & Security" : "Confidentialité et sécurité"}</li>
            </ul>
          </div>
        </nav>

        <div className={styles.copyright}>
          <span>© 2026 Air Laurier, Inc</span>
          <span>{en ? "Privacy Policy" : "Politique de confidentialité"}</span>
          <span>{en ? "Terms of Service" : "Conditions d'utilisation"}</span>
        </div>
        <br/><br/>
      </div>
    </section>
  );
}