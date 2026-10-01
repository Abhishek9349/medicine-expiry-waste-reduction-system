import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

function BarcodeScanner({
  onScanSuccess,
  onClose
}) {
  const scannerRef = useRef(null);
  const scannerStartedRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const scanner =
      new Html5Qrcode("barcode-reader");

    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          {
            facingMode: "environment"
          },
          {
            fps: 10,

            qrbox: {
              width: 250,
              height: 150
            },

            // Camera ke natural ratio ko use karenge
            // isliye duplicate/stretch problem nahi hogi
            disableFlip: false
          },

          // =====================================
          // SUCCESS
          // =====================================

          (decodedText) => {

            console.log(
              "Scanned Code:",
              decodedText
            );

            if (
              mountedRef.current &&
              onScanSuccess
            ) {
              onScanSuccess(decodedText);
            }
          },

          // =====================================
          // SCAN FAILURE
          // =====================================

          () => {
            // Normal scanning me continuously
            // failure callbacks aate hain.
            // Isliye ignore kar rahe hain.
          }
        );

        scannerStartedRef.current = true;

        // =====================================
        // IMPORTANT
        // React StrictMode me agar component
        // cleanup ho chuka hai aur scanner baad
        // me start hua, to turant stop karo.
        // =====================================

        if (!mountedRef.current) {

          try {

            await scanner.stop();

          } catch (error) {

            console.log(
              "Scanner already stopped."
            );
          }

          try {

            await scanner.clear();

          } catch (error) {

            console.log(
              "Scanner already cleared."
            );
          }

          scannerStartedRef.current = false;
        }

      } catch (error) {

        // Agar component unmount ho chuka hai
        // to error show nahi karna.

        if (!mountedRef.current) {
          return;
        }

        console.error(
          "Scanner start failed:",
          error
        );

        alert(
          "Camera start nahi ho paaya.\n\n" +
          "Browser camera permission check karein."
        );
      }
    };

    startScanner();

    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {

      mountedRef.current = false;

      const cleanupScanner = async () => {

        try {

          if (
            scannerStartedRef.current
          ) {

            await scanner.stop();

            scannerStartedRef.current =
              false;
          }

        } catch (error) {

          console.log(
            "Scanner stop handled."
          );
        }

        try {

          await scanner.clear();

        } catch (error) {

          console.log(
            "Scanner clear handled."
          );
        }
      };

      cleanupScanner();
    };

  }, [onScanSuccess]);

  // ==========================================
  // CLOSE BUTTON
  // ==========================================

  const handleClose = async () => {

    mountedRef.current = false;

    try {

      if (
        scannerRef.current
      ) {

        if (
          scannerStartedRef.current
        ) {

          await scannerRef.current.stop();

          scannerStartedRef.current =
            false;
        }

        try {

          await scannerRef.current.clear();

        } catch (error) {

          console.log(
            "Scanner already cleared."
          );
        }
      }

    } catch (error) {

      console.error(
        "Scanner close error:",
        error
      );
    }

    if (onClose) {
      onClose();
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "500px",
        margin: "20px auto",
        boxShadow:
          "0 4px 15px rgba(0,0,0,0.15)",
        boxSizing: "border-box"
      }}
    >

      <h2
        style={{
          marginTop: "0",
          marginBottom: "5px"
        }}
      >
        📷 Scan Medicine Barcode / QR
      </h2>

      <p
        style={{
          marginTop: "5px",
          color: "#555"
        }}
      >
        Camera ko barcode ya QR code ke
        saamne rakhein.
      </p>

      {/* =====================================
          CAMERA AREA
      ===================================== */}

      <div
        id="barcode-reader"
        style={{
          width: "100%",
          maxWidth: "450px",
          margin: "15px auto",
          overflow: "hidden",
          borderRadius: "10px"
        }}
      ></div>

      {/* =====================================
          CLOSE BUTTON
      ===================================== */}

      <button
        type="button"
        onClick={handleClose}
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          background: "#dc3545",
          color: "white",
          fontWeight: "600"
        }}
      >
        ✕ Close Scanner
      </button>

    </div>
  );
}

export default BarcodeScanner;