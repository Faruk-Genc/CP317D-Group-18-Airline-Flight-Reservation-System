import "./Navbar.css";
import logo from "../assets/logo/airline-logo.svg";

export default function Navbar() {
    return(
        <nav className="nav">
            <section className="nav-brand">
                <img
                    className="nav-logo"
                    src={logo}
                    alt="placeholder"
                />
                <div className="nav-title">AIR LAURIER</div>
            </section>

            <section id="user-authentication">
                <section className="select-language">
                    FR
                </section>

                <img
                    className="user-icon"
                    src="https://placehold.co/50x50"
                    alt="placeholder"
                />

                <div className="sign-in-button">Sign in</div>
            </section>
        </nav>

    )
}
