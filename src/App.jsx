import { useState, useEffect } from "react";
import {
  Clipboard,
  Plus,
  X,
  Moon,
  Sun,
  Trash2,
  Edit2,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import {
  FaGithub,
  FaLinkedin,
  FaGlobe,
  FaExternalLinkAlt,
  FaSearch,
} from "react-icons/fa";

const DEFAULT_LINKS = [
  { id: "github", name: "GitHub", url: "", icon: "github" },
  { id: "linkedin", name: "LinkedIn", url: "", icon: "linkedin" },
  { id: "portfolio", name: "Portfolio", url: "", icon: "globe" },
];

const ICON_MAP = {
  github: <FaGithub size={18} />,
  linkedin: <FaLinkedin size={18} />,
  globe: <FaGlobe size={18} />,
  default: <FaExternalLinkAlt size={18} />,
};

const getIconForDomain = (url) => {
  try {
    const domain = new URL(url).hostname;
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    return (
      <img
        src={googleFaviconUrl}
        alt="favicon"
        className="favicon"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://logo.clearbit.com/${domain}`;
        }}
      />
    );
  } catch {
    return ICON_MAP.default;
  }
};

// Add a footer section to showcase profile and contributions
const Footer = () => (
  <footer className="footer">
    <p>
      Created by{" "}
      <a href="https://bento.me/ijas" target="_blank" rel="noopener noreferrer">
        Ijas
      </a>
    </p>
    <p>
      Contribute on{" "}
      <a
        href="https://github.com/Muhammedijas981/credlys"
        target="_blank"
        rel="noopener noreferrer"
      >
        Github
      </a>
    </p>
  </footer>
);

const NoResults = () => (
  <div className="no-results">
    <div className="search-animation">
      <svg
        width="150"
        height="150"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="search-icon"
      >
        <path
          d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 21L16.65 16.65"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <h3>Oops! No results found</h3>
    <p>We couldn't find any links matching your search</p>
  </div>
);

