"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  username: string;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  profileUrl,
  username,
}: QRCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && profileUrl) {
      QRCode.toDataURL(profileUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url: string) => {
          setQrCodeDataUrl(url);
        })
        .catch((err: Error) => {
          console.error("Error generating QR code:", err);
        });
    }
  }, [isOpen, profileUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border border-gray-800 rounded-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">QR Code for @{username}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex justify-center mb-4">
          {qrCodeDataUrl ? (
            <img src={qrCodeDataUrl} alt="QR Code" className="w-64 h-64" />
          ) : (
            <div className="w-64 h-64 bg-gray-800 flex items-center justify-center">
              <p className="text-gray-400">Generating QR code...</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-900 rounded-lg">
          <input
            type="text"
            value={profileUrl}
            readOnly
            className="flex-1 bg-transparent text-sm text-gray-300 outline-none"
          />
          <button
            onClick={handleCopyLink}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              copied
                ? "bg-green-600 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <p className="text-sm text-gray-400 text-center">
          Scan this QR code to visit @{username}&apos;s profile
        </p>
      </div>
    </div>
  );
}
