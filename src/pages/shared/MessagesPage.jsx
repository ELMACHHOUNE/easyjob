import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const conversations = [
  {
    id: 1,
    name: 'Marie Dupont',
    avatar: 'MD',
    lastMessage: 'Merci pour votre candidature, nous reviendrons vers vous rapidement.',
    time: new Date(Date.now() - 1000 * 60 * 30),
    unread: 2,
    messages: [
      { id: 1, sender: 'them', text: 'Bonjour ! J\'ai vu votre candidature pour le poste de développeur React.', time: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { id: 2, sender: 'me', text: 'Bonjour Marie, merci pour votre retour ! Je suis très intéressé par ce poste.', time: new Date(Date.now() - 1000 * 60 * 60) },
      { id: 3, sender: 'them', text: 'Parfait ! Pouvez-vous me confirmer votre disponibilité pour un entretien la semaine prochaine ?', time: new Date(Date.now() - 1000 * 60 * 45) },
      { id: 4, sender: 'me', text: 'Bien sûr, je suis disponible mardi ou jeudi après-midi.', time: new Date(Date.now() - 1000 * 60 * 40) },
      { id: 5, sender: 'them', text: 'Super, je retiens mardi 14h. Je vous envoie un lien Zoom.', time: new Date(Date.now() - 1000 * 60 * 35) },
      { id: 6, sender: 'them', text: 'Merci pour votre candidature, nous reviendrons vers vous rapidement.', time: new Date(Date.now() - 1000 * 60 * 30) }
    ]
  },
  {
    id: 2,
    name: 'Ahmed Benali',
    avatar: 'AB',
    lastMessage: 'Le poste est toujours ouvert, n\'hésitez pas à postuler.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 3),
    unread: 0,
    messages: [
      { id: 1, sender: 'me', text: 'Bonjour, je souhaiterais avoir plus d\'informations sur le poste de Chef de projet.', time: new Date(Date.now() - 1000 * 60 * 60 * 5) },
      { id: 2, sender: 'them', text: 'Bonjour ! Bien sûr. Le poste est basé à Paris en hybride.', time: new Date(Date.now() - 1000 * 60 * 60 * 4) },
      { id: 3, sender: 'me', text: 'Quelle est la fourchette de salaire proposée ?', time: new Date(Date.now() - 1000 * 60 * 60 * 3.5) },
      { id: 4, sender: 'them', text: 'Le poste est toujours ouvert, n\'hésitez pas à postuler.', time: new Date(Date.now() - 1000 * 60 * 60 * 3) }
    ]
  },
  {
    id: 3,
    name: 'Sophie Martin',
    avatar: 'SM',
    lastMessage: 'Votre profil correspond parfaitement à nos besoins.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unread: 1,
    messages: [
      { id: 1, sender: 'them', text: 'Bonjour ! Je suis recrutrice chez TechCorp.', time: new Date(Date.now() - 1000 * 60 * 60 * 48) },
      { id: 2, sender: 'them', text: 'Votre profil correspond parfaitement à nos besoins.', time: new Date(Date.now() - 1000 * 60 * 60 * 24) }
    ]
  },
  {
    id: 4,
    name: 'Karim Ouadah',
    avatar: 'KO',
    lastMessage: 'On se retrouve vendredi pour le call technique.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 72),
    unread: 0,
    messages: [
      { id: 1, sender: 'me', text: 'Salut Karim, ça te va pour le call technique vendredi ?', time: new Date(Date.now() - 1000 * 60 * 60 * 80) },
      { id: 2, sender: 'them', text: 'On se retrouve vendredi pour le call technique.', time: new Date(Date.now() - 1000 * 60 * 60 * 72) }
    ]
  }
];

const avatarColors = [
  'bg-primary',
  'bg-accent',
  'bg-purple-500',
  'bg-orange-500'
];

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

const messageIn = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 }
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState(conversations[0].id);
  const [inputValue, setInputValue] = useState('');
  const [localConversations, setLocalConversations] = useState(conversations);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const selectedConversation = localConversations.find(c => c.id === selectedId);

  const filteredConversations = localConversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId]);

  const handleSend = () => {
    if (!inputValue.trim() || !selectedId) return;

    setLocalConversations(prev =>
      prev.map(c => {
        if (c.id !== selectedId) return c;
        const newMsg = {
          id: c.messages.length + 1,
          sender: 'me',
          text: inputValue.trim(),
          time: new Date()
        };
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: inputValue.trim(),
          time: new Date()
        };
      })
    );
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 24) {
      return format(date, 'HH:mm', { locale: fr });
    }
    return format(date, 'dd MMM', { locale: fr });
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
      </motion.div>

      <motion.div
        variants={fadeIn}
        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]"
      >
        <div className={`w-full sm:w-80 lg:w-96 border-r border-border flex flex-col ${
          selectedId ? 'hidden sm:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-auto bg-muted pl-10 pr-4 py-2.5 rounded-lg text-foreground"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation, i) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedId(conversation.id)}
                className={`w-full flex items-start gap-3 p-4 text-left transition-colors border-b border-border ${
                  selectedId === conversation.id
                    ? 'bg-accent/10'
                    : 'hover:bg-muted'
                }`}
              >
                <div className={`flex-shrink-0 w-11 h-11 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-sm font-semibold`}>
                  {conversation.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {conversation.name}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatTime(conversation.time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <span className="flex-shrink-0 ml-2 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${!selectedId ? 'hidden sm:flex' : 'flex'}`}>
          {selectedConversation ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedId(null)}
                  className="sm:hidden size-9"
                >
                  <ArrowLeft size={20} className="text-foreground" />
                </Button>
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {selectedConversation.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedConversation.name}</p>
                  <p className="text-xs text-accent">En ligne</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence mode="popLayout">
                  {selectedConversation.messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      variants={messageIn}
                      initial="hidden"
                      animate="visible"
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-xl ${
                        msg.sender === 'me'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${
                          msg.sender === 'me' ? 'text-white/60' : 'text-muted-foreground'
                        }`}>
                          {format(msg.time, 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex items-end gap-2">
                  <Input
                    type="text"
                    placeholder="Écrire un message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 h-auto bg-muted px-4 py-2.5 rounded-lg text-foreground"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    size="icon"
                    className="size-10 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-40"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Send size={24} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Vos messages</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sélectionnez une conversation pour commencer
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}