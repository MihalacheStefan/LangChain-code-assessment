import ComposeEmailModal from "@/components/ComposeEmailModal";
import { useEffect, useState } from "react";

export default function EmailsPage() {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/emails/emails");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEmails(data.emails || []);
    } catch (error) {
      setError("Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading emails...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2>Error loading emails</h2>
        <p>{error}</p>
      </div>
    );
  }

  function Sidebar() {
    return (
      <div
        style={{
          width: "25%",
          borderRight: "1px solid",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "1rem", borderBottom: "1px solid" }}>
          <h2>Inbox</h2>
          <p>{emails.length} emails</p>
        </div>

        {emails.length === 0 ? (
          <div>No emails found</div>
        ) : (
          <div>
            {emails.map((email) => (
              <div
                key={email.id}
                style={{
                  backgroundColor:
                    selectedEmail?.id === email.id ? "#eff6ff" : "transparent",
                }}
                onClick={() => setSelectedEmail(email)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <h3>{email.subject}</h3>
                  <span>{formatDate(email.created_at)}</span>
                </div>
                <p>TO: {email.to}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function EmailContent() {
    return (
      <div style={{ width: "75%" }}>
        {selectedEmail ? (
          <div style={{ display: "flex", direction: "column" }}>
            <div>
              <div
                style={{
                  display: "flex",
                  "justify-content": "center",
                  "align-items": "center",
                  gap: "1rem",
                }}
              >
                <h1>{selectedEmail.subject}</h1>-
                <span>{formatDate(selectedEmail.created_at)}</span>
              </div>
              <div>
                <div style={{ display: "flex" }}>
                  <span>To:</span>
                  <span>{selectedEmail.to}</span>
                </div>
                {selectedEmail.cc && (
                  <div style={{ display: "flex" }}>
                    <span>CC:</span>
                    <span>{selectedEmail.cc}</span>
                  </div>
                )}
                {selectedEmail.bcc && (
                  <div style={{ display: "flex" }}>
                    <span>BCC:</span>
                    <span>{selectedEmail.bcc}</span>
                  </div>
                )}
                <div>
                  <textarea>{selectedEmail.body}</textarea>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div>
              <h2>Select an email</h2>
              <p>Choose an email from the sidebar to view its content</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleEmailSent = () => {
    fetchEmails();
  };

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar />
        <EmailContent />
      </div>

      <button
        onClick={() => {
          setIsModalOpen(true);
          setSelectedEmail(null);
        }}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
        }}
      >
        <span>New Email</span>
      </button>

      <ComposeEmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleEmailSent}
      />
    </div>
  );
}
