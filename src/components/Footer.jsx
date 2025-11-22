export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer__grid">
                <section className="footer__section" aria-labelledby="ft1">
                    <h3 id="ft1" className="footer__title">TalkingPet</h3>
                    <div className="footer__address">
                        <p>Santa Cruz, Bolivia</p>
                        <p>Av. Ejemplo #123</p>
                        <p>+591 700-00000</p>
                    </div>
                </section>
                <section className="footer__section" aria-labelledby="ft2">
                    <h3 id="ft2" className="footer__title">Enlaces</h3>
                    <ul className="footer__list">
                        <li><a className="footer__link" href="/sitemap.xml">Sitemap</a></li>
                        <li><a className="footer__link" href="/robots.txt">Robots</a></li>
                    </ul>
                </section>
                <section className="footer__section" aria-labelledby="ft3">
                    <h3 id="ft3" className="footer__title">Redes</h3>
                    <div className="footer__social">
                        <a className="footer__social-link" href="#"><span className="pill">Instagram</span></a>
                        <a className="footer__social-link" href="#"><span className="pill">Facebook</span></a>
                    </div>
                </section>
            </div>
            <div className="container footer__bottom">
                <p className="footer__copyright">© {new Date().getFullYear()} TalkingPet</p>
                <div className="footer__legal">
                    <a className="footer__link" href="#">Términos</a>
                    <span className="footer__separator">|</span>
                    <a className="footer__link" href="#">Privacidad</a>
                </div>
            </div>
        </footer>
    );
}
