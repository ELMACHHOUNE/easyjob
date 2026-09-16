import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  MapPin,
  Plus,
  Trash2,
  Save,
  GraduationCap,
  Briefcase,
  Globe,
  Link as LinkIcon,
  Camera,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Upload,
  BriefcaseBusiness,
  Target,
  Building2,
  Mail,
  ExternalLink,
  Eye,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  MessageSquareQuote,
} from "lucide-react";
import { toast } from "sonner";
import { useProfile, useUpdateProfile, useUploadCV, useCV, useDeleteCV, useAnalyzeCV } from "@/api/hooks";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const cities = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Fès",
  "Meknès", "Agadir", "Oujda", "Kénitra", "Remote",
];

const languageLevels = ["Débutant", "Intermédiaire", "Avancé", "Natif"];

const allDomains = [
  "Technologie / IT", "Finance / Banque", "Marketing / Communication",
  "Ressources Humaines", "Ingénierie", "Santé", "Éducation",
  "Commerce / Vente", "Design / Créatif", "Logistique / Transport",
  "Juridique", "Agriculture", "BTP / Construction", "Tourisme / Hôtellerie",
  "Média / Audiovisuel", "Environnement", "Recherche / Science",
];

const allJobTypes = ["CDI", "CDD", "Stage", "Freelance", "Temps partiel"];

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function Section({ title, icon: Icon, children, onRemove, removable, badge }) {
  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="bg-card rounded-xl p-6 shadow-sm border border-border"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary/10 text-primary">
                {badge}
              </span>
            )}
          </div>
        </div>
        {removable && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function FormInput({ label, error, icon: Icon, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm font-medium text-foreground">
          {label}
        </Label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <Input
          {...props}
          className={cn(
            Icon ? "pl-10" : "",
            error && "border-destructive/40 focus-visible:ring-destructive/20"
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}

function FormSelect({ label, error, options, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm font-medium text-foreground">
          {label}
        </Label>
      )}
      <div className="relative">
        <select
          {...props}
          className={`w-full h-10 px-4 pr-10 rounded-lg border border-border bg-background text-foreground text-sm appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 ${
            error ? "border-destructive/40" : ""
          }`}
        >
          <option value="">Sélectionner...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}

function TagInput({ tags, onAdd, onRemove, placeholder }) {
  const [value, setValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onAdd(trimmed);
        setValue("");
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
            >
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemove(tag)}
                className="size-5 p-0 [&_svg]:size-3 text-primary hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </Button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
}

function ChipSelect({ options, selected, onToggle, columns = 3 }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-${columns} gap-2`}>
      {options.map((opt) => (
        <Button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          variant={selected.includes(opt) ? "default" : "outline"}
          className="justify-start text-left text-sm font-medium"
        >
          {opt}
        </Button>
      ))}
    </div>
  );
}

function SkeletonBlock({ className }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <SkeletonBlock className="h-9 w-48" />
          <SkeletonBlock className="h-5 w-72" />
        </div>
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col sm:flex-row items-center gap-6">
            <SkeletonBlock className="w-24 h-24 rounded-full shrink-0" />
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-36" />
              <SkeletonBlock className="h-4 w-52" />
              <SkeletonBlock className="h-9 w-36 rounded-lg" />
            </div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-sm border border-border space-y-4">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="w-10 h-10 rounded-lg" />
                <SkeletonBlock className="h-6 w-44" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SkeletonBlock className="h-11 w-full" />
                <SkeletonBlock className="h-11 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildFormValues(profile, user) {
  return {
    firstName: user?.firstName || profile?.firstName || "",
    lastName: user?.lastName || profile?.lastName || "",
    email: user?.email || profile?.email || "",
    phone: user?.phone || profile?.phone || "",
    city: profile?.location?.city || profile?.city || "",
    title: profile?.title || "",
    presentation: profile?.presentation || "",
    domains: profile?.domains || [],
    searchKeywords: profile?.searchKeywords || [],
    jobTypes: profile?.jobTypes || [],
    preferredLocations: profile?.preferredLocations || [],
    education:
      profile?.education?.length > 0
        ? profile.education.map((e) => ({
            institution: e.institution || "",
            degree: e.degree || "",
            field: e.field || "",
            startDate: e.startDate ? String(e.startDate).slice(0, 10) : "",
            endDate: e.endDate ? String(e.endDate).slice(0, 10) : "",
            description: e.description || "",
          }))
        : [],
    experience:
      profile?.experience?.length > 0
        ? profile.experience.map((e) => ({
            company: e.company || "",
            position: e.position || "",
            startDate: e.startDate ? String(e.startDate).slice(0, 10) : "",
            endDate: e.endDate ? String(e.endDate).slice(0, 10) : "",
            isCurrent: e.isCurrent || false,
            description: e.description || "",
            skills: Array.isArray(e.skills) ? e.skills : [],
          }))
        : [],
    skills: profile?.skills || [],
    languages:
      profile?.languages?.length > 0
        ? profile.languages.map((l) => ({
            language: l.language || "",
            level: l.level || "",
          }))
        : [],
    socialLinks: {
      linkedin: profile?.socialLinks?.linkedin || "",
      github: profile?.socialLinks?.github || "",
      portfolio: profile?.socialLinks?.portfolio || "",
      website: profile?.socialLinks?.website || "",
    },
  };
}

export default function ProfilePage() {
  const { data: profileData, isLoading, isError, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadCV = useUploadCV();
  const { data: cvData } = useCV();
  const deleteCV = useDeleteCV();
  const analyzeCV = useAnalyzeCV();
  const { user } = useAuth();

  const profile = profileData?.profile;
  const hasCV = profileData?.hasCV || false;
  const mergedUser = profileData?.user || user;

  const [showCVPreview, setShowCVPreview] = useState(false);
  const [cvDeleteOpen, setCvDeleteOpen] = useState(false);
  const [cvAnalysisExpanded, setCvAnalysisExpanded] = useState(true);
  const [cvEditing, setCvEditing] = useState(false);
  const [cvEditData, setCvEditData] = useState({});

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "",
      title: "",
      presentation: "",
      domains: [],
      searchKeywords: [],
      jobTypes: [],
      preferredLocations: [],
      education: [],
      experience: [],
      skills: [],
      languages: [],
      socialLinks: { linkedin: "", github: "", portfolio: "", website: "" },
    },
  });

  useEffect(() => {
    if (profile || mergedUser) {
      reset(buildFormValues(profile, mergedUser));
    }
  }, [profile, mergedUser, reset]);

  useEffect(() => {
    if (cvData?.cv?.parsedData) {
      setCvEditData(cvData.cv.parsedData);
    }
  }, [cvData]);

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control, name: "education" });

  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control, name: "experience" });

  const skills = watch("skills") || [];
  const languages = watch("languages") || [];
  const domains = watch("domains") || [];
  const searchKeywords = watch("searchKeywords") || [];
  const jobTypes = watch("jobTypes") || [];
  const preferredLocations = watch("preferredLocations") || [];

  const onSubmit = async (data) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        title: data.title,
        city: data.city,
        presentation: data.presentation,
        domains: data.domains,
        searchKeywords: data.searchKeywords,
        jobTypes: data.jobTypes,
        preferredLocations: data.preferredLocations,
        skills: data.skills,
        languages: data.languages,
        socialLinks: data.socialLinks,
        education: data.education.map((e) => ({
          ...e,
          startDate: e.startDate || undefined,
          endDate: e.endDate || undefined,
        })),
        experience: data.experience.map((e) => ({
          ...e,
          startDate: e.startDate || undefined,
          endDate: e.endDate || undefined,
        })),
      };
      await updateProfile.mutateAsync(payload);
      toast.success("Profil mis à jour avec succès !");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur lors de la mise à jour du profil");
    }
  };

  const handleCVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast.error("Veuillez sélectionner un fichier PDF.");
      return;
    }
    const formData = new FormData();
    formData.append("cv", file);
    toast.loading("Upload et analyse du CV...", { id: "cv-upload" });
    uploadCV.mutate(formData, {
      onSuccess: () => {
        toast.success("CV uploadé et analysé avec succès !", { id: "cv-upload" });
      },
      onError: (err) => {
        toast.error(err?.message || "Erreur lors de l'upload", { id: "cv-upload" });
      },
    });
  };

  const handleCVDelete = () => {
    if (!cvData?.cv?._id) return;
    setCvDeleteOpen(false);
    toast.loading("Suppression du CV...", { id: "cv-delete" });
    deleteCV.mutate(cvData.cv._id, {
      onSuccess: () => {
        toast.success("CV supprimé.", { id: "cv-delete" });
        setCvEditData({});
        setCvEditing(false);
      },
      onError: () => toast.error("Erreur lors de la suppression", { id: "cv-delete" }),
    });
  };

  const handleCVAnalyze = () => {
    if (!cvData?.cv?._id) return;
    toast.loading("Analyse en cours...", { id: "cv-analyze" });
    analyzeCV.mutate(cvData.cv._id, {
      onSuccess: () => {
        toast.success("CV analysé avec succès !", { id: "cv-analyze" });
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error || "Erreur lors de l'analyse", { id: "cv-analyze" });
      },
    });
  };

  const handleCVEditSave = async () => {
    try {
      const cv = cvData?.cv;
      if (!cv?._id) return;
      await api.put(`/profile/cv/${cv._id}`, { parsedData: cvEditData });
      toast.success("CV mis à jour !");
      setCvEditing(false);
    } catch {
      toast.error("Erreur lors de la mise à jour du CV");
    }
  };

  const analysis = cvData?.cv?.analysis;

  if (isLoading) return <ProfileSkeleton />;

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-medium">
            {error?.response?.data?.error || "Erreur lors du chargement du profil"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="text-sm font-medium"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground">
            Mon Profil
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos informations personnelles et professionnelles
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar + Basic Info Card */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col sm:flex-row items-center gap-6"
          >
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {mergedUser?.avatar ? (
                  <img src={mergedUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-foreground">
                {mergedUser?.firstName} {mergedUser?.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {mergedUser?.email}
              </p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                {hasCV && (
                  <Link
                    to="/profile/cv"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 rounded-full hover:bg-accent/20 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    CV ajouté
                  </Link>
                )}
                {mergedUser?.onboardingCompleted && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full">
                    <Target className="w-3.5 h-3.5" />
                    Profil configuré
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* CV Section */}
          <Section title="Mon CV" icon={FileText} badge={hasCV ? "Ajouté" : "Optionnel"}>
            {hasCV ? (
              <div className="space-y-4">
                {/* CV Info + Actions Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{cvData?.cv?.originalName || "CV.pdf"}</p>
                      <p className="text-xs text-muted-foreground">
                        {cvData?.cv?.fileSize ? `${(cvData.cv.fileSize / 1024).toFixed(0)} KB` : ""}
                        {cvData?.cv?.version ? ` · Version ${cvData.cv.version}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowCVPreview(true)}
                      className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                    >
                      <Eye className="w-4 h-4" />
                      Visualiser
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCVAnalyze}
                      disabled={analyzeCV.isPending}
                      className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-400"
                    >
                      {analyzeCV.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Analyser
                    </Button>
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Remplacer
                      <input type="file" accept=".pdf" onChange={handleCVUpload} className="hidden" />
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCvDeleteOpen(true)}
                      className="bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>

                {/* Parsed Data Preview */}
                {cvData?.cv?.parsedData && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Données extraites
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCvEditing(!cvEditing)}
                        className="h-auto p-0 text-xs font-medium text-primary hover:bg-transparent hover:text-primary/80"
                      >
                        {cvEditing ? "Annuler" : "Modifier"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Skills */}
                      <div className="p-3 rounded-lg bg-muted border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Compétences</p>
                        {cvEditing ? (
                          <Textarea
                            value={(cvEditData.skills || []).join(", ")}
                            onChange={(e) => setCvEditData({ ...cvEditData, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                            className="bg-card text-sm resize-none"
                            rows={3}
                          />
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {(cvData.cv.parsedData.skills || []).length > 0 ? (
                              cvData.cv.parsedData.skills.map((s, i) => (
                                <Badge key={i} variant="secondary" className="rounded-full bg-primary/10 text-primary">{s}</Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">Aucune compétence détectée</span>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Experience */}
                      <div className="p-3 rounded-lg bg-muted border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Expérience</p>
                        {cvEditing ? (
                          <Textarea
                            value={(cvEditData.experience || []).map(e => `${e.title || ""} @ ${e.company || ""} (${e.period || ""})`).join("\n")}
                            onChange={(e) => {
                              const lines = e.target.value.split("\n").filter(Boolean);
                              setCvEditData({
                                ...cvEditData,
                                experience: lines.map(line => {
                                  const parts = line.split("@");
                                  const title = parts[0]?.trim() || "";
                                  const rest = parts[1]?.trim() || "";
                                  const periodMatch = rest.match(/\((.+)\)/);
                                  return { title, company: rest.replace(/\(.+\)/, "").trim(), period: periodMatch?.[1] || "", description: "" };
                                }),
                              });
                            }}
                            className="bg-card text-sm resize-none"
                            rows={3}
                          />
                        ) : (
                          <div className="space-y-1">
                            {(cvData.cv.parsedData.experience || []).length > 0 ? (
                              cvData.cv.parsedData.experience.map((e, i) => (
                                <p key={i} className="text-xs text-foreground">
                                  <span className="font-medium">{e.title}</span>
                                  {e.company ? ` @ ${e.company}` : ""}
                                  {e.period ? <span className="text-muted-foreground"> ({e.period})</span> : ""}
                                </p>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">Aucune expérience détectée</span>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Education */}
                      <div className="p-3 rounded-lg bg-muted border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Formation</p>
                        {cvEditing ? (
                          <Textarea
                            value={(cvEditData.education || []).map(e => `${e.degree || ""} - ${e.institution || ""} (${e.year || ""})`).join("\n")}
                            onChange={(e) => {
                              const lines = e.target.value.split("\n").filter(Boolean);
                              setCvEditData({
                                ...cvEditData,
                                education: lines.map(line => {
                                  const parts = line.split(" - ");
                                  return { degree: parts[0]?.trim() || "", institution: parts[1]?.replace(/\(.+\)/, "").trim() || "", year: (parts[1]?.match(/\((.+)\)/)?.[1]) || "" };
                                }),
                              });
                            }}
                            className="bg-card text-sm resize-none"
                            rows={3}
                          />
                        ) : (
                          <div className="space-y-1">
                            {(cvData.cv.parsedData.education || []).length > 0 ? (
                              cvData.cv.parsedData.education.map((e, i) => (
                                <p key={i} className="text-xs text-foreground">
                                  <span className="font-medium">{e.degree}</span>
                                  {e.institution ? ` — ${e.institution}` : ""}
                                  {e.year ? <span className="text-muted-foreground"> ({e.year})</span> : ""}
                                </p>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">Aucune formation détectée</span>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Languages + Contact */}
                      <div className="p-3 rounded-lg bg-muted border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Langues & Contact</p>
                        {cvEditing ? (
                          <div className="space-y-2">
                            <Input
                              value={(cvEditData.languages || []).join(", ")}
                              onChange={(e) => setCvEditData({ ...cvEditData, languages: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                              placeholder="Langues (séparées par virgule)"
                              className="bg-card text-sm"
                            />
                            <Input
                              value={cvEditData.email || ""}
                              onChange={(e) => setCvEditData({ ...cvEditData, email: e.target.value })}
                              placeholder="Email"
                              className="bg-card text-sm"
                            />
                            <Input
                              value={cvEditData.phone || ""}
                              onChange={(e) => setCvEditData({ ...cvEditData, phone: e.target.value })}
                              placeholder="Téléphone"
                              className="bg-card text-sm"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {(cvData.cv.parsedData.languages || []).map((l, i) => (
                                <Badge key={i} variant="secondary" className="rounded-full bg-accent/10 text-accent">{l}</Badge>
                              ))}
                            </div>
                            {cvData.cv.parsedData.email && (
                              <p className="text-xs text-muted-foreground">{cvData.cv.parsedData.email}</p>
                            )}
                            {cvData.cv.parsedData.phone && (
                              <p className="text-xs text-muted-foreground">{cvData.cv.parsedData.phone}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {cvEditing && (
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => { setCvEditing(false); setCvEditData(cvData?.cv?.parsedData || {}); }}
                          className="bg-muted text-foreground hover:bg-muted/80 hover:text-foreground"
                        >
                          Annuler
                        </Button>
                        <Button
                          type="button"
                          variant="default"
                          onClick={handleCVEditSave}
                          className="gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          Enregistrer
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Analysis */}
                {analysis && (
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCvAnalysisExpanded(!cvAnalysisExpanded)}
                      className="flex w-full items-center justify-between gap-2 h-auto p-0 text-left hover:bg-transparent"
                    >
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Analyse Expert RH
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${
                          analysis.score >= 80 ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                          analysis.score >= 50 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                          "bg-red-500/10 text-red-500 dark:text-red-400"
                        }`}>
                          {analysis.score}/100
                        </span>
                      </h4>
                      {cvAnalysisExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </Button>

                    <AnimatePresence>
                      {cvAnalysisExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          {/* Score Bar */}
                          <div className="mb-3">
                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${analysis.score}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  analysis.score >= 80 ? "bg-green-500" :
                                  analysis.score >= 50 ? "bg-amber-500" : "bg-red-500"
                                }`}
                              />
                            </div>
                          </div>

                          {/* Strengths */}
                          {analysis.strengths?.length > 0 && (
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                              <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1.5 flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Points forts
                              </p>
                              <ul className="space-y-1">
                                {analysis.strengths.map((s, i) => (
                                  <li key={i} className="text-xs text-green-600 dark:text-green-400/80 flex items-start gap-1.5">
                                    <span className="mt-1 w-1 h-1 rounded-full bg-green-500 shrink-0" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Improvements */}
                          {analysis.improvements?.length > 0 && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 mt-2">
                              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1.5 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Points à améliorer
                              </p>
                              <ul className="space-y-1">
                                {analysis.improvements.map((s, i) => (
                                  <li key={i} className="text-xs text-red-600 dark:text-red-400/80 flex items-start gap-1.5">
                                    <span className="mt-1 w-1 h-1 rounded-full bg-red-500 shrink-0" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Suggestions */}
                          {analysis.suggestions?.length > 0 && (
                            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 mt-2">
                              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5" />
                                Suggestions d'expert
                              </p>
                              <ul className="space-y-1">
                                {analysis.suggestions.map((s, i) => (
                                  <li key={i} className="text-xs text-amber-600 dark:text-amber-400/80 flex items-start gap-1.5">
                                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/40 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {uploadCV.isPending ? "Upload en cours..." : "Uploadez votre CV (PDF)"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Analyse automatique par notre expert RH IA</p>
                  </div>
                  <input type="file" accept=".pdf" onChange={handleCVUpload} className="hidden" disabled={uploadCV.isPending} />
                </label>
                <Link
                  to="/profile/cv"
                  className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Aller à la page CV avancée
                </Link>
              </div>
            )}
          </Section>

          {/* CV Preview Dialog */}
          {showCVPreview && cvData?.cv && (
            <Dialog open={showCVPreview} onOpenChange={setShowCVPreview}>
              <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden rounded-xl bg-popover p-0">
                <DialogHeader className="border-b border-border px-5 py-3">
                  <DialogTitle className="font-semibold">{cvData.cv.originalName || "CV"}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto p-5">
                  {cvData.cv.fileData ? (
                    <iframe
                      src={cvData.cv.fileData.startsWith('data:') ? cvData.cv.fileData : `data:application/pdf;base64,${cvData.cv.fileData}`}
                      className="w-full h-[70vh] rounded-lg border border-border"
                      title="CV Preview"
                    />
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-foreground">Texte extrait du CV</h4>
                      <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-4 rounded-lg border border-border max-h-[60vh] overflow-auto font-mono">
                        {cvData.cv.extractedText || "Aucun texte extrait"}
                      </pre>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Personal Info */}
          <Section title="Informations personnelles" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Prénom"
                placeholder="Jean"
                {...register("firstName", {
                  required: "Le prénom est requis",
                })}
              />
              <FormInput
                label="Nom"
                placeholder="Dupont"
                {...register("lastName", {
                  required: "Le nom est requis",
                })}
              />
            </div>
            <div className="mt-4">
              <Label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  readOnly
                  value={watch("email") || ""}
                  className="w-full pl-10 bg-muted cursor-not-allowed text-muted-foreground text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                L'email ne peut pas être modifié directement.
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => toast("Contactez le support pour changer votre email.", { icon: "📧" })}
                  className="h-auto p-0 text-primary hover:bg-transparent hover:text-primary/80 font-medium ml-1"
                >
                  Demander un changement
                </Button>
              </p>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Téléphone"
                placeholder="+212 6 00 00 00 00"
                {...register("phone")}
              />
              <FormSelect
                label="Ville de résidence"
                options={cities}
                {...register("city")}
              />
            </div>
            <div className="mt-4">
              <FormInput
                label="Titre professionnel"
                placeholder="Développeur Full Stack, Chef de projet..."
                {...register("title")}
              />
            </div>
          </Section>

          {/* Présentation - first impression for recruiters */}
          <Section title="Ma Présentation" icon={MessageSquareQuote} badge="Première impression">
            <p className="text-sm text-muted-foreground mb-3">
              Ce paragraphe sera affiché aux recruteurs comme première impression. Écrivez-le en 2-4 phrases pour vous décrire, vos atouts et votre ambition professionnelle.
            </p>
            <Textarea
              rows={4}
              maxLength={500}
              placeholder="Ex: Développeur Full Stack passionné par les technologies web modernes, je recherche un poste stimulant où je pourrai contribuer à des projets innovants tout en développant mes compétences en architecture logicielle..."
              {...register("presentation")}
              className="resize-none leading-relaxed [field-sizing:fixed]"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {(watch("presentation") || "").length}/500 caractères
            </p>
          </Section>

          {/* Domains - from onboarding */}
          <Section title="Domaines d'intérêt" icon={BriefcaseBusiness} badge="Depuis l'onboarding">
            <p className="text-sm text-muted-foreground mb-3">
              Les domaines sélectionnés lors de l'onboarding. Vous pouvez les modifier.
            </p>
            <ChipSelect
              options={allDomains}
              selected={domains}
              onToggle={(d) => {
                setValue("domains", domains.includes(d)
                  ? domains.filter((x) => x !== d)
                  : [...domains, d]);
              }}
              columns={3}
            />
            <p className="text-xs text-muted-foreground mt-2">{domains.length} domaine(s) sélectionné(s)</p>
          </Section>

          {/* Search Keywords - from onboarding */}
          <Section title="Mots-clés de recherche" icon={Target} badge="Depuis l'onboarding">
            <p className="text-sm text-muted-foreground mb-3">
              Compétences et technologies recherchées.
            </p>
            <TagInput
              tags={searchKeywords}
              onAdd={(tag) => setValue("searchKeywords", [...searchKeywords, tag])}
              onRemove={(tag) => setValue("searchKeywords", searchKeywords.filter((s) => s !== tag))}
              placeholder="Ajouter un mot-clé..."
            />
          </Section>

          {/* Job Types - from onboarding */}
          <Section title="Types de contrat souhaités" icon={Building2} badge="Depuis l'onboarding">
            <ChipSelect
              options={allJobTypes}
              selected={jobTypes}
              onToggle={(t) => {
                setValue("jobTypes", jobTypes.includes(t)
                  ? jobTypes.filter((x) => x !== t)
                  : [...jobTypes, t]);
              }}
              columns={3}
            />
          </Section>

          {/* Preferred Locations - from onboarding */}
          <Section title="Localisations préférées" icon={MapPin} badge="Depuis l'onboarding">
            <p className="text-sm text-muted-foreground mb-3">
              Villes où vous souhaitez travailler.
            </p>
            <div className="flex flex-wrap gap-2">
              {cities.map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant={preferredLocations.includes(c) ? "default" : "outline"}
                  onClick={() => {
                    setValue("preferredLocations", preferredLocations.includes(c)
                      ? preferredLocations.filter((x) => x !== c)
                      : [...preferredLocations, c]);
                  }}
                  className={preferredLocations.includes(c)
                    ? "bg-accent text-white border-accent hover:bg-accent/90"
                    : "bg-card text-foreground border-border hover:bg-transparent hover:border-accent/30"
                  }
                >
                  {c === "Remote" ? "🌍 " : ""}{c}
                </Button>
              ))}
            </div>
          </Section>

          {/* Skills */}
          <Section title="Compétences" icon={Globe}>
            <p className="text-sm text-muted-foreground mb-3">
              Ajoutez vos compétences techniques. Elles seront utilisées pour le matching avec les offres.
            </p>
            <TagInput
              tags={skills}
              onAdd={(tag) => setValue("skills", [...skills, tag])}
              onRemove={(tag) => setValue("skills", skills.filter((s) => s !== tag))}
              placeholder="Ajouter une compétence (React, Python, SQL...)"
            />
          </Section>

          {/* Education */}
          <div className="space-y-4">
            <AnimatePresence>
              {eduFields.map((field, index) => (
                <Section
                  key={field.id}
                  title={`Formation ${index + 1}`}
                  icon={GraduationCap}
                  removable={eduFields.length > 0}
                  onRemove={() => removeEdu(index)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Institution"
                      placeholder="Université..."
                      {...register(`education.${index}.institution`)}
                    />
                    <FormInput
                      label="Diplôme"
                      placeholder="Master, Licence..."
                      {...register(`education.${index}.degree`)}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormInput
                      label="Domaine"
                      placeholder="Génie Logiciel"
                      {...register(`education.${index}.field`)}
                    />
                    <FormInput
                      label="Année de début"
                      placeholder="2019"
                      type="date"
                      {...register(`education.${index}.startDate`)}
                    />
                    <FormInput
                      label="Année de fin"
                      placeholder="2021"
                      type="date"
                      {...register(`education.${index}.endDate`)}
                    />
                  </div>
                  <div className="mt-4">
                    <Label className="block text-sm font-medium text-foreground mb-1.5">
                      Description
                    </Label>
                    <Textarea
                      rows={2}
                      placeholder="Décrivez votre parcours..."
                      {...register(`education.${index}.description`)}
                      className="resize-none [field-sizing:fixed]"
                    />
                  </div>
                </Section>
              ))}
            </AnimatePresence>
            <motion.button
              type="button"
              onClick={() =>
                appendEdu({
                  institution: "",
                  degree: "",
                  field: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                })
              }
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter une formation
            </motion.button>
          </div>

          {/* Experiences */}
          <div className="space-y-4">
            <AnimatePresence>
              {expFields.map((field, index) => (
                <Section
                  key={field.id}
                  title={`Expérience ${index + 1}`}
                  icon={Briefcase}
                  removable={expFields.length > 0}
                  onRemove={() => removeExp(index)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Entreprise"
                      placeholder="TechMaroc"
                      {...register(`experience.${index}.company`)}
                    />
                    <FormInput
                      label="Poste"
                      placeholder="Développeur Full Stack"
                      {...register(`experience.${index}.position`)}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Date de début"
                      type="date"
                      {...register(`experience.${index}.startDate`)}
                    />
                    <FormInput
                      label="Date de fin"
                      type="date"
                      {...register(`experience.${index}.endDate`)}
                    />
                  </div>
                  <div className="mt-4">
                    <Label className="block text-sm font-medium text-foreground mb-1.5">
                      Description
                    </Label>
                    <Textarea
                      rows={3}
                      placeholder="Décrivez vos missions..."
                      {...register(`experience.${index}.description`)}
                      className="resize-none [field-sizing:fixed]"
                    />
                  </div>
                </Section>
              ))}
            </AnimatePresence>
            <motion.button
              type="button"
              onClick={() =>
                appendExp({
                  company: "",
                  position: "",
                  startDate: "",
                  endDate: "",
                  isCurrent: false,
                  description: "",
                  skills: [],
                })
              }
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter une expérience
            </motion.button>
          </div>

          {/* Languages */}
          <Section title="Langues" icon={Globe}>
            <div className="space-y-3">
              {languages.map((lang, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    {...register(`languages.${index}.language`)}
                    className="flex-1 text-sm"
                    placeholder="Langue"
                  />
                  <div className="relative w-44">
                    <select
                      {...register(`languages.${index}.level`)}
                      className="w-full h-10 px-4 pr-10 rounded-lg border border-border bg-background text-foreground text-sm appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                    >
                      {languageLevels.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setValue(
                        "languages",
                        languages.filter((_, i) => i !== index)
                      )
                    }
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-50 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setValue("languages", [...languages, { language: "", level: "Intermédiaire" }])
              }
              className="mt-4 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
            >
              <Plus className="w-4 h-4" />
              Ajouter une langue
            </Button>
          </Section>

          {/* Social Links */}
          <Section title="Liens sociaux" icon={LinkIcon}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="LinkedIn"
                placeholder="https://linkedin.com/in/..."
                {...register("socialLinks.linkedin")}
              />
              <FormInput
                label="GitHub"
                placeholder="https://github.com/..."
                {...register("socialLinks.github")}
              />
              <FormInput
                label="Portfolio"
                placeholder="https://..."
                {...register("socialLinks.portfolio")}
              />
              <FormInput
                label="Site web"
                placeholder="https://..."
                {...register("socialLinks.website")}
              />
            </div>
          </Section>

          {/* Save Button */}
          <div className="sticky bottom-0 py-4 bg-background/80 backdrop-blur-xl -mx-4 px-4">
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              size="lg"
              className="w-full sm:w-auto font-semibold shadow-[var(--shadow-md)]"
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {updateProfile.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={cvDeleteOpen}
        onOpenChange={setCvDeleteOpen}
        title="Supprimer votre CV ?"
        description="Cette action est irréversible. Votre CV et ses données extraites seront définitivement supprimés."
        confirmText="Supprimer"
        onConfirm={handleCVDelete}
        icon={Trash2}
      />
    </div>
  );
}