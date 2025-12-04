import { Link } from "react-router-dom";
import { Leaf, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-forest-dark py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-emerald flex items-center justify-center">
                <Leaf className="w-5 h-5 text-forest" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                AirSwap
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              Verifying vegetation growth and issuing Oxygen Credits through
              satellite technology.
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-5 h-5 text-white/60" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Product",
              links: ["Map", "Dashboard", "API", "Pricing"],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Press"],
            },
            {
              title: "Legal",
              links: ["Privacy", "Terms", "Security", "Cookies"],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-display font-semibold text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/60 text-sm hover:text-teal transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © 2024 AirSwap. All rights reserved.
          </p>
          <p className="text-white/40 text-sm">
            Made with 💚 for the planet
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
