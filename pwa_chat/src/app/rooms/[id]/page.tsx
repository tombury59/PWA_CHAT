"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "../../hooks/useChat";
import { useRoomStatus } from "../../hooks/useRoomStatus";
import { useSocket } from "../../../contexts/SocketContext";
import PhotoCapture from "../../../components/PhotoCapture";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.tools.gavago.fr/socketio/api";
const API_IMAGES_URL = process.env.NEXT_PUBLIC_API_IMAGES_URL || "https://api.tools.gavago.fr/socketio/api/images";

const ChatImage = ({ src, alt, className }: { src: string, alt: string, className: string }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setLoading(true);
    setError(false);
    setImgSrc(null);

    // Case 1: Base64 or specific generic prefix
    if (src.startsWith("data:") || src.startsWith("IMAGE:")) {
      setImgSrc(src.startsWith("IMAGE:") ? src.replace("IMAGE:", "") : src);
      setLoading(false);
      return;
    }

    // Case 2: API URL that returns JSON
    // We check for /api/images/ to match both .../socketio/api/images and potential variants
    if (src.includes("/api/images/")) {
      console.log("ChatImage fetching JSON for:", src);
      fetch(src)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          console.log("ChatImage response:", data);
          if (data.success && data.data_image) {
            setImgSrc(data.data_image);
          } else {
            console.warn("ChatImage: Invalid data structure or success=false", data);
            // Fallback: try using the URL itself if JSON failed but we have a fallback? 
            // Actually if it's the API, it MUST return JSON. If it failed, it's an error.
            setError(true);
          }
        })
        .catch((err) => {
          console.error("ChatImage fetch error:", err);
          setError(true);
        })
        .finally(() => setLoading(false));
    } else {
      // Case 3: Direct image URL
      setImgSrc(src);
      setLoading(false);
    }
  }, [src]);

  if (loading) return <div className="w-32 h-32 bg-gray-200 animate-pulse rounded-lg" />;
  if (error) return <div className="p-2 bg-red-100 text-red-500 rounded border border-red-200 text-xs">Erreur de chargement</div>;

  return (
    <img
      src={imgSrc || src}
      alt={alt}
      className={className}
      onError={(e) => {
        console.error("Image load error for src:", imgSrc || src);
        setError(true);
      }}
    />
  );
};

const MessageContent = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 300;

  console.log("MessageContent:", content.substring(0, 50));

  if (content.startsWith("[IMAGE]") || content.startsWith("IMAGE:")) {
    const rawSrc = content.startsWith("[IMAGE]") ? content.replace("[IMAGE] ", "") : content.replace("IMAGE:", "");
    // If the src looks like a pure ID (no dots, no slashes, just alphanum), prepend the API URL
    // This handles the case where the server might send "IMAGE: <ID>"
    const isPareId = /^[a-zA-Z0-9_-]+$/.test(rawSrc.trim());
    const finalSrc = isPareId ? `${API_IMAGES_URL}/${rawSrc.trim()}` : rawSrc;

    return (
      <ChatImage
        src={finalSrc}
        alt="Shared photo"
        className="rounded-lg max-w-full h-auto mt-2 border border-white/20"
      />
    );
  }

  // Handle server notification format for images
  // Example: "Nouvelle image pour le user Romain.\n11:30\nRomain\nxCTSEYlzgEdLwwNOAAFl"
  if (content.includes("Nouvelle image pour le user")) {
    const lines = content.trim().split('\n');
    // Ensure we have multiple lines, otherwise it's just the notification text
    if (lines.length > 1) {
      const potentialId = lines[lines.length - 1].trim();
      // Basic validation: ID should not contain spaces and be reasonably long
      if (potentialId && potentialId.length > 5 && !potentialId.includes(' ')) {
        const imageUrl = `${API_IMAGES_URL}/${potentialId}`;
        return (
          <ChatImage
            src={imageUrl}
            alt="Shared photo"
            className="rounded-lg max-w-full h-auto mt-2 border border-white/20"
          />
        );
      }
    }
  }

  if (content.length <= maxLength) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  return (
    <div className="whitespace-pre-wrap">
      {isExpanded ? content : `${content.substring(0, maxLength)}...`}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-[var(--accent)] ml-1 hover:underline font-bold"
      >
        {isExpanded ? "Voir moins" : "Voir plus"}
      </button>
    </div>
  );
};
const decodeRoomName = (encodedName: string): string => {
  try {
    return decodeURIComponent(
      decodeURIComponent(
        encodedName.replace(/\+/g, ' ')
      )
    );
  } catch {
    return encodedName;
  }
};

