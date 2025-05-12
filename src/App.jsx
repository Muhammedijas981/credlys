import { useState, useEffect } from "react";
import {
  Clipboard,
  Plus,
  X,
  Github,
  Linkedin,
  Globe,
  ExternalLink,
  Moon,
  Sun,
} from "lucide-react";

const DEFAULT_LINKS = [
  { id: "github", name: "GitHub", url: "", icon: "github" },
  { id: "linkedin", name: "LinkedIn", url: "", icon: "linkedin" },
  { id: "portfolio", name: "Portfolio", url: "", icon: "globe" },
];

const ICON_MAP = {
  github: <Github size={18} />,
  linkedin: <Linkedin size={18} />,
  globe: <Globe size={18} />,
  default: <ExternalLink size={18} />,
};

export default function App() {
  const [links, setLinks] = useState(() => {
    const savedLinks = localStorage.getItem("credlystLinks");
    return savedLinks ? JSON.parse(savedLinks) : DEFAULT_LINKS;
  });

  const [newFieldName, setNewFieldName] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem("credlystLinks", JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }
  }, []);

  const handleLinkChange = (id, value) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, url: value } : link))
    );
  };

  const handleCopy = (id, url) => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const addField = () => {
    if (!newFieldName.trim()) return;
    const newId = newFieldName.toLowerCase().replace(/\s+/g, "-");
    if (links.some((link) => link.id === newId)) return;

    let icon = "default";
    if (newFieldName.toLowerCase().includes("github")) icon = "github";
    else if (newFieldName.toLowerCase().includes("linkedin")) icon = "linkedin";
    else if (newFieldName.toLowerCase().includes("portfolio")) icon = "globe";

    setLinks([...links, { id: newId, name: newFieldName, url: "", icon }]);
    setNewFieldName("");
  };

  const removeField = (id) => {
    if (["github", "linkedin", "portfolio"].includes(id)) return;
    setLinks(links.filter((link) => link.id !== id));
  };

  const toggleDark = () => setDarkMode(!darkMode);

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <div className="container">
        <div className="header">
          <img src="/logo.png" alt="Credlyst Logo" className="logo" height={5} width={5} />
          <button onClick={toggleDark} className="toggle-btn">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="card">
          {links.map((link) => (
            <div key={link.id} className="link-entry">
              <div className="link-label">
                <span>{ICON_MAP[link.icon] || ICON_MAP.default}</span>
                {link.name}
                <div className="actions">
                  <button
                    onClick={() => handleCopy(link.id, link.url)}
                    className="action-btn"
                    disabled={!link.url}
                  >
                    <Clipboard size={16} />
                  </button>
                  {!["github", "linkedin", "portfolio"].includes(link.id) && (
                    <button
                      onClick={() => removeField(link.id)}
                      className="action-btn"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="input-wrapper">
                <input
                  id={link.id}
                  type="url"
                  value={link.url}
                  onChange={(e) => handleLinkChange(link.id, e.target.value)}
                  placeholder={`Your ${link.name} URL`}
                />
                {copiedId === link.id && (
                  <span className="copied">Copied!</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>Add Custom Field</h2>
          <div className="add-section">
            <input
              type="text"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="Field name (e.g. HackerRank)"
            />
            <button
              onClick={addField}
              disabled={!newFieldName.trim()}
              className="add-btn"
            >
              <Plus size={18} style={{ marginRight: "5px" }} /> Add
            </button>
          </div>
        </div>

        <p className="note">Your links are saved locally in this browser.</p>
      </div>
    </div>
  );
}