export default function App() {
  const [links, setLinks] = useState(() => {
    const savedLinks = localStorage.getItem("credlystLinks");
    const parsedLinks = savedLinks ? JSON.parse(savedLinks) : [];

    // If there are no saved links, return default links
    if (!parsedLinks.length) {
      return DEFAULT_LINKS;
    }

    // Ensure default links are always present and preserve custom links
    const defaultLinkIds = DEFAULT_LINKS.map((link) => link.id);
    const customLinks = parsedLinks.filter(
      (link) => !defaultLinkIds.includes(link.id)
    );

    const mergedLinks = [
      ...DEFAULT_LINKS.map((defaultLink) => {
        const existingLink = parsedLinks.find(
          (link) => link.id === defaultLink.id
        );
        return existingLink
          ? { ...defaultLink, url: existingLink.url }
          : defaultLink;
      }),
      ...customLinks,
    ];

    return mergedLinks;
  });

  const [runTour, setRunTour] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModeIds, setEditModeIds] = useState([]);

  const tourSteps = [
    {
      target: ".link-entry:first-child input",
      content:
        "Welcome to Credlyst! 🎉 Start by pasting your profile links here. These default fields are always available for your most important profiles.",
      disableBeacon: true,
      placement: "bottom",
      spotlightPadding: 10,
      disableOverlay: false,
      styles: {
        options: {
          width: 350,
          zIndex: 10000,
        },
      },
    },
    {
      target: ".add-section",
      content:
        "Want to add more links? Type a name here and click Add to create custom link fields for any platform! ✨",
      placement: "top",
      spotlightPadding: 10,
      disableOverlay: false,
      styles: {
        options: {
          width: 350,
        },
      },
    },
  ];

  const [tourSettings] = useState({
    overlayColor: "rgba(0, 0, 0, 0.75)",
    spotlightPadding: 10,
  });

  useEffect(() => {
    // Only show tour if no links are saved in localStorage
    const savedLinks = localStorage.getItem("credlystLinks");
    if (!savedLinks) {
      setRunTour(true);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }
  };

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
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleOpenInNewTab = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
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
    // Put the new field in edit mode immediately
    setEditModeIds((prev) => [...prev, newId]);
    setNewFieldName("");
  };

  const removeField = (id) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const toggleDark = () => setDarkMode(!darkMode);

  const clearAllLinks = () => {
    const clearedLinks = links.map((link) => ({ ...link, url: "" }));
    setLinks(clearedLinks);
    localStorage.setItem("credlystLinks", JSON.stringify(clearedLinks));
  };

  const handleEditToggle = (id) => {
    if (editModeIds.includes(id)) {
      // Saving
      setEditModeIds(editModeIds.filter((editId) => editId !== id));
      toast.success("Changes saved successfully!");
    } else {
      // Entering edit mode
      setEditModeIds([...editModeIds, id]);
    }
  };

  const filteredLinks = links.filter((link) =>
    link.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        disableOverlayClose={true}
        hideCloseButton={true}
        spotlightClicks={false}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "#3b82f6",
            backgroundColor: darkMode ? "#1f2937" : "#ffffff",
            textColor: darkMode ? "#f9fafb" : "#111827",
            zIndex: 10000,
            arrowColor: darkMode ? "#1f2937" : "#ffffff",
            overlayColor: tourSettings.overlayColor,
          },
          spotlight: {
            backgroundColor: "transparent",
            borderRadius: "8px",
            padding: tourSettings.spotlightPadding,
          },
          tooltip: {
            padding: "16px",
            borderRadius: "12px",
            fontSize: "14px",
            lineHeight: "1.6",
            backgroundColor: darkMode ? "#1f2937" : "#ffffff",
          },
          tooltipContainer: {
            textAlign: "left",
          },
          buttonNext: {
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "500",
            backgroundColor: "#3b82f6",
          },
          buttonBack: {
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          buttonSkip: {
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          overlay: {
            backgroundColor: tourSettings.overlayColor,
          },
        }}
      />
      <div className="container">
        <div className="header">
          <div className="logo-section">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img src="/logo.png" alt="Credlyst Logo" className="logo" />
              <h1 className="app-name">Credlyst</h1>
            </div>
            <button
              onClick={toggleDark}
              className="toggle-btn"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <div className="search-wrapper">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search links..."
              className="search-bar"
            />
            <button className="search-icon-btn">
              <FaSearch className="search-icon" />
            </button>
          </div>
        </div>

        <div className="card">
          {filteredLinks.length > 0 ? (
            filteredLinks.map((link) => (
              <div key={link.id} className="link-entry">
                <div className="link-label">
                  <span>
                    {link.url
                      ? getIconForDomain(link.url)
                      : ICON_MAP[link.icon] || ICON_MAP.default}
                  </span>
                  <span className="link-name">{link.name}</span>
                  <div className="actions">
                    <button
                      onClick={() => handleCopy(link.id, link.url)}
                      className="action-btn"
                      disabled={!link.url}
                      title="Copy link"
                    >
                      <Clipboard size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenInNewTab(link.url)}
                      className="action-btn open-tab-btn"
                      disabled={!link.url}
                      title="Open in new tab"
                    >
                      <FaExternalLinkAlt size={16} />
                    </button>
                    <button
                      onClick={() => handleEditToggle(link.id)}
                      className={`action-btn ${
                        editModeIds.includes(link.id) ? "edit-active" : ""
                      }`}
                      title={
                        editModeIds.includes(link.id)
                          ? "Save changes"
                          : "Edit link"
                      }
                    >
                      {editModeIds.includes(link.id) ? (
                        <Save size={16} />
                      ) : (
                        <Edit2 size={16} />
                      )}
                    </button>
                    {!["github", "linkedin", "portfolio"].includes(link.id) && (
                      <button
                        onClick={() => removeField(link.id)}
                        className="action-btn delete-btn"
                        title="Remove field"
                      >
                        <Trash2 size={16} />
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
                    disabled={!editModeIds.includes(link.id)}
                    className={editModeIds.includes(link.id) ? "editing" : ""}
                  />
                  {copiedId === link.id && (
                    <span className="copied">Copied!</span>
                  )}
                </div>
              </div>
            ))
          ) : searchQuery ? (
            <NoResults />
          ) : null}
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

        <div className="card">
          <button onClick={clearAllLinks} className="clear-btn">
            <Trash2 size={18} style={{ marginRight: "5px" }} /> Clear All Links
          </button>
        </div>

        <div className="app-description">
          <div className="description-icon">✨</div>
          <h3>Your Links, Your Story!</h3>
          <p>
            Never lose track of your professional presence again. Perfect for:
          </p>
          <div className="features-list">
            <span>🎯 Job Applications</span>
            <span>💼 Professional Networking</span>
            <span>🌟 Personal Branding</span>
          </div>
          <p className="inspire-text">
            One hub for all your important links - because making a great first
            impression shouldn't be hard!
          </p>
        </div>
        <Footer />
        <p className="note">Your links are saved locally in this browser.</p>
      </div>
    </div>
  );
}
