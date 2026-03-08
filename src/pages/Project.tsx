import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import Markdown from "react-markdown";
import { ArrowUp, Maximize2, Edit3, List, Share, Download, MessageSquare, Search, Plus, Home as HomeIcon, Menu, X, Trash2, Send, Check, Crown, Grip, LayoutGrid, Lock, Globe, Keyboard, Gift, Loader2, Calculator } from "lucide-react";
import { analyzeIdea, chatWithCofounder, generatePitchDeck, generateMarketAnalysis, generateFinancialModel } from "../lib/gemini";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import ReferralModal from "../components/ReferralModal";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { io, Socket } from "socket.io-client";

const DraggableCard = memo(({
  card,
  onDrag,
  onStop,
  onDelete,
  onUpdate,
  onSendToChat,
  onCommentAdded,
  zoom
}: {
  card: any,
  onDrag: (id: string, x: number, y: number) => void,
  onStop: (id: string, x: number, y: number) => void,
  onDelete: (id: string) => void,
  onUpdate: (id: string, title: string, content: string) => void,
  onSendToChat: (content: string) => void,
  onCommentAdded: (cardId: string, comment: any) => void,
  zoom: number
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const isImage = card.content?.startsWith('data:image/');
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editContent, setEditContent] = useState(card.content);
  const [isMaximized, setIsMaximized] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const { token, user } = useAuth();

  const loadComments = async () => {
    if (!token) return;
    const res = await fetch(`/api/cards/${card.id}/comments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
  };

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    const res = await fetch(`/api/cards/${card.id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ content: newComment })
    });

    if (res.ok) {
      const comment = await res.json();
      setComments(prev => [...prev, comment]);
      setNewComment("");
      onCommentAdded(card.id, comment);
    }
  };

  const handleSaveEdit = () => {
    onUpdate(card.id, editTitle, editContent);
    setIsEditing(false);
  };

  const isTask = card.title.toLowerCase().startsWith('tâche') || card.title.toLowerCase().startsWith('task');

  const cardContent = (
    <div className={`bg-white rounded-xl border ${isTask ? 'border-blue-400 shadow-[0_4px_20px_rgba(37,99,235,0.15)]' : 'border-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)]'} p-5 transition-all duration-200 ease-out ${isMaximized ? 'w-[600px] max-w-[95vw] h-[80vh] overflow-y-auto flex flex-col' : 'w-[280px] max-w-[85vw] hover:border-neutral-300'}`} style={{ willChange: 'transform, opacity' }}>
      <div className="flex justify-between items-start mb-3">
        {isEditing ? (
          <input
            title="Edit card title"
            placeholder="Enter card title"
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="font-semibold text-neutral-800 text-sm leading-tight border-b border-neutral-300 outline-none w-full mr-2 no-drag"
            autoFocus
          />
        ) : (
          <h3 className={`font-semibold text-sm leading-tight ${isTask ? 'text-blue-600' : 'text-neutral-800'}`}>{card.title}</h3>
        )}
        <div className="flex gap-2 items-center">
          <div className="drag-handle cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 p-1 -m-1">
            <Grip className="w-3 h-3" />
          </div>
          <Send
            className="w-3 h-3 text-neutral-400 cursor-pointer hover:text-blue-600 transition-colors no-drag"
            onClick={(e) => { e.stopPropagation(); onSendToChat(`Référence à la carte "${card.title}":\n${card.content}`); }}
          />
          <MessageSquare
            className={`w-3 h-3 cursor-pointer transition-colors no-drag ${showComments ? 'text-blue-600' : 'text-neutral-400 hover:text-neutral-600'}`}
            onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
          />
          {user && (
            <>
              {isEditing ? (
                <Check className="w-3 h-3 text-green-500 cursor-pointer hover:text-green-600 no-drag" onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }} />
              ) : (
                <Edit3 className="w-3 h-3 text-neutral-400 cursor-pointer hover:text-neutral-600 no-drag" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} />
              )}
              <Trash2 className="w-3 h-3 text-red-400 cursor-pointer hover:text-red-600 no-drag" onClick={(e) => { e.stopPropagation(); onDelete(card.id); }} />
            </>
          )}
          <Maximize2 className="w-3 h-3 text-neutral-400 cursor-pointer hover:text-neutral-600 no-drag" onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }} />
        </div>
      </div>
      <div className={`text-neutral-500 text-xs leading-relaxed ${isMaximized ? 'flex-1' : ''}`}>
        {isEditing && !isImage ? (
          <textarea
            title="Edit card content"
            placeholder="Enter card content"
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="w-full h-32 border border-neutral-200 rounded p-2 outline-none resize-none no-drag"
          />
        ) : isImage ? (
          <img src={card.content} alt="Card content" className="w-full h-auto rounded-md" draggable={false} />
        ) : card.content?.startsWith('http') ? (
          <a href={card.content} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all no-drag">
            {card.content}
          </a>
        ) : card.content === "Génération en cours..." ? (
          <div className="flex flex-col items-center justify-center py-6 text-neutral-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-sm font-medium animate-pulse">Génération en cours...</span>
          </div>
        ) : (
          <div className="markdown-body prose prose-sm prose-neutral max-w-none">
            <Markdown>{card.content}</Markdown>
          </div>
        )}
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-neutral-100 no-drag cursor-default">
          <div className="max-h-[150px] overflow-y-auto mb-3 space-y-3 pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">Aucun commentaire.</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="bg-neutral-50 p-2 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-semibold text-neutral-700">{c.name || c.email}</span>
                    <span className="text-[9px] text-neutral-400">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-neutral-600">{c.content}</p>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <label htmlFor={`comment-input-${card.id}`} className="sr-only">Commenter</label>
            <input
              id={`comment-input-${card.id}`}
              title="Ajouter un commentaire"
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="flex-1 text-xs border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-blue-600"
            />
            <button
              title="Envoyer le commentaire"
              type="submit"
              disabled={!newComment.trim()}
              className="bg-neutral-800 text-white px-2 py-1.5 rounded-md text-xs disabled:opacity-50"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}
    </div>
  );

  if (isMaximized) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-drag">
        {cardContent}
      </div>
    );
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      key={card.id}
      position={{ x: card.position_x, y: card.position_y }}
      scale={zoom}
      onDrag={(e, data) => onDrag(card.id, data.x, data.y)}
      onStop={(e, data) => onStop(card.id, data.x, data.y)}
      bounds="parent"
      handle=".drag-handle"
      cancel=".no-drag"
    >
      <div ref={nodeRef} className="absolute" id={`card-${card.id}`}>
        {cardContent}
      </div>
    </Draggable>
  );
}, (prevProps, nextProps) => {
  return prevProps.card.id === nextProps.card.id &&
    prevProps.card.position_x === nextProps.card.position_x &&
    prevProps.card.position_y === nextProps.card.position_y &&
    prevProps.card.title === nextProps.card.title &&
    prevProps.card.content === nextProps.card.content &&
    prevProps.zoom === nextProps.zoom;
});

