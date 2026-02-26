import "./Footer.css";
import logo from "../../assets/logo/airline-logo.svg";
import { ExternalLink } from "lucide-react";

export default function Footer() {
    return(
        <section className="footer">
            <div className="footer-content">          
                <div className="footer-logo">
                    <img src={logo} alt="Airline Logo" style={{ width: "50px" }}/> AIR LAURIER
                </div>
                <br/>
                <hr style={{ color: "#333" }}/>
                <br/>
                <nav className="footer-column">
                    <div className="column">
                        <h4>About Air Laurier</h4>
                        <ul>
                        <li>About us</li>
                        <li>Careers</li>
                        <li>News Hub <ExternalLink size={14}/></li>
                        <li>Investor Relations <ExternalLink size={14}/></li>
                        <li>Business Travel <ExternalLink size={14}/></li>
                        <li>Travel Agents <ExternalLink size={14}/></li>
                        <li>Mobile App</li>
                        </ul>
                    </div>
                    
                    <div className="column">
                        <h4>Customer Service</h4>
                        <ul>
                        <li>Help Center</li>
                        <li>Message Us</li>
                        <li>Comment/Complaint</li>
                        </ul>
                    </div>
                    
                    <div className="column">
                        <h4>Site Support</h4>
                        <ul>
                        <li>Login help</li>
                        <li>Site Map </li>
                        <li>Browser Compatibility </li>
                        <li>Accessibility </li>
                        <li>Booking Information </li>
                        <li>Tracking Preferences</li>
                        </ul>
                    </div>
                    <div className="column">
                        <h4>Company</h4>
                        <ul>
                        <li>Customer Commitment</li>
                        <li>Tarmac Delay Plan </li>
                        <li>Legal </li>
                        <li>Sustainability </li>
                        <li>Contract of Carriage </li>
                        <li>Privacy & Security </li>
                        </ul>
                    </div>
                </nav>
                <div className="copyright">
                    <span>© 2026 Air Laurier, Inc</span>
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
                <br/><br/>
            </div>
        </section>
    )
}
