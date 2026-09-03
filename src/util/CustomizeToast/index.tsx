const CustomizeToast = ({ isVisible, message, onAction, hideToast }) => {
  const styles = {
    toastContainer: {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "300px",
      backgroundColor: "#333",
      color: "white",
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
      zIndex: 1000,
      opacity: 0,
      transition: "opacity 0.3s, transform 0.3s",
    },
    show: {
      opacity: 1,
      transform: "translateX(-50%) translateY(0)",
      animation: "slideUp 0.5s ease-in-out",
    },
    hide: {
      opacity: 0,
      transform: "translateX(-50%) translateY(20px)",
    },
    closeButton: {
      position: "absolute",
      top: "8px",
      right: "8px",
      background: "none",
      color: "white",
      border: "none",
      fontSize: "16px",
      cursor: "pointer",
    },
    toastMessage: {
      margin: 0,
      fontSize: "16px",
    },
    actionButton: {
      marginTop: "10px",
      padding: "8px 12px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    },
  };

  const slideUp = `
        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `;
  const styleSheet = document.styleSheets[0];
  styleSheet.insertRule(slideUp, styleSheet.cssRules.length);

  return (
    <div
      style={{
        ...styles.toastContainer,
        ...(isVisible ? styles.show : styles.hide),
      }}
    >
      <button onClick={hideToast} style={styles.closeButton}>
        &times;
      </button>
      <p style={styles.toastMessage}>{message}</p>
      <button onClick={onAction} style={styles.actionButton}>
        Take Action
      </button>
    </div>
  );
};

export default CustomizeToast;