const normalizePseudo = (p: any): string => {
  if (!p) return "Anonyme";
  if (typeof p === "string") return p;
  if (typeof p === "object" && p !== null) {
    return p.username || p.name || "Anonyme";
  }
  return String(p);
};

const formatInfoMessage = (content: string): string => {
  const matches = content.match(/(.*?) \(id:.*?\) a rejoint la room (.*?) de \d+ client\(s\)/);
  if (!matches) return content;

  const [, pseudo, roomName] = matches;
  const decodedRoomName = decodeRoomName(roomName);
  const truncatedRoomName = decodedRoomName.length > 50
    ? `${decodedRoomName.substring(0, 47)}...`
    : decodedRoomName;

  return `${pseudo} a rejoint la room ${truncatedRoomName}`;
};

const Chat: React.FC<{ roomId: string }> = ({ roomId }) => {
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const pseudo = typeof window !== "undefined" ? localStorage.getItem("userName") || "Anonyme" : "Anonyme";
  const decodedRoomId = decodeRoomName(roomId);

  const { messages, sendMessage } = useChat(roomId, pseudo);
  const { clientList } = useRoomStatus();
  const { socket } = useSocket();

  const [showCamera, setShowCamera] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  // Gallery & File Import
  const [showGallery, setShowGallery] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setShowCamera(true); // Reuse the preview modal from camera
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openGallery = () => {
    const stored = localStorage.getItem("userGalleryPhotos");
    setGalleryPhotos(stored ? JSON.parse(stored) : []);
    setShowGallery(true);
  };

  const handleGallerySelect = (photo: string) => {
    setPhotoPreview(photo);
    setShowGallery(false);
    setShowCamera(true); // Reuse the preview modal
  };

  const handlePhotoCapture = (photo: string | null) => {
    if (photo) {
      setPhotoPreview(photo);
    } else {
      // If null is passed (e.g. from X button in PhotoCapture), we close or retake
      // But PhotoCapture X button calls onPhotoCapture(null).
      // If we are in preview mode, we might want to retake (clear preview) or close.
      // Let's assume onPhotoCapture(null) means "Clear preview" or "Close".
      // If we have a preview, we clear it. If not, we close camera.
      if (photoPreview) setPhotoPreview(null);
      else setShowCamera(false);
    }
  };

  const handleUploadAndSend = async () => {
    if (!photoPreview) return;
    if (!socket || !socket.id) {
      alert("Erreur: Vous n'êtes pas connecté au serveur.");
      return;
    }

    setIsUploading(true);
    try {
      const id = socket.id;
      // Upload to API
      const response = await fetch(`${API_IMAGES_URL}/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: id,
          image_data: photoPreview
        })
      });

      if (response.ok) {
        const imageUrl = `${API_IMAGES_URL}/${id}`;
        sendMessage(`[IMAGE] ${imageUrl}`);
        setShowCamera(false);
        setPhotoPreview(null);
      } else {
        console.error("Failed to upload image");
        alert("Erreur lors de l'envoi de l'image");
      }
    } catch (e) {
      console.error("Error uploading image", e);
      alert("Erreur lors de l'envoi de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  const [showUserList, setShowUserList] = useState(false);

  return (
    <div className="fixed inset-0 bg-[var(--background)] flex flex-col md:max-w-5xl md:mx-auto md:relative md:mt-8 md:rounded-2xl md:shadow-2xl md:min-h-[85vh] md:max-h-[85vh] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--primary)] p-4 flex justify-between items-center shadow-md z-10">
        <h2
          className="text-lg sm:text-xl md:text-2xl font-bold truncate flex-1"
          style={{ color: "var(--accent)" }}
        >
          {decodedRoomId.length > 20
            ? `${decodedRoomId.substring(0, 17)}...`
            : decodedRoomId}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="md:hidden px-3 py-2 rounded-lg bg-[var(--primary-dark)] text-[var(--accent)] font-bold shadow hover:bg-[var(--primary-light)] transition"
          >
            👥 {clientList.length}
          </button>
          <button
            onClick={() => router.back()}
            className="px-3 py-2 rounded-lg bg-[var(--primary-dark)] text-[var(--accent)] font-bold shadow hover:bg-[var(--primary-light)] transition"
          >
            ←
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 bg-[var(--background-light)]">
            {messages.length > visibleCount && (
              <button
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="w-full text-center text-sm text-[var(--accent)] py-2 hover:bg-black/5 rounded transition mb-2"
              >
                ↑ Anciens messages
              </button>
            )}
            {messages.slice(Math.max(messages.length - visibleCount, 0)).map((msg, index) => (
              <div
                key={`${msg.dateEmis}-${index}`}
                className={`flex items-end mb-3 ${normalizePseudo(msg.pseudo) === pseudo ? "justify-end" : "justify-start"
                  }`}
              >
                {msg.categorie === "INFO" ? (
                  <div
                    className="w-full text-center text-sm text-[var(--text-muted)] italic my-2"
                  >
                    {formatInfoMessage(msg.content)}
                  </div>
                ) : (
                  <div
                    className={`px-4 py-2 rounded-2xl shadow max-w-[85%] sm:max-w-sm break-words ${normalizePseudo(msg.pseudo) === pseudo
                      ? "bg-[var(--message-sent)] text-[var(--text-on-primary)]"
                      : "bg-[var(--message-received)] text-[var(--foreground)]"
                      }`}
                  >
                    <div className="text-sm font-bold">{normalizePseudo(msg.pseudo)}</div>
                    <MessageContent content={msg.content} />
                    <div className="text-xs text-[var(--text-muted)] text-right mt-1">
                      {new Date(msg.dateEmis).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area - Mobile Optimized */}
          <div className="bg-[var(--primary)] p-3 border-t border-[var(--accent)]/20">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                className="flex-1 p-2 sm:p-3 rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 text-sm sm:text-base"
                placeholder="Message..."
              />
              <button
                onClick={openGallery}
                className="p-2 sm:p-3 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition"
                title="Galerie"
              >
                🖼️
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:p-3 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition"
                title="Importer"
              >
                📎
              </button>
              <button
                onClick={() => setShowCamera(true)}
                className="p-2 sm:p-3 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition"
                title="Photo"
              >
                📷
              </button>
              <button
                onClick={handleSend}
                className="p-2 sm:p-3 rounded-lg bg-[var(--accent)] text-[var(--background)] font-bold shadow-lg hover:opacity-90 transition"
              >
                ➤
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Desktop User List */}
        <div className="hidden md:flex w-64 bg-[var(--background-light)] p-4 flex-col border-l border-[var(--accent)]/20">
          <h3 className="text-lg font-bold mb-3 pb-2 border-b border-[var(--accent)]" style={{ color: "var(--accent)" }}>
            En ligne ({clientList.length})
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {clientList.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] italic">Aucun utilisateur</p>
            ) : (
              clientList.map((clientPseudo, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded-lg ${normalizePseudo(clientPseudo) === pseudo
                    ? "bg-[var(--accent)] bg-opacity-20 font-bold"
                    : "bg-[var(--background)] bg-opacity-50"
                    }`}
                >
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm truncate">{normalizePseudo(clientPseudo)}</span>
                  {normalizePseudo(clientPseudo) === pseudo && (
                    <span className="ml-auto text-xs text-[var(--accent)]">(vous)</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile User List - Bottom Sheet */}
      {showUserList && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowUserList(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-[var(--primary)] rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: "var(--accent)" }}>
                En ligne ({clientList.length})
              </h3>
              <button
                onClick={() => setShowUserList(false)}
                className="text-2xl text-[var(--accent)]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {clientList.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] italic">Aucun utilisateur</p>
              ) : (
                clientList.map((clientPseudo, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-3 rounded-lg ${normalizePseudo(clientPseudo) === pseudo
                      ? "bg-[var(--accent)] bg-opacity-20 font-bold"
                      : "bg-[var(--background-light)]"
                      }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">{normalizePseudo(clientPseudo)}</span>
                    {normalizePseudo(clientPseudo) === pseudo && (
                      <span className="ml-auto text-xs text-[var(--accent)]">(vous)</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-lg flex flex-col items-center">
            <h3 className="text-lg font-bold mb-4 text-black">Prendre une photo</h3>
            <PhotoCapture
              photoPreview={photoPreview}
              onPhotoCapture={handlePhotoCapture}
              maxDimension={800}
              quality={0.8}
              useThumbnail={false}
            />
            {photoPreview && (
              <div className="flex gap-4 mt-4 w-full justify-center">
                <button
                  onClick={() => setPhotoPreview(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                  disabled={isUploading}
                >
                  Reprendre
                </button>
                <button
                  onClick={handleUploadAndSend}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            )}
            {!photoPreview && (
              <button
                onClick={() => setShowCamera(false)}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[var(--background)] rounded-xl p-4 w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold" style={{ color: "var(--accent)" }}>Ma Galerie</h3>
              <button onClick={() => setShowGallery(false)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
              {galleryPhotos.length > 0 ? (
                galleryPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="aspect-square cursor-pointer border-2 border-transparent hover:border-[var(--accent)] rounded-lg overflow-hidden"
                    onClick={() => handleGallerySelect(photo)}
                  >
                    <img src={photo} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-400 py-8">Galerie vide</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function RoomChatPage() {
  const { id } = useParams();
  if (typeof id !== "string") return <div>Chargement...</div>;
  return <Chat roomId={id} />;
}