DraggableCard.displayName = 'DraggableCard';

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editProjectName, setEditProjectName] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [collaborators, setCollaborators] = useState(1);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirtyContentIds = useRef<Set<string>>(new Set());
  const dirtyPositionIds = useRef<Set<string>>(new Set());
  const cardsRef = useRef(cards);
  const { token, user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useKeyboardShortcuts([
    { combo: { key: 'n', altKey: true }, handler: () => handleAddCard() },
    {
      combo: { key: 's', ctrlKey: true }, handler: (e) => {
        e.preventDefault();
        setLastSaved(new Date());
        // Visual feedback for save (autosave is already active)
        setTimeout(() => setLastSaved(null), 2000);
      }
    },
    { combo: { key: 'c', altKey: true }, handler: () => setIsChatOpen(prev => !prev) },
    { combo: { key: '/', altKey: true }, handler: () => setShowShortcutsModal(true) },
    {
      combo: { key: 'Escape' }, handler: () => {
        setIsChatOpen(false);
        setShowAddMenu(false);
        setShowExportModal(false);
        setShowShareModal(false);
        setShowShortcutsModal(false);
        setShowReferralModal(false);
      }
    },
  ]);

  useEffect(() => {
    const saveChanges = async () => {
      if (dirtyContentIds.current.size === 0 && dirtyPositionIds.current.size === 0) return;

      setIsAutoSaving(true);

      const contentIds = Array.from(dirtyContentIds.current);
      const positionIds = Array.from(dirtyPositionIds.current);

      dirtyContentIds.current.clear();
      dirtyPositionIds.current.clear();

      try {
        const promises = [];

        // Save content updates
        for (const id of contentIds) {
          const card = cardsRef.current.find(c => c.id === id);
          if (card) {
            promises.push(
              fetch(`/api/cards/${id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title: card.title, content: card.content })
              })
            );
          }
        }

        // Save position updates
        for (const id of positionIds) {
          const card = cardsRef.current.find(c => c.id === id);
          if (card) {
            promises.push(
              fetch(`/api/cards/${id}/position`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ position_x: card.position_x, position_y: card.position_y }),
              })
            );
          }
        }

        await Promise.all(promises);
        setLastSaved(new Date());
        setTimeout(() => setLastSaved(null), 2000);
      } catch (error) {
        console.error("Auto-save failed:", error);
        addToast("Erreur lors de la sauvegarde automatique", "error");
      } finally {
        setIsAutoSaving(false);
      }
    };

    const interval = setInterval(saveChanges, 30000); // 30 seconds

    // Also save on unmount/page hide
    const handleBeforeUnload = () => {
      if (dirtyContentIds.current.size > 0 || dirtyPositionIds.current.size > 0) {
        saveChanges();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveChanges(); // Try to save on unmount
    };
  }, [token, addToast]);

  useEffect(() => {
    if (!id) return;

    // Initialize socket
    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to collaboration server");
      socket.emit("join-project", id);
    });

    socket.on("card-moved", (data) => {
      setCards(prev => prev.map(c => c.id === data.cardId ? { ...c, position_x: data.x, position_y: data.y } : c));
    });

    socket.on("card-updated", (data) => {
      setCards(prev => prev.map(c => c.id === data.cardId ? { ...c, title: data.title, content: data.content } : c));
    });

    socket.on("card-deleted", (data) => {
      setCards(prev => prev.filter(c => c.id !== data.cardId));
    });

    socket.on("card-added", (data) => {
      setCards(prev => {
        if (prev.find(c => c.id === data.card.id)) return prev;
        return [...prev, data.card];
      });
    });

    socket.on("project-updated", (data) => {
      setProject(prev => prev ? { ...prev, name: data.name, mode: data.mode } : prev);
      addToast(`Le projet a été mis à jour`, "info");
    });

    socket.on("comment-added", (data) => {
      const author = data.comment.name || data.comment.email || "Un utilisateur";
      addToast(`Nouveau commentaire de ${author}`, "info");
    });

    socket.on("chat-message-received", (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    socket.on("presence-update", (data) => {
      setCollaborators(data.count);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleExport = async () => {
    try {
      setShowExportModal(false);
      addToast("Préparation de l'export...", "info");

      const zip = new JSZip();
      const mdFolder = zip.folder("markdown");
      const pdfFolder = zip.folder("pdf_text");

      // Single Master PDF for all cards
      const reportDoc = new jsPDF("p", "mm", "a4");
      reportDoc.setFontSize(20);
      reportDoc.text(`Projet: ${project?.name || 'Export'}`, 20, 20);
      let masterYOffset = 35;

      for (let index = 0; index < cards.length; index++) {
        const card = cards[index];
        const safeTitle = card.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || `card_${index}`;

        // Add Markdown
        mdFolder?.file(`${safeTitle}.md`, `# ${card.title}\n\n${card.content}`);

        // Individual Simple Text PDF (fallback or standard)
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(card.title, 10, 20);
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(card.content || "", 180);
        doc.text(splitText, 10, 30);
        const pdfOutput = doc.output("blob");
        pdfFolder?.file(`${safeTitle}.pdf`, pdfOutput);

        // Take snapshot for master PDF report
        const element = document.getElementById(`card-${card.id}`);
        if (element) {
          try {
            // Temporarily remove max-w if it restricts the capture
            const originalMaxW = element.style.maxWidth;
            element.style.maxWidth = "none";
            // @ts-ignore
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
            element.style.maxWidth = originalMaxW;

            const imgData = canvas.toDataURL("image/png");
            
            // A4 is 210 x 297 mm
            const pdfWidth = 210 - 40; // 20mm margin on each side
            const imgProps = reportDoc.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            if (masterYOffset + pdfHeight > 297 - 20) {
              reportDoc.addPage();
              masterYOffset = 20;
            }
            
            reportDoc.addImage(imgData, "PNG", 20, masterYOffset, pdfWidth, pdfHeight);
            masterYOffset += pdfHeight + 15;
          } catch (err) {
            console.warn(`Could not snapshot card ${card.id}:`, err);
          }
        }
      }

      // Add Master Report to Zip
      zip.file(`${project?.name.replace(/[^a-z0-9]/gi, '_') || 'project'}_Visual_Report.pdf`, reportDoc.output("blob"));

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project?.name.replace(/[^a-z0-9]/gi, '_') || 'project'}_export.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast("Exportation réussie !", "success");
    } catch (error) {
      console.error("Export fail", error);
      addToast("Erreur lors de l'exportation", "error");
    }
  };

  useEffect(() => {
    if (project) {
      setEditProjectName(project.name);
    }
  }, [project]);

  const handleCardDelete = useCallback(async (cardId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette carte ?")) return;

    setCards(prev => prev.filter(c => c.id !== cardId));
    socketRef.current?.emit("card-delete", { projectId: id, cardId });

    try {
      await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Failed to delete card:", error);
      // Optionally revert state if needed, but for now we assume success or refresh
    }
  }, [id, token]);

  const handleCardUpdate = useCallback(async (cardId: string, title: string, content: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, title, content } : c));
    socketRef.current?.emit("card-update", { projectId: id, cardId, title, content });
    dirtyContentIds.current.add(cardId);
  }, [id]);

  const handleProjectPrivacyToggle = async () => {
    const newIsPrivate = project.is_private === 1 ? 0 : 1;
    setProject(prev => ({ ...prev, is_private: newIsPrivate }));

    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ is_private: newIsPrivate })
    });
  };

  const handleProjectNameUpdate = async () => {
    if (!editProjectName.trim() || editProjectName === project.name) {
      setIsEditingProjectName(false);
      setEditProjectName(project.name);
      return;
    }

    setProject(prev => ({ ...prev, name: editProjectName }));
    setIsEditingProjectName(false);
    socketRef.current?.emit("project-update", { projectId: id, name: editProjectName, mode: project.mode });

    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name: editProjectName })
    });
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleAutoLayout = () => {
    const cols = Math.ceil(Math.sqrt(cards.length));
    const newCards = cards.map((c, i) => {
      const x = (i % cols) * 320 + 50;
      const y = Math.floor(i / cols) * 320 + 50;
      return { ...c, position_x: x, position_y: y };
    });
    setCards(newCards);
    newCards.forEach(c => {
      fetch(`/api/cards/${c.id}/position`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ position_x: c.position_x, position_y: c.position_y }),
      });
      socketRef.current?.emit("card-move", { projectId: id, cardId: c.id, x: c.position_x, y: c.position_y });
    });
  };

  const handleCommentAdded = useCallback((cardId: string, comment: any) => {
    if (socketRef.current && id) {
      socketRef.current.emit("comment-add", { projectId: id, cardId, comment });
    }
  }, [id]);

  const handleGeneratePitchDeck = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: "Pitch Deck Généré",
          content: "Génération en cours...",
          position_x: 50,
          position_y: 50
        }),
      });
      const cardData = await res.json();
      setCards(prev => [...prev, cardData]);

      // Call Gemini to generate Pitch Deck
      const pitchDeckContent = await generatePitchDeck(cards);
      await handleCardUpdate(cardData.id, "Pitch Deck", pitchDeckContent);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMarketAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: "Analyse de Marché",
          content: "Génération en cours...",
          position_x: 100,
          position_y: 100
        }),
      });
      const cardData = await res.json();
      setCards(prev => [...prev, cardData]);

      // Call Gemini to generate Market Analysis
      const analysisContent = await generateMarketAnalysis(cards);
      await handleCardUpdate(cardData.id, "Analyse de Marché (TAM/SAM/SOM & Concurrents)", analysisContent);

      // Also send a message to chat
      const assistantMsgRes = await fetch(`/api/projects/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role: "assistant", content: "J'ai généré une analyse de marché détaillée incluant la recherche de concurrents et le calcul TAM/SAM/SOM. Vous la trouverez sur le canvas." }),
      });
      const assistantMsgData = await assistantMsgRes.json();
      setMessages(prev => [...prev, assistantMsgData]);
      socketRef.current?.emit("chat-message", { projectId: id, message: assistantMsgData });

    } catch (error) {
      console.error(error);
      addToast("Erreur lors de la génération de l'analyse de marché.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFinancialModel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: "Modèle Financier",
          content: "Génération en cours...",
          position_x: 150,
          position_y: 150
        }),
      });
      const cardData = await res.json();
      setCards(prev => [...prev, cardData]);

      // Call Gemini to generate Financial Model
      const financialContent = await generateFinancialModel(cards);
      await handleCardUpdate(cardData.id, "Modèle Financier (Projections sur 3 ans)", financialContent);

      // Also send a message to chat
      const assistantMsgRes = await fetch(`/api/projects/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role: "assistant", content: "J'ai généré un modèle financier simplifié sur 3 ans basé sur votre canvas. Vous le trouverez sur le canvas." }),
      });
      const assistantMsgData = await assistantMsgRes.json();
      setMessages(prev => [...prev, assistantMsgData]);
      socketRef.current?.emit("chat-message", { projectId: id, message: assistantMsgData });

    } catch (error) {
      console.error(error);
      addToast("Erreur lors de la génération du modèle financier.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  const handleCanvasMouseLeave = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.min(Math.max(0.2, prev + zoomDelta), 3));
    } else {
      setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handleSendToChat = useCallback((content: string) => {
    setInput(prev => prev + (prev ? '\n\n' : '') + content);
    setIsChatOpen(true);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    Promise.all([
      fetch(`/api/projects/${id}`, { headers }).then(res => {
        if (!res.ok) throw new Error("Not found or access denied");
        return res.json();
      }),
      fetch(`/api/projects/${id}/cards`, { headers }).then(res => res.json()),
      fetch(`/api/projects/${id}/messages`, { headers }).then(res => res.json())
    ]).then(([proj, crds, msgsData]) => {
      setProject(proj);
      setCards(crds);
      setMessages(msgsData.messages || msgsData);
      setIsInitialLoad(false);
    }).catch(err => {
      console.error(err);
      navigate('/');
    });
  }, [id, token, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  useEffect(() => {
    if (project && messages.length === 0 && !isInitialLoad && !loading) {
      handleSend(project.description, true);
      setIsChatOpen(true);
    }
  }, [project, messages.length, isInitialLoad]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true') {
      // Small delay to let the UI settle
      setTimeout(() => setShowReferralModal(true), 1500);
    }
  }, []);

  const handleCardDrag = useCallback((cardId: string, x: number, y: number) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, position_x: x, position_y: y } : c));
    socketRef.current?.emit("card-move", { projectId: id, cardId, x, y });
  }, [id]);

  const handleCardStop = useCallback(async (cardId: string, x: number, y: number) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, position_x: x, position_y: y } : c));
    socketRef.current?.emit("card-move", { projectId: id, cardId, x, y });
    dirtyPositionIds.current.add(cardId);
  }, [id]);

  const handleAddCard = async () => {
    const cardRes = await fetch(`/api/projects/${id}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        title: "Nouvelle carte",
        content: "Ceci est une nouvelle carte.",
        position_x: Math.random() * 200 + 50,
        position_y: Math.random() * 200 + 50
      }),
    });
    const cardData = await cardRes.json();
    setCards(prev => [...prev, cardData]);
    socketRef.current?.emit("card-add", { projectId: id, card: cardData });
  };

  const handleSend = async (overrideInput?: string, isInitial = false) => {
    const userMsg = overrideInput || input;
    const userImg = image;
    if ((!userMsg.trim() && !userImg) || loading) return;

    if (!overrideInput) setInput("");
    setImage(null);
    setLoading(true);

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    // Add user message
    const userMsgRes = await fetch(`/api/projects/${id}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({ role: "user", content: userMsg, image: userImg }),
    });
    const userMsgData = await userMsgRes.json();
    setMessages(prev => [...prev, userMsgData]);
    socketRef.current?.emit("chat-message", { projectId: id, message: userMsgData });

    // Check if it's a research request
    if (!isInitial && (userMsg.toLowerCase().includes("recherche") || userMsg.toLowerCase().includes("analyse"))) {
      const analysis = await analyzeIdea(userMsg);

      const assistantMsgRes = await fetch(`/api/projects/${id}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({ role: "assistant", content: analysis.summary + "\n\nVerdict: " + analysis.verdict }),
      });
      const assistantMsgData = await assistantMsgRes.json();
      setMessages(prev => [...prev, assistantMsgData]);
      socketRef.current?.emit("chat-message", { projectId: id, message: assistantMsgData });

      // Create cards
      for (const card of analysis.cards) {
        const cardRes = await fetch(`/api/projects/${id}/cards`, {
          method: "POST",
          headers,
          body: JSON.stringify({ title: card.title, content: card.content, position_x: Math.random() * 200 + 50, position_y: Math.random() * 200 + 50 }),
        });
        const cardData = await cardRes.json();
        setCards(prev => [...prev, cardData]);
        socketRef.current?.emit("card-add", { projectId: id, card: cardData });
      }
    } else {
      // Normal chat
      const chatMessages = [...messages, userMsgData].map(m => ({ role: m.role, content: m.content, image: m.image }));
      const stream = await chatWithCofounder(chatMessages, { ...project, cards });

      let fullContent = "";
      // Add a temporary message
      setMessages(prev => [...prev, { id: 'temp', role: 'assistant', content: '' }]);

      for await (const chunk of stream) {
        fullContent += chunk.text;
        let displayContent = fullContent.replace(/\[CREATE_CARD:\s*(\{.*?\})\s*\]/g, '');
        displayContent = displayContent.replace(/\[DELETE_CARD_SUGGESTION:\s*(\{.*?\})\s*\]/g, '');
        setMessages(prev => prev.map(m => m.id === 'temp' ? { ...m, content: displayContent } : m));
      }

      // Parse cards
      const cardRegex = /\[CREATE_CARD:\s*(\{.*?\})\s*\]/g;
      let match;
      const newCards = [];
      while ((match = cardRegex.exec(fullContent)) !== null) {
        try {
          const cardData = JSON.parse(match[1]);
          newCards.push(cardData);
        } catch (e) {
          console.error("Failed to parse card data", e);
        }
      }

      // Parse delete suggestions
      const deleteRegex = /\[DELETE_CARD_SUGGESTION:\s*(\{.*?\})\s*\]/g;
      let deleteMatch;
      const deleteSuggestions = [];
      while ((deleteMatch = deleteRegex.exec(fullContent)) !== null) {
        try {
          const suggestionData = JSON.parse(deleteMatch[1]);
          deleteSuggestions.push(suggestionData);
        } catch (e) {
          console.error("Failed to parse delete suggestion", e);
        }
      }

      // Create cards via API
      let currentX = 100;
      let currentY = 100;
      for (const card of newCards) {
        const cardRes = await fetch(`/api/projects/${id}/cards`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: card.title,
            content: card.content,
            position_x: currentX,
            position_y: currentY
          }),
        });
        const cardData = await cardRes.json();
        setCards(prev => [...prev, cardData]);
        socketRef.current?.emit("card-add", { projectId: id, card: cardData });
        currentX += 300; // Offset next card
        if (currentX > 900) {
          currentX = 100;
          currentY += 200;
        }
      }

      let displayContent = fullContent.replace(/\[CREATE_CARD:\s*(\{.*?\})\s*\]/g, '').trim();
      displayContent = displayContent.replace(/\[DELETE_CARD_SUGGESTION:\s*(\{.*?\})\s*\]/g, '').trim();

      // Save to DB
      const assistantMsgRes = await fetch(`/api/projects/${id}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({ role: "assistant", content: displayContent }),
      });
      const assistantMsgData = await assistantMsgRes.json();

      // Add delete suggestions to message object locally for rendering
      if (deleteSuggestions.length > 0) {
        assistantMsgData.deleteSuggestions = deleteSuggestions;
      }

      setMessages(prev => prev.map(m => m.id === 'temp' ? assistantMsgData : m));
      socketRef.current?.emit("chat-message", { projectId: id, message: assistantMsgData });
    }

    setLoading(false);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const cardRes = await fetch(`/api/projects/${id}/cards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            title: "Image",
            content: reader.result as string,
            position_x: Math.max(0, x - 140), // Center roughly
            position_y: Math.max(0, y - 100)
          }),
        });
        const cardData = await cardRes.json();
        setCards(prev => [...prev, cardData]);
        socketRef.current?.emit("card-add", { projectId: id, card: cardData });
      };
      reader.readAsDataURL(file);
    } else {
      const text = e.dataTransfer.getData('text');
      if (text) {
        const cardRes = await fetch(`/api/projects/${id}/cards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            title: text.startsWith('http') ? "Lien" : "Note",
            content: text,
            position_x: Math.max(0, x - 140),
            position_y: Math.max(0, y - 100)
          }),
        });
        const cardData = await cardRes.json();
        setCards(prev => [...prev, cardData]);
        socketRef.current?.emit("card-add", { projectId: id, card: cardData });
      }
    }
  };

  const handleChatDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setIsChatOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      const text = e.dataTransfer.getData('text');
      if (text) {
        setInput(prev => prev + (prev ? ' ' : '') + text);
        setIsChatOpen(true);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!project) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Chargement...</div>;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} title="Retour à l'accueil" className="p-2 -ml-2 text-neutral-500">
            <HomeIcon className="w-5 h-5" />
          </button>
          <span className="font-semibold text-neutral-800 truncate max-w-[150px]">{project.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsChatOpen(!isChatOpen)} title="Ouvrir le chat" className="p-2 bg-neutral-100 rounded-lg text-neutral-600">
            {isChatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} title="Menu" className="p-2 bg-neutral-100 rounded-lg text-neutral-600">
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-white border-b border-neutral-200 p-4 z-40 shadow-lg flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Mode: {project.mode === 'create' ? '🌱 Créer' : project.mode === 'scale' ? '🚀 Scaler' : '🔍 Analyser'}</span>
            {collaborators > 1 && (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                {collaborators} collaborateurs
              </div>
            )}
          </div>

          <div className="h-px bg-neutral-100 my-1" />

          {user && (
            <button onClick={() => { handleAutoLayout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-sm font-medium text-neutral-600 p-2 hover:bg-neutral-50 rounded-lg">
              <LayoutGrid className="w-4 h-4" />
              Trier les cartes
            </button>
          )}

          {user && (
            <button onClick={() => { handleGenerateMarketAnalysis(); setIsMobileMenuOpen(false); }} disabled={loading} className="flex items-center gap-3 text-sm font-medium text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg disabled:opacity-50 w-full text-left">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Analyse..." : "Analyse de Marché"}
            </button>
          )}

          {user && (
            <button onClick={() => { handleGeneratePitchDeck(); setIsMobileMenuOpen(false); }} disabled={loading} className="flex items-center gap-3 text-sm font-medium text-amber-600 p-2 hover:bg-amber-50 rounded-lg disabled:opacity-50 w-full text-left">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
              {loading ? "Génération..." : "Générer Pitch Deck"}
            </button>
          )}

          {user && (
            <button onClick={() => { handleGenerateFinancialModel(); setIsMobileMenuOpen(false); }} disabled={loading} className="flex items-center gap-3 text-sm font-medium text-emerald-600 p-2 hover:bg-emerald-50 rounded-lg disabled:opacity-50 w-full text-left">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              {loading ? "Génération..." : "Modèle Financier"}
            </button>
          )}

          {project.user_id === user?.id && (
            <button
              onClick={() => { setShowReferralModal(true); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-3 text-sm font-medium text-blue-600 p-2 hover:bg-blue-50 rounded-lg"
            >
              <Gift className="w-4 h-4" />
              Offre Agence
            </button>
          )}

          <button onClick={() => { setShowExportModal(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-sm font-medium text-neutral-600 p-2 hover:bg-neutral-50 rounded-lg">
            <Download className="w-4 h-4" />
            Exporter
          </button>

          {project.user_id === user?.id && (
            <button onClick={() => { handleShare(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-sm font-medium text-neutral-600 p-2 hover:bg-neutral-50 rounded-lg">
              <Share className="w-4 h-4" />
              Partager
            </button>
          )}
        </div>
      )}

      {/* Left Sidebar - Chat */}
      <div
        className={`
          absolute md:static inset-y-0 left-0 z-40 w-full md:w-[320px] bg-slate-50 border-r border-neutral-200 flex flex-col shadow-sm transition-transform duration-300 ease-in-out
          ${isChatOpen ? 'translate-x-0 pt-14 md:pt-0' : '-translate-x-full md:translate-x-0'}
        `}
        onDrop={handleChatDrop}
        onDragOver={handleDragOver}
      >
        <div className="hidden md:flex p-3 border-b border-neutral-200 justify-between items-center bg-slate-50">
          <div className="flex gap-4 text-neutral-600">
            <button onClick={() => navigate('/')} className="hover:text-neutral-900 transition-colors" title="Menu">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={async () => {
              if (confirm("Voulez-vous vraiment effacer cette conversation ? Le canvas sera conservé.")) {
                await fetch(`/api/projects/${id}/messages`, { method: "DELETE", headers: { 'Authorization': `Bearer ${token}` } });
                setMessages([]);
              }
            }} className="hover:text-neutral-900 transition-colors" title="Nouveau Chat">
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-4 text-neutral-600">
            <button onClick={toggleFullScreen} className="hover:text-neutral-900 transition-colors" title="Plein écran">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button onClick={() => setIsChatOpen(false)} className="hover:text-neutral-900 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 custom-scrollbar">
          {messages.map((m) => (
            <div key={m.id} className="flex flex-col gap-2">
              {m.role === 'assistant' ? (
                <div className="text-[15px] text-neutral-800 leading-relaxed">
                  <div className="markdown-body prose prose-neutral max-w-none">
                    <Markdown>{m.content}</Markdown>
                  </div>
                  {m.image && (
                    <img src={m.image} alt="Uploaded" className="mt-2 max-w-full rounded-lg border border-neutral-200" />
                  )}
                  {m.deleteSuggestions && m.deleteSuggestions.map((sugg: any, i: number) => (
                    <div key={i} className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs text-red-800 font-medium mb-1">💡 Suggestion de suppression</p>
                      <p className="text-xs text-red-600 mb-2">{sugg.reason}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleCardDelete(sugg.id);
                            // Remove suggestion from UI
                            setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, deleteSuggestions: msg.deleteSuggestions.filter((_: any, idx: number) => idx !== i) } : msg));
                          }}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => {
                            setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, deleteSuggestions: msg.deleteSuggestions.filter((_: any, idx: number) => idx !== i) } : msg));
                          }}
                          className="text-xs bg-white text-neutral-600 border border-neutral-200 px-2 py-1 rounded hover:bg-neutral-50"
                        >
                          Ignorer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-start w-full">
                  <div className="bg-white border border-neutral-200 rounded-2xl p-4 text-[15px] text-neutral-700 relative w-full shadow-sm">
                    <div className="pr-10 leading-relaxed">
                      {m.content}
                    </div>
                    <div className="absolute top-4 right-4 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-neutral-200">
                      <img src="/logo.png" alt="Avatar" className="w-5 h-5 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }} />
                      <div className="hidden w-full h-full items-center justify-center text-[10px] font-bold text-blue-600 bg-white">US</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 text-[13px] text-neutral-500 self-start ml-2">
                    <div className="flex -space-x-1">
                      <div className="border border-neutral-300 bg-white rounded px-1 py-0.5 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                      </div>
                      <div className="border border-neutral-300 bg-white rounded px-1 py-0.5 z-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                      </div>
                    </div>
                    <span className="ml-1">2 actions</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && !messages.some(m => m.id === 'temp') && (
            <div className="flex flex-col gap-2">
              <div className="text-[15px] text-neutral-800 leading-relaxed flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                <span className="text-neutral-500 italic">L'IA réfléchit...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 pb-4 pt-2 bg-slate-50 flex flex-col relative">
          {user ? (
            <>
              {image && (
                <div className="mb-2 relative inline-block">
                  <img src={image} alt="Preview" className="h-16 rounded-md border border-neutral-200" />
                  <button
                    onClick={() => setImage(null)}
                    title="Supprimer l'image"
                    className="absolute -top-2 -right-2 bg-neutral-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="border border-neutral-200 rounded-xl bg-slate-50 px-4 py-3 pb-8 -mb-5 flex justify-between items-start">
                <span className="text-sm text-neutral-600">{user?.credits ?? 0} credits remaining</span>
                <button className="bg-[#4a4a4a] text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-[#3a3a3a] transition-colors">Add credits</button>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 flex items-center p-1.5 relative z-10 shadow-sm">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Ajouter une image"
                  className="p-2 text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                </button>
                <label htmlFor="file-upload" className="sr-only">Upload image</label>
                <input
                  id="file-upload"
                  type="file"
                  title="Upload image"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <label htmlFor="message-input" className="sr-only">Reply...</label>
                <input
                  id="message-input"
                  title="Your message"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Reply..."
                  className="flex-1 outline-none text-[15px] px-2 text-neutral-700 placeholder:text-neutral-400 bg-transparent"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || (!input.trim() && !image)}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-sm text-neutral-500 py-2">
              Connectez-vous pour participer à la discussion.
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative pt-14 md:pt-0">
        <ReferralModal isOpen={showReferralModal} onClose={() => setShowReferralModal(false)} />

        {/* Top Bar */}
        <div className="hidden md:flex h-14 bg-white border-b border-neutral-200 items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 transition-colors mr-2"
              title="Retour à l'accueil"
            >
              <HomeIcon className="w-5 h-5" />
            </button>
            {isEditingProjectName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editProjectName}
                  onChange={e => setEditProjectName(e.target.value)}
                  className="font-semibold text-neutral-800 border-b border-neutral-300 outline-none"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleProjectNameUpdate(); }}
                />
                <Check className="w-4 h-4 text-green-500 cursor-pointer" onClick={handleProjectNameUpdate} />
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer">
                <span className="font-semibold text-neutral-800 flex items-center gap-2" onClick={() => project.user_id === user?.id && setIsEditingProjectName(true)}>
                  {project.name}
                </span>
                {project.user_id === user?.id && (
                  <>
                    <button
                      onClick={handleProjectPrivacyToggle}
                      className="p-1 hover:bg-neutral-100 rounded-md transition-colors"
                      title={project.is_private === 1 ? "Rendre public" : "Rendre privé"}
                    >
                      {project.is_private === 1 ? (
                        <Lock className="w-3 h-3 text-neutral-400 hover:text-neutral-600" />
                      ) : (
                        <Globe className="w-3 h-3 text-neutral-400 hover:text-neutral-600" />
                      )}
                    </button>
                    <Edit3 className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditingProjectName(true)} />
                  </>
                )}
              </div>
            )}
            <span className="text-xs text-neutral-400 border border-neutral-200 px-2 py-1 rounded-md">
              {project.mode === 'create' ? '🌱 Créer' : project.mode === 'scale' ? '🚀 Scaler' : '🔍 Analyser'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {collaborators > 1 && (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                {collaborators} collaborateurs
              </div>
            )}
            {user && (
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            {user && (
              <button onClick={handleAutoLayout} className="flex items-center gap-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 px-3 py-1.5 rounded-md hover:bg-neutral-50 transition-colors">
                <LayoutGrid className="w-4 h-4" />
                Trier
              </button>
            )}
            {user && (
              <button onClick={handleGenerateMarketAnalysis} disabled={loading} className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? "Analyse..." : "Analyse de Marché"}
              </button>
            )}
            {user && (
              <button onClick={handleGeneratePitchDeck} disabled={loading} className="flex items-center gap-2 text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md hover:bg-amber-100 transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                {loading ? "Génération..." : "Générer Pitch Deck"}
              </button>
            )}
            {user && (
              <button onClick={handleGenerateFinancialModel} disabled={loading} className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                {loading ? "Génération..." : "Modèle Financier"}
              </button>
            )}
            {project.user_id === user?.id && (
              <button
                onClick={() => setShowReferralModal(true)}
                className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Gift className="w-3 h-3" />
                <span className="hidden sm:inline">Offre Agence</span>
              </button>
            )}
            <button onClick={() => setShowExportModal(true)} className="text-sm font-medium text-neutral-600 border border-neutral-200 px-3 py-1.5 rounded-md hover:bg-neutral-50">
              Exporter
            </button>
            {project.user_id === user?.id && (
              <button onClick={handleShare} className="text-sm font-medium text-white bg-neutral-800 px-3 py-1.5 rounded-md hover:bg-neutral-700">
                Partager
              </button>
            )}
            {isAutoSaving ? (
              <span className="text-xs text-neutral-400 font-medium flex items-center gap-1 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Sauvegarde...
              </span>
            ) : lastSaved ? (
              <span className="text-xs text-green-600 font-medium animate-fade-in">
                Sauvegardé
              </span>
            ) : null}
          </div>
        </div>

        {/* Canvas */}
        <div
          className={`flex-1 relative overflow-hidden bg-white ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
          onDrop={handleCanvasDrop}
          onDragOver={handleDragOver}
          onWheel={handleWheel}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseLeave}
        >
          <div className={`transition-transform duration-150 ease-out w-[10000px] h-[10000px] origin-top-left ${isPanning ? 'transition-none' : ''}`}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {cards.map(card => (
              <DraggableCard
                key={card.id}
                card={card}
                onDrag={handleCardDrag}
                onStop={handleCardStop}
                onDelete={handleCardDelete}
                onUpdate={handleCardUpdate}
                onSendToChat={handleSendToChat}
                onCommentAdded={handleCommentAdded}
                zoom={zoom}
              />
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full border border-neutral-200 shadow-lg px-2 md:px-4 py-2 flex items-center gap-2 md:gap-4 z-10">
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500" title="Messages"><MessageSquare className="w-4 h-4" /></button>
          <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500" title="Recentrer la vue"><Maximize2 className="w-4 h-4" /></button>

          {user && (
            <div className="relative">
              <button onClick={() => setShowAddMenu(!showAddMenu)} title="Ajouter" className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500"><Plus className="w-4 h-4" /></button>
              {showAddMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 w-48 z-50">
                  <button onClick={() => { handleAddCard(); setShowAddMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Nouvelle note</button>
                  <button onClick={() => {
                    const url = prompt("Entrez l'URL du lien :");
                    if (url) {
                      fetch(`/api/projects/${id}/cards`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ title: "Lien", content: url, position_x: 100, position_y: 100 })
                      }).then(res => res.json()).then(data => setCards(prev => [...prev, data]));
                    }
                    setShowAddMenu(false);
                  }} className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Ajouter un lien</button>
                </div>
              )}
            </div>
          )}

          <div className="w-px h-4 bg-neutral-200"></div>
          <button onClick={() => setShowShortcutsModal(true)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500" title="Raccourcis clavier (Alt + /)">
            <Keyboard className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} className="hover:text-neutral-800">-</button>
            <span className="hidden md:inline w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} className="hover:text-neutral-800">+</button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-neutral-800 mb-4">Partager le projet</h2>
            <p className="text-neutral-600 mb-6 text-sm">
              Partagez ce lien avec votre équipe pour qu'ils puissent consulter et collaborer sur ce projet.
            </p>

            {project.user_id === user?.id && (
              <div className="mb-6">
                <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={project.is_private === 0}
                    onChange={handleProjectPrivacyToggle}
                    className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-600"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-neutral-800 text-sm">Lien public</span>
                    <span className="text-xs text-neutral-500">Toute personne disposant du lien peut voir le projet</span>
                  </div>
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600 outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  addToast("Lien copié !", "success");
                }}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm"
              >
                Copier
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="mt-6 w-full py-2.5 text-neutral-600 font-medium hover:bg-neutral-100 rounded-xl transition-colors text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5" /> Raccourcis Clavier
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Nouvelle carte</span>
                <kbd className="bg-neutral-100 px-2 py-1 rounded border border-neutral-200 font-mono text-xs">Alt + N</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Sauvegarder</span>
                <kbd className="bg-neutral-100 px-2 py-1 rounded border border-neutral-200 font-mono text-xs">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Ouvrir/Fermer le chat</span>
                <kbd className="bg-neutral-100 px-2 py-1 rounded border border-neutral-200 font-mono text-xs">Alt + C</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Fermer les fenêtres</span>
                <kbd className="bg-neutral-100 px-2 py-1 rounded border border-neutral-200 font-mono text-xs">Esc</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Voir les raccourcis</span>
                <kbd className="bg-neutral-100 px-2 py-1 rounded border border-neutral-200 font-mono text-xs">Alt + /</kbd>
              </div>
              <div className="border-t border-neutral-100 my-2 pt-2">
                <p className="text-xs font-semibold text-neutral-500 mb-2">Navigation Globale</p>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">Accueil</span>
                  <kbd className="bg-neutral-100 px-2 py-1 rounded border border-neutral-200 font-mono text-xs">Alt + H</kbd>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">Projets</span>
                  <kbd className="bg-neutral-100 px-2 py-1 rounded border border-neutral-200 font-mono text-xs">Alt + P</kbd>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">Docs</span>
                  <kbd className="bg-neutral-100 px-2 py-1 rounded border border-neutral-200 font-mono text-xs">Alt + D</kbd>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Paramètres</span>
                  <kbd className="bg-neutral-100 px-2 py-1 rounded border border-neutral-200 font-mono text-xs">Alt + S</kbd>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowShortcutsModal(false)}
              className="mt-6 w-full py-2.5 bg-neutral-800 text-white font-medium hover:bg-neutral-700 rounded-xl transition-colors text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-neutral-800 mb-4">Prêt à passer à l'action ?</h2>
            <p className="text-neutral-600 mb-6 leading-relaxed">
              Si vous souhaitez appliquer le plan d'action fourni par cette IA, contactez notre agence <strong>Uprising Studio</strong> pour qu'on le mette en place pour vous.
              <br /><br />
              <strong>Première consultation 100% gratuite !</strong>
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:contact@uprising-studio.com?subject=Consultation%20gratuite%20-%20Plan%20d'action"
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-center hover:bg-blue-700 transition-colors"
                onClick={() => setShowExportModal(false)}
              >
                Contacter l'agence
              </a>
              <button
                onClick={handleExport}
                className="w-full bg-neutral-100 text-neutral-700 font-medium py-3 rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Continuer l'exportation (.zip)
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full text-neutral-500 text-sm py-2 hover:text-neutral-700"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
